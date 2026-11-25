import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { AiError, chatReply, provider } from "@/lib/ai";
import { SAFETY_RULES } from "@/lib/claude";
import { demoChatAnswer } from "@/lib/demoChat";
import { detectTextFlags } from "@/lib/triage";

export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  let body: { messages?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const lang = body.lang === "th" ? "th" : "en";
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: Msg[] = raw
    .filter((m): m is Msg => !!m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-12);
  while (messages.length && messages[0].role !== "user") messages.shift();
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) return NextResponse.json({ error: "Please type a question." }, { status: 400 });

  const flags = detectTextFlags(last.content);
  const started = Date.now();

  if (!provider()) {
    return NextResponse.json({ mode: "demo", reply: demoChatAnswer(last.content, lang), flags, ms: Date.now() - started });
  }
  const limited = rateLimit(req, "chat", 10, 150);
  if (limited) return NextResponse.json({ mode: "demo", notice: `${limited} Showing a demonstration answer.`, reply: demoChatAnswer(last.content, lang), flags, ms: Date.now() - started });
  try {
    const res = await chatReply(
      `${SAFETY_RULES}
You are the friendly health-education assistant. Answer general health questions clearly in ${lang === "th" ? "Thai" : "English"} (or the language the user writes in).
Keep answers under about 200 words, use short Markdown lists and **bold** for key points, and mention a reputable public source by name (WHO, CDC, NHS, Thai DDC) when useful.
If a question asks for a diagnosis or personal treatment, explain kindly that you can't provide that and suggest who can help.`,
      messages,
    );
    const reply = res.text;
    return NextResponse.json({ mode: "ai", model: res.model, reply, flags, ms: Date.now() - started });
  } catch (e) {
    const reason = e instanceof AiError ? e.message : "Unexpected error while contacting the AI service.";
    return NextResponse.json({ mode: "demo", notice: `${reason} Showing a demonstration answer.`, reply: demoChatAnswer(last.content, lang), flags, ms: Date.now() - started });
  }
}
