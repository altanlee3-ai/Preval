"use client";

import { motion } from "motion/react";
import { Activity, Apple, ArrowRight, BedDouble, CheckCircle2, ExternalLink, HandHeart, Leaf, ShieldCheck, Stethoscope, Syringe, XCircle, Brain, ChevronDown, Cross } from "lucide-react";
import { useEffect, useState } from "react";
import { FIRST_AID } from "@/lib/firstAid";
import { BreathingCard } from "@/components/Breathing";
import { Button, Card, CardHeader, Dialog, Item, PageHeader, Stagger } from "@/components/ui";
import { tr, type L } from "@/lib/i18n";
import { TOPICS, type Topic } from "@/lib/prevention";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICONS: Record<Topic["icon"], React.ComponentType<{ className?: string }>> = {
  hands: HandHeart,
  sleep: BedDouble,
  food: Apple,
  activity: Activity,
  vaccine: Syringe,
  shield: ShieldCheck,
  leaf: Leaf,
  stethoscope: Stethoscope,
};

const QUIZ: { q: L; options: L[]; answer: number; why: L }[] = [
  {
    q: { en: "How long should you wash your hands with soap?", th: "ควรล้างมือด้วยสบู่นานเท่าไร?" },
    options: [
      { en: "5 seconds", th: "5 วินาที" },
      { en: "At least 20 seconds", th: "อย่างน้อย 20 วินาที" },
      { en: "2 minutes", th: "2 นาที" },
    ],
    answer: 1,
    why: { en: "WHO and CDC recommend at least 20 seconds of scrubbing.", th: "WHO และ CDC แนะนำให้ถูอย่างน้อย 20 วินาที" },
  },
  {
    q: { en: "How much sleep do most teenagers need?", th: "วัยรุ่นส่วนใหญ่ต้องการนอนกี่ชั่วโมง?" },
    options: [
      { en: "5–6 hours", th: "5–6 ชั่วโมง" },
      { en: "6–7 hours", th: "6–7 ชั่วโมง" },
      { en: "8–10 hours", th: "8–10 ชั่วโมง" },
    ],
    answer: 2,
    why: { en: "Sleep experts recommend 8–10 hours for ages 13–18.", th: "ผู้เชี่ยวชาญแนะนำ 8–10 ชั่วโมงสำหรับอายุ 13–18 ปี" },
  },
  {
    q: { en: "Which is the best way to reduce dengue mosquitoes at home?", th: "วิธีใดดีที่สุดในการลดยุงลายที่บ้าน?" },
    options: [
      { en: "Remove standing water every week", th: "กำจัดน้ำขังทุกสัปดาห์" },
      { en: "Keep lights on at night", th: "เปิดไฟตอนกลางคืน" },
      { en: "Drink more water", th: "ดื่มน้ำมากขึ้น" },
    ],
    answer: 0,
    why: { en: "Aedes mosquitoes breed in clean standing water in containers.", th: "ยุงลายวางไข่ในน้ำนิ่งที่สะอาดในภาชนะ" },
  },
  {
    q: { en: "When the AQI is above 150, you should…", th: "เมื่อค่า AQI เกิน 150 ควร…" },
    options: [
      { en: "Exercise outdoors as normal", th: "ออกกำลังกายกลางแจ้งตามปกติ" },
      { en: "Reduce long or intense outdoor activity", th: "ลดกิจกรรมกลางแจ้งที่นานหรือหนัก" },
      { en: "Open all the windows", th: "เปิดหน้าต่างทุกบาน" },
    ],
    answer: 1,
    why: { en: "AQI 151–200 is 'Unhealthy' for everyone (US EPA).", th: "AQI 151–200 อยู่ในระดับมีผลต่อสุขภาพทุกคน (US EPA)" },
  },
];

