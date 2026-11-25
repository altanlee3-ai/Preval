import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { AiError, chatReply, modelName, provider } from "@/lib/ai";
import { envFileProblems, envFilesFound } from "@/lib/envfile";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const KEYS = ["GEMINI_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"] as const;

/** AI status plus key diagnostics. Never returns key values, only whether each key is present. */
export async function GET(req: Request) {
  const p = provider();
  const body: Record<string, unknown> = {
    ai: Boolean(p),
    provider: p,
    model: modelName(),
    keysFound: KEYS.filter((k) => process.env[k]?.trim()),
    files: envFilesFound,
    problems: [
      ...envFileProblems,
      ...(process.env.GEMINI_API_KEY && /^sk-/.test(process.env.GEMINI_API_KEY.trim()) ? ["GEMINI_API_KEY looks like an OpenAI key (sk-...). Use a key from aistudio.google.com"] : []),
    ],
    folder: process.env.RENDER ? undefined : process.cwd(), // don't show server paths on the public website
    version: (() => {
      try {
        return fs.readFileSync(path.join(process.cwd(), "VERSION"), "utf8").trim();
      } catch {
        return "dev";
      }
    })(),
  };
  if (new URL(req.url).searchParams.get("test") === "1") {
    const limited = rateLimit(req, "status-test", 2, 20);
    if (limited) body.test = { ok: false, message: limited };
    else if (!p) body.test = { ok: false, message: "No AI key was found." };
    else {
      const started = Date.now();
      try {
        const r = await chatReply("You are a connection test. Reply with the single word OK.", [{ role: "user", content: "ping" }]);
        body.test = { ok: true, message: `Connected to ${r.model} in ${Date.now() - started} ms.` };
        body.model = modelName();
      } catch (e) {
        body.test = { ok: false, message: e instanceof AiError ? e.message : "Unexpected error while contacting the AI service." };
      }
    }
  }
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
