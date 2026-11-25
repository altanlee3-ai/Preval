import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { AiError, chatReply, provider } from "@/lib/ai";
import { SAFETY_RULES } from "@/lib/claude";
import { FACTORS } from "@/lib/insights";

export const dynamic = "force-dynamic";

type F = { factor: string; lowAvg: number; highAvg: number; lowN: number; highN: number; r: number | null };
const num = (x: unknown, lo: number, hi: number) => (typeof x === "number" && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null);

/** Explains the user's habit/symptom statistics in plain words. Only aggregate numbers are received, never raw records. */
export async function POST(req: Request) {
  let body: { lang?: unknown; days?: unknown; findings?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const lang = body.lang === "th" ? "th" : "en";
  const days = num(body.days, 0, 1000) ?? 0;
  const findings: F[] = (Array.isArray(body.findings) ? body.findings : [])
    .map((f: Record<string, unknown>) => ({
      factor: String(f?.factor ?? ""),
      lowAvg: num(f?.lowAvg, 0, 10) ?? 0,
      highAvg: num(f?.highAvg, 0, 10) ?? 0,
      lowN: num(f?.lowN, 0, 1000) ?? 0,
      highN: num(f?.highN, 0, 1000) ?? 0,
      r: num(f?.r, -1, 1),
    }))
    .filter((f) => FACTORS.some((x) => x.factor === f.factor));
  if (days < 5 || !findings.length) return NextResponse.json({ error: "Not enough data yet." }, { status: 400 });

  const summary = [
    `Days analysed: ${days}. Severity = highest symptom severity logged that day (0 if none).`,
    ...findings.map((f) => {
      const x = FACTORS.find((y) => y.factor === f.factor)!;
      return `${x.label.en}: avg severity ${f.lowAvg.toFixed(1)} on ${x.low.en} days (n=${f.lowN}) vs ${f.highAvg.toFixed(1)} on ${x.high.en} days (n=${f.highN}); r=${f.r == null ? "n/a" : f.r.toFixed(2)}.`;
    }),
  ].join("\n");

  const demo = () => {
    const best = [...findings].sort((a, b) => b.lowAvg - b.highAvg - (a.lowAvg - a.highAvg))[0];
    const x = FACTORS.find((y) => y.factor === best.factor)!;
    return lang === "th"
      ? `**ตัวอย่างคำอธิบาย (โหมดสาธิต)**\n\nความสัมพันธ์ที่ชัดที่สุดในข้อมูลของคุณคือ **${x.label.th}**: วันที่${x.low.th} มีอาการเฉลี่ย ${best.lowAvg.toFixed(1)}/10 เทียบกับ ${best.highAvg.toFixed(1)}/10 ในวันที่${x.high.th}\n\n- นี่คือความสัมพันธ์ ไม่ได้พิสูจน์ว่าเป็นสาเหตุ\n- ข้อมูล ${days} วันยังน้อย ลองบันทึกต่ออีก 2–3 สัปดาห์\n- หากอาการเป็นต่อเนื่องหรือแย่ลง ควรปรึกษาบุคลากรทางการแพทย์`
      : `**Example explanation (demo mode)**\n\nThe clearest link in your data is **${x.label.en.toLowerCase()}**: on days with ${x.low.en}, your symptoms averaged ${best.lowAvg.toFixed(1)}/10, compared with ${best.highAvg.toFixed(1)}/10 on days with ${x.high.en}.\n\n- This is an association, not proof of cause.\n- ${days} days is a small sample; keep logging for 2–3 more weeks.\n- If symptoms keep coming back or get worse, talk to a health professional.`;
  };

  if (!provider()) return NextResponse.json({ mode: "demo", text: demo() });
  const limited = rateLimit(req, "insights", 3, 30);
  if (limited) return NextResponse.json({ mode: "demo", notice: limited, text: demo() });
  try {
    const res = await chatReply(
      `${SAFETY_RULES}
You explain a teenager's own habit-and-symptom statistics in ${lang === "th" ? "Thai" : "English"}.
Write under 170 words in Markdown: 1 short paragraph naming the clearest pattern with its numbers, then 3 bullet points (what it might mean in everyday terms, one small habit experiment to try for 2 weeks, and when to talk to a health professional).
Say clearly it is an association in a small sample, not a cause or a diagnosis. Don't mention medicines. Don't invent numbers that aren't given.`,
      [{ role: "user", content: summary }],
    );
    return NextResponse.json({ mode: "ai", model: res.model, text: res.text });
  } catch (e) {
    const reason = e instanceof AiError ? e.message : "Unexpected error while contacting the AI service.";
    return NextResponse.json({ mode: "demo", notice: `${reason} Showing a demonstration explanation.`, text: demo() });
  }
}
