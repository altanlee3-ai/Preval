import "server-only";
import { errorMessage as anthropicError, getClient, MODEL as CLAUDE_MODEL } from "./claude";
import { ensureEnv } from "./envfile";

/**
 * AI provider selection (server-side only). Order: AI_PROVIDER if set and its key exists,
 * otherwise Claude (ANTHROPIC_API_KEY), then Google Gemini (GEMINI_API_KEY, free tier available),
 * then OpenAI (OPENAI_API_KEY). With no key the app runs in demonstration mode.
 */
export type Provider = "anthropic" | "gemini" | "openai";

const OPENAI_MODEL = () => process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
/** "gemini-flash-latest" is Google's alias for the newest Flash model; the others are fallbacks if it is unavailable. */
const GEMINI_MODELS = () => {
  const own = process.env.GEMINI_MODEL?.trim();
  return [...new Set([own || "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"])];
};
let geminiWorking: string | null = null;

const KEYS: Record<Provider, string> = { anthropic: "ANTHROPIC_API_KEY", gemini: "GEMINI_API_KEY", openai: "OPENAI_API_KEY" };
const hasKey = (p: Provider) => !!process.env[KEYS[p]]?.trim();

export function provider(): Provider | null {
  ensureEnv();
  const want = process.env.AI_PROVIDER?.trim().toLowerCase() as Provider | undefined;
  if (want && want in KEYS && hasKey(want)) return want;
  return (["anthropic", "gemini", "openai"] as const).find(hasKey) ?? null;
}

export function modelName() {
  const p = provider();
  return p === "anthropic" ? CLAUDE_MODEL : p === "openai" ? OPENAI_MODEL() : p === "gemini" ? (geminiWorking ?? GEMINI_MODELS()[0]) : null;
}

export class AiError extends Error {}

type ChatMsg = { role: "user" | "assistant"; content: string };

async function openai(body: Record<string, unknown>) {
  let r: Response;
  try {
    r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY!.trim()}` },
      body: JSON.stringify({ model: OPENAI_MODEL(), ...body }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    throw new AiError(`Could not reach the AI service: ${networkReason(e, 60)}.`);
  }
  if (r.status === 401) throw new AiError("The AI key was rejected (check OPENAI_API_KEY).");
  if (r.status === 429) throw new AiError("The AI service is busy or out of credit (rate limit / quota).");
  if (!r.ok) throw new AiError(`AI service error (${r.status}).`);
  const j = (await r.json()) as { model?: string; choices?: { message?: { content?: string | null; refusal?: string | null } }[] };
  const msg = j.choices?.[0]?.message;
  if (msg?.refusal) throw new AiError("The AI declined this request.");
  const text = msg?.content?.trim();
  if (!text) throw new AiError("The AI returned an empty answer.");
  return { text, model: j.model ?? OPENAI_MODEL() };
}

type GeminiBody = { contents: unknown[]; systemInstruction: unknown; generationConfig: Record<string, unknown> };

/** Explains a failed fetch in plain words (timeout, DNS, proxy/firewall, TLS…). */
function networkReason(e: unknown, seconds: number): string {
  const err = e as { name?: string; message?: string; cause?: { code?: string; message?: string } };
  if (err?.name === "TimeoutError" || err?.name === "AbortError") return `the AI took longer than ${seconds} s to answer (timeout)`;
  const code = err?.cause?.code ?? "";
  const detail = err?.cause?.message ?? err?.message ?? "unknown";
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return `could not find Google's server (no internet or DNS problem, ${code})`;
  if (code === "ECONNREFUSED" || code === "ECONNRESET" || code === "UND_ERR_SOCKET") return `the connection was blocked or cut (firewall, school/office network or VPN?, ${code})`;
  if (code === "UND_ERR_CONNECT_TIMEOUT" || code === "ETIMEDOUT") return `the connection to Google timed out (${code})`;
  if (/certificate|SSL|TLS/i.test(detail) || /CERT|SSL/.test(code)) return `a security certificate problem (antivirus or network filter?, ${code || detail})`;
  return `network error: ${code ? code + " " : ""}${detail}`.slice(0, 200);
}

type CallResult = { r: Response } | { netError: string; timeout: boolean };