export default function PreventionPage() {
  const { settings, updateSettings } = useStore();
  const lang = settings.lang;
  const [open, setOpen] = useState<Topic | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const score = answers.filter((a, i) => a === QUIZ[i].answer).length;
  const done = answers.every((a) => a != null);
  useEffect(() => {
    if (done && !settings.quizDone) updateSettings({ quizDone: true });
  }, [done, settings.quizDone, updateSettings]);

  return (
    <div className="space-y-8">
      <PageHeader
        icon={<ShieldCheck className="size-5" />}
        title={lang === "th" ? "ศูนย์การป้องกัน" : "Prevention Center"}
        subtitle={lang === "th" ? "ความรู้ที่อิงหลักฐานจากแหล่งสาธารณสุขที่น่าเชื่อถือ — ช่วยลดความเสี่ยง แต่ไม่รับประกันว่าจะไม่ป่วย" : "Evidence-based basics from trusted public health sources. These lower risk — they can't guarantee you won't get ill."}
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map((tp) => {
          const I = ICONS[tp.icon];
          return (
            <Item key={tp.id}>
              <motion.button whileHover={{ y: -4 }} onClick={() => setOpen(tp)} className="surface group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-soft text-left shadow-sm transition-shadow hover:shadow-xl">
                <div className={cn("relative h-28 bg-gradient-to-br", tp.color)}>
                  <div className="absolute -right-6 -top-6 size-28 rounded-full bg-white/15" />
                  <div className="absolute -bottom-8 left-10 size-20 rounded-full bg-white/10" />
                  <I className="absolute bottom-4 left-4 size-10 text-white drop-shadow" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-semibold">{tr(tp.title, lang)}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted">{tr(tp.summary, lang)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 dark:text-brand-400">
                    {lang === "th" ? "เรียนรู้เพิ่มเติม" : "Learn more"} <ArrowRight className="size-4 transition-all" />
                  </span>
                </div>
              </motion.button>
            </Item>
          );
        })}
      </Stagger>

      <div id="breathing" className="scroll-mt-24">
        <BreathingCard />
      </div>

      <Card>
        <CardHeader
          icon={<Cross className="size-5" />}
          title={lang === "th" ? "ปฐมพยาบาลเบื้องต้น" : "First aid basics"}
          subtitle={lang === "th" ? "ขั้นตอนง่าย ๆ จากสภากาชาดไทยและ NHS ไม่ใช่สิ่งทดแทนการเรียนปฐมพยาบาล" : "Simple steps based on Thai Red Cross and NHS guidance. Not a substitute for a first-aid course."}
        />
        <div className="grid gap-3 px-5 pb-5 md:grid-cols-2">
          {FIRST_AID.map((f) => (
            <details key={f.id} className="surface-2 group rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold">
                {tr(f.title, lang)}
                <ChevronDown className="size-4 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                {f.steps.map((st, i) => (
                  <li key={i}>{tr(st, lang)}</li>
                ))}
              </ol>
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900 dark:bg-red-500/10 dark:text-red-100">
                <span className="font-semibold">{lang === "th" ? "ขอความช่วยเหลือเมื่อ: " : "Get help if: "}</span>
                {tr(f.call, lang)}
              </p>
            </details>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Brain className="size-5" />} title={lang === "th" ? "ทดสอบความรู้" : "Quick knowledge check"} subtitle={lang === "th" ? "4 คำถาม — ไม่มีการบันทึกคะแนน" : "4 questions — scores aren't saved"} />
        <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
          {QUIZ.map((q, qi) => (
            <div key={qi} className="surface-2 rounded-2xl p-4">
              <p className="text-sm font-semibold">
                {qi + 1}. {tr(q.q, lang)}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((o, oi) => {
                  const chosen = answers[qi] === oi;
                  const reveal = answers[qi] != null;
                  const correct = oi === q.answer;
                  return (
                    <button
                      key={oi}
                      disabled={reveal}
                      onClick={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition",
                        !reveal && "surface border-soft hover:border-brand-300",
                        reveal && correct && "border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200",
                        reveal && chosen && !correct && "border-red-400 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200",
                        reveal && !chosen && !correct && "border-soft opacity-60",
                      )}
                    >
                      {tr(o, lang)}
                      {reveal && correct && <CheckCircle2 className="size-4" />}
                      {reveal && chosen && !correct && <XCircle className="size-4" />}
                    </button>
                  );
                })}
              </div>
              {answers[qi] != null && <p className="mt-2 text-xs text-muted">{tr(q.why, lang)}</p>}
            </div>
          ))}
        </div>
        {done && (
          <div className="flex items-center justify-between border-t border-soft px-5 py-4">
            <p className="font-semibold">
              {lang === "th" ? "คะแนน" : "Score"}: {score}/{QUIZ.length} {score === QUIZ.length ? "🎉" : ""}
            </p>
            <Button variant="outline" size="sm" onClick={() => setAnswers(QUIZ.map(() => null))}>
              {lang === "th" ? "ลองอีกครั้ง" : "Try again"}
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={!!open} onClose={() => setOpen(null)} title={open ? tr(open.title, lang) : ""}>
        {open && (
          <div className="space-y-4">
            <p className="text-sm text-muted">{tr(open.summary, lang)}</p>
            <ul className="space-y-2.5">
              {open.points.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-500" />
                  {tr(p, lang)}
                </li>
              ))}
            </ul>
            {open.myth && (
              <div className="rounded-xl bg-brand-50 p-3 text-sm dark:bg-brand-500/10">
                <p className="font-semibold">
                  {lang === "th" ? "ความเชื่อผิด ๆ" : "Myth check"}: {tr(open.myth.q, lang)}
                </p>
                <p className="mt-1 text-muted">{tr(open.myth.a, lang)}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{lang === "th" ? "แหล่งที่มา" : "Sources"}</p>
              <ul className="mt-1 space-y-1">
                {open.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400">
                      {s.name} <ExternalLink className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
