"use client";

import { AnimatePresence, motion } from "motion/react";
import { Bot, Eraser, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmergencyBox } from "@/components/health";
import { Badge, Button, Card, Markdown, PageHeader } from "@/components/ui";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useAiStatus } from "@/lib/useAiStatus";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; mode?: "ai" | "demo"; notice?: string; flags?: string[] };

const SUGGESTIONS = {
  en: ["What are common causes of headaches?", "How can I reduce my risk of getting sick?", "What are some healthy habits?", "When should someone seek medical advice?", "How do I protect myself from dengue?", "What should I do on high PM2.5 days?"],
  th: ["สาเหตุที่พบบ่อยของอาการปวดศีรษะคืออะไร?", "ฉันจะลดความเสี่ยงการเจ็บป่วยได้อย่างไร?", "นิสัยสุขภาพดีมีอะไรบ้าง?", "เมื่อไรควรไปพบแพทย์?", "ป้องกันไข้เลือดออกอย่างไร?", "ควรทำอย่างไรในวันที่ฝุ่น PM2.5 สูง?"],
};

export default function AssistantPage() {
  const { settings, toast } = useStore();
  const lang = settings.lang;
  const ai = useAiStatus();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    if (q.length > 2000) return toast(lang === "th" ? "ข้อความยาวเกินไป" : "Message is too long (max 2000 characters)", "warn");
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang, messages: history.map(({ role, content }) => ({ role, content })) }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: j.reply, mode: j.mode, notice: j.notice, flags: j.flags }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: lang === "th" ? "ขออภัย ไม่สามารถตอบได้ในขณะนี้ โปรดลองอีกครั้ง" : "Sorry — I couldn't answer just now. Please try again.", mode: "demo", notice: e instanceof Error ? e.message : undefined },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[520px] flex-col lg:h-[calc(100dvh-9rem)]">
      <PageHeader
        icon={<Bot className="size-5" />}
        title={lang === "th" ? "ผู้ช่วยความรู้สุขภาพ" : "AI Health Assistant"}
        subtitle={lang === "th" ? "ถามคำถามความรู้สุขภาพทั่วไป — ไม่สามารถแทนบุคลากรทางการแพทย์" : "Ask general health-education questions — it can't replace a medical professional."}
        action={
          <div className="flex items-center gap-2">
            {ai && (ai.ai ? <Badge tone="green">{t("live_ai", lang)}</Badge> : <Badge tone="amber">{t("demo_mode", lang)}</Badge>)}
            <Button variant="outline" size="sm" onClick={() => setMessages([])} disabled={!messages.length}>
              <Eraser className="size-4" /> {lang === "th" ? "ล้างแชท" : "Clear"}
            </Button>
          </div>
        }
      />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {!messages.length && (
            <div className="mx-auto max-w-xl py-6 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-teal-450 text-white shadow-lg shadow-brand-500/30">
                <Sparkles className="size-8" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{lang === "th" ? "สวัสดี! อยากรู้อะไรเกี่ยวกับสุขภาพ?" : "Hi! What would you like to learn about?"}</h2>
              <p className="mt-1 text-sm text-muted">
                {ai && !ai.ai
                  ? lang === "th"
                    ? "โหมดสาธิต: ตอบคำถามทั่วไปบางข้อด้วยคำตอบที่เขียนไว้ล่วงหน้า"
                    : "Demonstration mode: answers a set of common questions with pre-written responses."
                  : lang === "th"
                    ? "คำตอบเป็นความรู้ทั่วไป ไม่ใช่คำแนะนำทางการแพทย์ส่วนบุคคล"
                    : "Answers are general education, not personal medical advice."}
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS[lang].map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-2xl border border-soft p-3 text-left text-sm transition hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-brand-500/10">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <div className={cn("grid size-8 shrink-0 place-items-center rounded-full", m.role === "user" ? "bg-slate-200 dark:bg-slate-700" : "bg-gradient-to-br from-brand-500 to-teal-450 text-white")}>
                  {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                </div>
                <div className={cn("max-w-[85%] space-y-2", m.role === "user" && "items-end")}>
                  {m.flags && m.flags.length > 0 && (
                    <EmergencyBox lang={lang}>
                      {m.flags.includes("self_harm") && <p className="mt-1">{lang === "th" ? "สายด่วนสุขภาพจิต 1323 (24 ชม.)" : "Thailand Mental Health Hotline: 1323 (24 h)."}</p>}
                    </EmergencyBox>
                  )}
                  <div className={cn("rounded-2xl px-4 py-3", m.role === "user" ? "rounded-tr-md bg-brand-600 text-white" : "surface-2 rounded-tl-md")}>
                    {m.role === "user" ? <p className="whitespace-pre-wrap text-[0.95rem]">{m.content}</p> : <Markdown text={m.content} />}
                  </div>
                  {m.role === "assistant" && (
                    <p className="px-1 text-[11px] text-muted">
                      {m.mode === "ai" ? (lang === "th" ? "ตอบโดย AI · ตรวจสอบข้อมูลสำคัญกับผู้เชี่ยวชาญเสมอ" : "AI-generated · always check important information with a professional") : `${t("demo_mode", lang)} · ${lang === "th" ? "คำตอบที่เขียนไว้ล่วงหน้า" : "pre-written answer"}`}
                      {m.notice && ` · ${m.notice}`}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <div className="flex gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-teal-450 text-white">
                <Bot className="size-4" />
              </div>
              <div className="surface-2 flex items-center gap-1 rounded-2xl rounded-tl-md px-4 py-3" aria-label="Assistant is typing">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="size-2 rounded-full bg-brand-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-soft p-3 sm:p-4"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder={lang === "th" ? "พิมพ์คำถามของคุณ…" : "Type your question…"}
              aria-label="Message"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-soft surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
            />
            <Button type="submit" disabled={busy || !input.trim()} className="h-11 w-11 px-0" aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted">{t("disclaimer_short", lang)}</p>
        </form>
      </Card>
    </div>
  );
}