async function geminiCall(model: string, body: GeminiBody, seconds: number): Promise<CallResult> {
  try {
    const r = await fetch(`${process.env.GEMINI_API_BASE?.trim() || "https://generativelanguage.googleapis.com"}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY!.trim() },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(seconds * 1000),
    });
    return { r };
  } catch (e) {
    const reason = networkReason(e, seconds);
    console.error(`[PreventAI] Gemini ${model}: ${reason}`);
    return { netError: reason, timeout: reason.includes("timeout") || reason.includes("timed out") };
  }
}

/** Google Gemini (AI Studio key). Tries the configured model, then fallbacks if one is busy, slow or unavailable. */
async function gemini(system: string, messages: ChatMsg[], generationConfig: Record<string, unknown>) {
  const base: GeminiBody = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig,
  };
  // Keep "thinking" short so answers come back quickly (Gemini 3 uses thinkingLevel, 2.5 uses thinkingBudget).
  const fast = (model: string): GeminiBody => ({
    ...base,
    generationConfig: { ...generationConfig, thinkingConfig: /(^|-)2\.5-/.test(model) ? { thinkingBudget: 0 } : { thinkingLevel: "low" } },
  });
  const plain = (): GeminiBody => {
    const { responseJsonSchema: _drop, ...rest } = generationConfig;
    void _drop;
    return { ...base, generationConfig: rest };
  };
  const models = geminiWorking ? [geminiWorking, ...GEMINI_MODELS().filter((m) => m !== geminiWorking)] : GEMINI_MODELS();
  const problems: string[] = [];
  for (const model of models) {
    let res = await geminiCall(model, fast(model), 45);
    // 400: the model rejected an option (thinking setting or JSON schema). Retry with the simplest request.
    if ("r" in res && res.r.status === 400) {
      const t = await res.r.text();
      if (/API_KEY_INVALID|API key not valid/i.test(t)) throw new AiError("The AI key was rejected (check GEMINI_API_KEY).");
      res = await geminiCall(model, plain(), 45);
    }
    if ("r" in res && res.r.status >= 500) {
      await new Promise((ok) => setTimeout(ok, 1500)); // busy (often 503): wait and retry once
      res = await geminiCall(model, plain(), 45);
    }
    if ("netError" in res) {
      problems.push(`${model}: ${res.netError}`);
      if (!res.timeout) break; // a blocked connection won't work for the other models either
      continue;
    }
    const r = res.r;
    if (r.status === 401) throw new AiError("The AI key was rejected (check GEMINI_API_KEY).");
    if (r.status === 400 || r.status === 403) {
      const t = await r.text();
      if (/API_KEY_INVALID|API key not valid|PERMISSION_DENIED|SERVICE_DISABLED/i.test(t)) throw new AiError(`The AI key was rejected or not enabled for Gemini (${r.status}).`);
      const msg = (() => { try { return (JSON.parse(t) as { error?: { message?: string } }).error?.message ?? ""; } catch { return ""; } })();
      problems.push(`${model}: error ${r.status}${msg ? ` (${msg.slice(0, 120)})` : ""}`);
      continue;
    }
    if (r.status === 404 || r.status === 429 || r.status >= 500) {
      problems.push(`${model}: ${r.status === 429 ? "free limit reached (429)" : r.status === 404 ? "model not available (404)" : `Google busy (${r.status})`}`);
      continue;
    }
    if (!r.ok) {
      problems.push(`${model}: error ${r.status}`);
      continue;
    }
    const j = (await r.json()) as {
      modelVersion?: string;
      promptFeedback?: { blockReason?: string };
      candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
    };
    if (j.promptFeedback?.blockReason) throw new AiError("The AI declined this request.");
    const c = j.candidates?.[0];
    if (c?.finishReason === "SAFETY" || c?.finishReason === "PROHIBITED_CONTENT") throw new AiError("The AI declined this request.");
    const text = (c?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
    if (!text) {
      problems.push(`${model}: ${c?.finishReason === "MAX_TOKENS" ? "answer was cut off" : "empty answer"}`);
      continue;
    }
    geminiWorking = model;
    return { text, model: j.modelVersion ?? model };
  }
  throw new AiError(`Gemini did not answer. ${problems.join("; ") || "No model was available for this key."}`);
}

/** Returns JSON text that matches `schema`. */
export async function generateJSON(system: string, user: string, schema: Record<string, unknown>) {
  if (provider() === "gemini") {
    return gemini(system + "\n\nReply with a single JSON object only.", [{ role: "user", content: user }], {
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseJsonSchema: schema,
    });
  }
  if (provider() === "openai") {
    return openai({
      max_tokens: 3000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_schema", json_schema: { name: "health_overview", strict: true, schema } },
    });
  }
  try {
    const res = await getClient().beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: user }],
    });
    if (res.stop_reason === "refusal") throw new AiError("The AI declined this request.");
    return { text: res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(""), model: res.model };
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError(anthropicError(e));
  }
}

export async function chatReply(system: string, messages: ChatMsg[]) {
  if (provider() === "gemini") return gemini(system, messages, { maxOutputTokens: 4096 });
  if (provider() === "openai") {
    return openai({ max_tokens: 1200, messages: [{ role: "system", content: system }, ...messages] });
  }
  try {
    const res = await getClient().beta.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system,
      messages,
    });
    if (res.stop_reason === "refusal") throw new AiError("The AI declined this request.");
    const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("").trim();
    if (!text) throw new AiError("The AI returned an empty answer.");
    return { text, model: res.model };
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError(anthropicError(e));
  }
}
