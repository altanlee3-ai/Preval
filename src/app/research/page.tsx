"use client";

import { CheckCircle2, ClipboardCheck, Database, Download, FlaskConical, Gauge as GaugeIcon, Lightbulb, ListChecks, Play, Square, Target, Timer, Trash2, TriangleAlert, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Button, Card, CardHeader, Field, inputCls, PageHeader } from "@/components/ui";
import { tr, type L } from "@/lib/i18n";
import { useStore, type SurveyResponse, type UsabilityResult } from "@/lib/store";
import { cn } from "@/lib/utils";

const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" };

const OBJECTIVES: L[] = [
  { en: "Help ordinary people recognise possible health risks earlier and understand their symptoms.", th: "ช่วยให้คนทั่วไปรับรู้ความเสี่ยงด้านสุขภาพได้เร็วขึ้นและเข้าใจอาการของตนเอง" },
  { en: "Combine symptom information with environmental and public-health data in one accessible interface.", th: "รวมข้อมูลอาการกับข้อมูลสิ่งแวดล้อมและสาธารณสุขไว้ในหน้าจอเดียวที่เข้าถึงง่าย" },
  { en: "Provide clear, evidence-based prevention guidance and advice on when to seek care.", th: "ให้คำแนะนำการป้องกันที่ชัดเจนตามหลักฐาน และบอกว่าเมื่อไรควรพบแพทย์" },
  { en: "Evaluate usability, stability and scientific reliability with real users.", th: "ประเมินความใช้งานง่าย ความเสถียร และความน่าเชื่อถือทางวิทยาศาสตร์กับผู้ใช้จริง" },
];

const PHASES = [
  { t: { en: "Phase 1 — Research", th: "ระยะที่ 1 — การวิจัย" }, d: { en: "Compare existing health apps and identify limitations.", th: "เปรียบเทียบแอปสุขภาพที่มีอยู่และหาข้อจำกัด" }, status: "done" },
  { t: { en: "Phase 2 — Development", th: "ระยะที่ 2 — การพัฒนา" }, d: { en: "Build the interface, analysis system and preventive-guidance backend.", th: "สร้างหน้าจอ ระบบวิเคราะห์ และระบบหลังบ้านสำหรับคำแนะนำ" }, status: "done" },
  { t: { en: "Phase 3 — Evaluation", th: "ระยะที่ 3 — การประเมินผล" }, d: { en: "Test usability, stability and scientific reliability.", th: "ทดสอบความใช้งานง่าย ความเสถียร และความน่าเชื่อถือ" }, status: "active" },
];

const COMPARISON: { type: L; strengths: L; limits: L; ours: L }[] = [
  {
    type: { en: "Symptom-checker apps", th: "แอปตรวจอาการ" },
    strengths: { en: "Guided questions, triage advice", th: "คำถามนำทาง คำแนะนำการคัดกรอง" },
    limits: { en: "Often English-only; little environmental context; scoring rarely explained", th: "มักมีแค่ภาษาอังกฤษ ไม่มีข้อมูลสิ่งแวดล้อม ไม่อธิบายการให้คะแนน" },
    ours: { en: "Thai + English; shows which factors raised the level", th: "ไทย + อังกฤษ แสดงปัจจัยที่ทำให้ระดับสูงขึ้น" },
  },
  {
    type: { en: "Fitness & wellbeing trackers", th: "แอปติดตามฟิตเนส" },
    strengths: { en: "Habit tracking, charts", th: "ติดตามนิสัย กราฟ" },
    limits: { en: "Focus on exercise, not illness prevention or when to seek care", th: "เน้นการออกกำลังกาย ไม่เน้นการป้องกันโรคหรือการพบแพทย์" },
    ours: { en: "Symptom log + summary for a health professional", th: "บันทึกอาการ + สรุปสำหรับบุคลากรทางการแพทย์" },
  },
  {
    type: { en: "Air-quality & weather apps", th: "แอปคุณภาพอากาศและสภาพอากาศ" },
    strengths: { en: "Live AQI and forecasts", th: "AQI และพยากรณ์แบบสด" },
    limits: { en: "Numbers without simple health actions", th: "มีตัวเลขแต่ไม่มีคำแนะนำสุขภาพที่ง่าย" },
    ours: { en: "Turns AQI, heat and UV into plain-language advice", th: "แปลง AQI ความร้อน และยูวีเป็นคำแนะนำที่เข้าใจง่าย" },
  },
  {
    type: { en: "Official health websites", th: "เว็บไซต์สุขภาพทางการ" },
    strengths: { en: "Trusted, detailed information", th: "เชื่อถือได้ ละเอียด" },
    limits: { en: "Hard to navigate; not personalised; long text", th: "ใช้งานยาก ไม่ปรับตามบุคคล ข้อความยาว" },
    ours: { en: "Short cards linking back to WHO/CDC/NHS sources", th: "การ์ดสั้นพร้อมลิงก์ไปยัง WHO/CDC/NHS" },
  },
];

const FEATURES: { f: L; href: string }[] = [
  { f: { en: "AI symptom analyzer with rule-based safety levels", th: "ตัววิเคราะห์อาการด้วย AI พร้อมระดับความปลอดภัยตามกฎ" }, href: "/analyze" },
  { f: { en: "Explainable health-risk indicator (4 categories)", th: "ตัวบ่งชี้ความเสี่ยงที่อธิบายได้ (4 ระดับ)" }, href: "/analyze" },
  { f: { en: "Environmental dashboard with live data (Open-Meteo)", th: "แดชบอร์ดสิ่งแวดล้อมพร้อมข้อมูลจริง" }, href: "/environment" },
  { f: { en: "Disease trends from WHO GHO + official warning sources", th: "แนวโน้มโรคจาก WHO + แหล่งคำเตือนทางการ" }, href: "/trends" },
  { f: { en: "Symptom tracker, charts and shareable summary", th: "ตัวติดตามอาการ กราฟ และสรุปที่แชร์ได้" }, href: "/tracker" },
  { f: { en: "AI health assistant (chat)", th: "ผู้ช่วยสุขภาพ AI (แชท)" }, href: "/assistant" },
  { f: { en: "Prevention center + knowledge check", th: "ศูนย์การป้องกัน + แบบทดสอบความรู้" }, href: "/prevention" },
  { f: { en: "Privacy controls, consent, Thai/English, dark mode, PWA", th: "การควบคุมความเป็นส่วนตัว ความยินยอม ไทย/อังกฤษ โหมดมืด PWA" }, href: "/settings" },
];

const SUS_ITEMS: L[] = [
  { en: "I think I would like to use this app frequently.", th: "ฉันคิดว่าอยากใช้แอปนี้บ่อย ๆ" },
  { en: "I found the app unnecessarily complex.", th: "ฉันพบว่าแอปซับซ้อนเกินจำเป็น" },
  { en: "I thought the app was easy to use.", th: "ฉันคิดว่าแอปใช้งานง่าย" },
  { en: "I think I would need help from a technical person to use it.", th: "ฉันคิดว่าต้องมีคนช่วยถึงจะใช้ได้" },
  { en: "The various functions were well integrated.", th: "ฟังก์ชันต่าง ๆ เชื่อมโยงกันได้ดี" },
  { en: "There was too much inconsistency in the app.", th: "แอปมีความไม่สอดคล้องกันมากเกินไป" },
  { en: "Most people would learn to use this app very quickly.", th: "คนส่วนใหญ่จะเรียนรู้การใช้แอปนี้ได้เร็ว" },
  { en: "I found the app very cumbersome to use.", th: "ฉันพบว่าแอปใช้งานยุ่งยาก" },
  { en: "I felt very confident using the app.", th: "ฉันรู้สึกมั่นใจในการใช้แอป" },
  { en: "I needed to learn a lot before I could get going.", th: "ฉันต้องเรียนรู้หลายอย่างก่อนเริ่มใช้งาน" },
];

const TASKS: { id: string; label: L }[] = [
  { id: "symptom_check", label: { en: "Complete a symptom check", th: "ตรวจอาการให้เสร็จ" } },
  { id: "log_record", label: { en: "Log a symptom in the tracker", th: "บันทึกอาการในตัวติดตาม" } },
  { id: "find_prevention", label: { en: "Find hand-hygiene advice", th: "หาคำแนะนำการล้างมือ" } },
  { id: "change_language", label: { en: "Switch the language to Thai", th: "เปลี่ยนภาษาเป็นไทย" } },
  { id: "delete_data", label: { en: "Find where to delete your data", th: "หาที่ลบข้อมูลของคุณ" } },
];

const susScore = (a: number[]) => a.reduce((s, v, i) => s + (i % 2 === 0 ? v - 1 : 5 - v), 0) * 2.5;

export default function ResearchPage() {
  const { settings, survey, usability, loadDemoResearch, clearResearch } = useStore();
  const lang = settings.lang;
  const th = lang === "th";
  const hasDemo = survey.some((s) => s.demo) || usability.some((u) => u.demo);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FlaskConical className="size-5" />}
        title={th ? "การวิจัยและการประเมินผล" : "Project Research & Evaluation"}
        subtitle={th ? "การป้องกันโรคด้วยแอปพลิเคชันและการวิเคราะห์ด้วย AI — โครงงาน STEAM" : "Prevention of Illness Using an App Interface and AI Analysis — STEAM project"}
        action={
          <div className="flex flex-wrap gap-2">
            {!hasDemo ? (
              <Button variant="outline" size="sm" onClick={loadDemoResearch}>
                <Database className="size-4" /> {th ? "โหลดข้อมูลตัวอย่าง" : "Load demo results"}
              </Button>
            ) : (
              <Badge tone="amber">{th ? "มีข้อมูลตัวอย่าง (จำลอง)" : "Includes simulated demo results"}</Badge>
            )}
            {(survey.length > 0 || usability.length > 0) && (
              <Button variant="ghost" size="sm" onClick={clearResearch}>
                <Trash2 className="size-4" /> {th ? "ล้าง" : "Clear"}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader icon={<Target className="size-5" />} title={th ? "วัตถุประสงค์การวิจัย" : "Research objectives"} />
          <ol className="space-y-3 px-5 pb-5">
            {OBJECTIVES.map((o, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
                {tr(o, lang)}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader icon={<ListChecks className="size-5" />} title={th ? "ระยะการพัฒนา" : "Development phases"} />
          <ol className="relative space-y-5 px-5 pb-5">
            {PHASES.map((p, i) => (
              <li key={i} className="relative flex gap-3">
                <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full", p.status === "done" ? "bg-teal-500 text-white" : "bg-amber-400 text-white ring-4 ring-amber-200 dark:ring-amber-500/30")}>
                  {p.status === "done" ? <CheckCircle2 className="size-4" /> : <span className="size-2 rounded-full bg-white" />}
                </span>
                <div>
                  <p className="text-sm font-semibold">{tr(p.t, lang)}</p>
                  <p className="text-xs text-muted">{tr(p.d, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<Lightbulb className="size-5" />} title={th ? "ระยะที่ 1: เปรียบเทียบประเภทแอปที่มีอยู่" : "Phase 1: Comparing existing app types"} subtitle={th ? "สรุปจากการสำรวจทั่วไป ไม่ได้ประเมินผลิตภัณฑ์ใดโดยเฉพาะ" : "A general summary by category, not an evaluation of any specific product"} />
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 pr-3">{th ? "ประเภท" : "Type"}</th>
                <th className="py-2 pr-3">{th ? "จุดแข็ง" : "Strengths"}</th>
                <th className="py-2 pr-3">{th ? "ข้อจำกัด" : "Limitations"}</th>
                <th className="py-2">{th ? "PreventAI ตอบโจทย์อย่างไร" : "How PreventAI responds"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {COMPARISON.map((c, i) => (
                <tr key={i}>
                  <td className="py-3 pr-3 font-medium">{tr(c.type, lang)}</td>
                  <td className="py-3 pr-3 text-muted">{tr(c.strengths, lang)}</td>
                  <td className="py-3 pr-3 text-muted">{tr(c.limits, lang)}</td>
                  <td className="py-3 text-teal-700 dark:text-teal-300">{tr(c.ours, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<ClipboardCheck className="size-5" />} title={th ? "ระยะที่ 2: ฟังก์ชันของต้นแบบ" : "Phase 2: Prototype functionality"} />
        <ul className="grid gap-2 px-5 pb-5 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <li key={i}>
              <Link href={f.href} className="flex items-center gap-2.5 rounded-xl border border-soft p-3 text-sm transition hover:border-brand-300">
                <CheckCircle2 className="size-4 shrink-0 text-teal-500" /> {tr(f.f, lang)}
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="pt-2 text-xl font-bold tracking-tight">{th ? "ระยะที่ 3: การประเมินผล" : "Phase 3: Evaluation"}</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <SurveyCard lang={lang} survey={survey} />
        <UsabilityCard lang={lang} results={usability} />
      </div>
      <PerformanceCard lang={lang} />

      <Card>
        <CardHeader icon={<TriangleAlert className="size-5" />} title={th ? "ข้อจำกัดที่ทราบ" : "Known limitations"} />
        <ul className="grid gap-2 px-5 pb-5 text-sm md:grid-cols-2">
          {(th
            ? [
                "ระดับความกังวลเป็นกฎที่ออกแบบให้ระมัดระวัง ยังไม่ผ่านการตรวจสอบทางคลินิก",
                "AI อาจสร้างข้อมูลผิดพลาด จึงมีกฎความปลอดภัยที่ AI ลดระดับไม่ได้",
                "โหมดสาธิตครอบคลุมเพียงกลุ่มอาการทั่วไปไม่กี่แบบ",
                "ไม่มีฟีดคำเตือนการระบาดอย่างเป็นทางการแบบเรียลไทม์",
                "ข้อมูล WHO เป็นรายปีระดับประเทศ ไม่ใช่ระดับท้องถิ่น",
                "กลุ่มตัวอย่างการประเมินมีขนาดเล็ก (นักเรียน ครู ผู้ปกครอง)",
                "ข้อมูลเก็บในเบราว์เซอร์ หากล้างข้อมูลเบราว์เซอร์ ข้อมูลจะหาย",
                "ไบโอมาร์กเกอร์และไมโครไบโอมเป็นแนวคิดการวิจัยในอนาคต",
              ]
            : [
                "Concern levels use conservative rules that have not been clinically validated.",
                "AI can produce errors, so the safety rules can never be lowered by the AI.",
                "Demonstration mode covers only a handful of common symptom patterns.",
                "No real-time official outbreak alert feed is connected.",
                "WHO data is annual and national, not local.",
                "Small evaluation sample (students, teachers, parents).",
                "Data lives in the browser; clearing browser data removes it.",
                "Biomarkers and microbiome analysis remain future research concepts.",
              ]
          ).map((x) => (
            <li key={x} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
              {x}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function SurveyCard({ lang, survey }: { lang: "en" | "th"; survey: SurveyResponse[] }) {
  const { addSurvey, toast } = useStore();
  const th = lang === "th";
  const [role, setRole] = useState("");
  const [sus, setSus] = useState<(number | null)[]>(SUS_ITEMS.map(() => null));
  const [usefulness, setUsefulness] = useState(0);
  const [trust, setTrust] = useState(0);
  const [comments, setComments] = useState("");
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);

  const scores = survey.map((s) => susScore(s.sus));
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const buckets = [
    { name: "<50", min: 0, max: 50, color: "#ef4444" },
    { name: "50–68", min: 50, max: 68, color: "#f59e0b" },
    { name: "68–80", min: 68, max: 80.3, color: "#3b93f6" },
    { name: "80+", min: 80.3, max: 101, color: "#10b981" },
  ].map((b) => ({ ...b, count: scores.filter((s) => s >= b.min && s < b.max).length }));

  const submit = () => {
    if (!role) return setErr(th ? "โปรดเลือกบทบาท" : "Please choose a role.");
    if (sus.some((x) => x == null)) return setErr(th ? "โปรดตอบทุกข้อ" : "Please answer all 10 statements.");
    if (!usefulness || !trust) return setErr(th ? "โปรดให้คะแนนประโยชน์และความน่าเชื่อถือ" : "Please rate usefulness and trust.");
    addSurvey({ role, sus: sus as number[], usefulness, trust, comments: comments.trim().slice(0, 500) });
    setSus(SUS_ITEMS.map(() => null));
    setUsefulness(0);
    setTrust(0);
    setComments("");
    setRole("");
    setErr("");
    setShowForm(false);
    toast(th ? "ขอบคุณสำหรับความคิดเห็น!" : "Thanks for your feedback!");
  };

  const exportCsv = () => {
    const head = ["created_at", "role", ...SUS_ITEMS.map((_, i) => `sus_q${i + 1}`), "sus_score", "usefulness", "trust", "comments", "demo"];
    const rows = survey.map((s) => [s.createdAt, s.role, ...s.sus, susScore(s.sus), s.usefulness, s.trust, `"${s.comments.replace(/"/g, '""')}"`, s.demo ? "yes" : "no"]);
    const blob = new Blob([[head, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "survey-results.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Card>
      <CardHeader
        icon={<Users className="size-5" />}
        title={th ? "แบบสำรวจความคิดเห็นผู้ใช้ (SUS)" : "User feedback survey (SUS)"}
        subtitle={th ? "System Usability Scale มาตรฐาน 10 ข้อ" : "Standard 10-item System Usability Scale"}
        action={
          survey.length ? (
            <Button variant="ghost" size="sm" onClick={exportCsv}>
              <Download className="size-4" /> CSV
            </Button>
          ) : null
        }
      />
      <div className="space-y-4 px-5 pb-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="surface-2 rounded-xl p-3">
            <p className="text-2xl font-bold tabular-nums">{survey.length}</p>
            <p className="text-xs text-muted">{th ? "ผู้ตอบ" : "responses"}</p>
          </div>
          <div className="surface-2 rounded-xl p-3">
            <p className="text-2xl font-bold tabular-nums">{avg == null ? "—" : avg.toFixed(1)}</p>
            <p className="text-xs text-muted">{th ? "คะแนน SUS เฉลี่ย" : "avg. SUS score"}</p>
          </div>
          <div className="surface-2 rounded-xl p-3">
            <p className="text-2xl font-bold tabular-nums">{survey.length ? (survey.reduce((a, s) => a + s.usefulness, 0) / survey.length).toFixed(1) : "—"}</p>
            <p className="text-xs text-muted">{th ? "ประโยชน์ /5" : "usefulness /5"}</p>
          </div>
        </div>
        {survey.length > 0 && (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-2)" }} />
                <Bar dataKey="count" name={th ? "ผู้ตอบ" : "Responses"} radius={[6, 6, 0, 0]}>
                  {buckets.map((b) => (
                    <Cell key={b.name} fill={b.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="text-xs text-muted">{th ? "คะแนน SUS มากกว่า 68 ถือว่าสูงกว่าค่าเฉลี่ยโดยทั่วไป (Sauro, 2011)" : "A SUS score above 68 is generally considered above average (Sauro, 2011)."}</p>

        {!showForm ? (
          <Button className="w-full" onClick={() => setShowForm(true)}>
            {th ? "ตอบแบบสำรวจ" : "Take the survey"}
          </Button>
        ) : (
          <div className="space-y-4 rounded-2xl border border-soft p-4">
            <Field label={th ? "บทบาท" : "Your role"} htmlFor="role">
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                <option value="">{th ? "— เลือก —" : "— Choose —"}</option>
                {["Student", "Teacher", "Parent", "Health professional", "Other"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] text-muted">
                <span>1 = {th ? "ไม่เห็นด้วยอย่างยิ่ง" : "strongly disagree"}</span>
                <span>5 = {th ? "เห็นด้วยอย่างยิ่ง" : "strongly agree"}</span>
              </div>
              {SUS_ITEMS.map((q, i) => (
                <div key={i}>
                  <p className="text-sm">
                    {i + 1}. {tr(q, lang)}
                  </p>
                  <Likert value={sus[i]} onChange={(v) => setSus((s) => s.map((x, j) => (j === i ? v : x)))} name={`sus${i}`} />
                </div>
              ))}
              <div>
                <p className="text-sm">{th ? "แอปนี้มีประโยชน์ต่อการป้องกันโรคแค่ไหน?" : "How useful is the app for illness prevention?"}</p>
                <Likert value={usefulness || null} onChange={setUsefulness} name="useful" />
              </div>
              <div>
                <p className="text-sm">{th ? "คุณเชื่อถือความปลอดภัยของคำแนะนำแค่ไหน?" : "How much do you trust the safety of its guidance?"}</p>
                <Likert value={trust || null} onChange={setTrust} name="trust" />
              </div>
            </div>
            <Field label={th ? "ความคิดเห็น (ไม่บังคับ)" : "Comments (optional)"} htmlFor="cm">
              <textarea id="cm" rows={2} maxLength={500} value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls} />
            </Field>
            {err && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{err}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                {th ? "ยกเลิก" : "Cancel"}
              </Button>
              <Button className="flex-1" onClick={submit}>
                {th ? "ส่งแบบสำรวจ" : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function Likert({ value, onChange, name }: { value: number | null; onChange: (v: number) => void; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="mt-1.5 grid grid-cols-5 gap-1.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn("rounded-lg border py-1.5 text-sm font-medium transition", value === v ? "border-brand-500 bg-brand-600 text-white" : "border-soft hover:border-brand-300")}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function UsabilityCard({ lang, results }: { lang: "en" | "th"; results: UsabilityResult[] }) {
  const { addUsability, toast } = useStore();
  const th = lang === "th";
  const [task, setTask] = useState(TASKS[0].id);
  const [start, setStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const begin = () => {
    const s = Date.now();
    setStart(s);
    setElapsed(0);
    timer.current = setInterval(() => setElapsed((Date.now() - s) / 1000), 100);
  };
  const stop = (success: boolean) => {
    if (timer.current) clearInterval(timer.current);
    if (start != null) {
      const secs = Math.round((Date.now() - start) / 100) / 10;
      addUsability({ task, seconds: secs, success });
      toast(th ? `บันทึก ${secs} วินาที` : `Recorded ${secs}s (${success ? "success" : "not completed"})`);
    }
    setStart(null);
  };

  const data = TASKS.map((t) => {
    const rs = results.filter((r) => r.task === t.id);
    return { name: tr(t.label, lang), avg: rs.length ? +(rs.reduce((a, r) => a + r.seconds, 0) / rs.length).toFixed(1) : 0, success: rs.length ? Math.round((rs.filter((r) => r.success).length / rs.length) * 100) : 0, n: rs.length };
  });

  return (
    <Card>
      <CardHeader icon={<Timer className="size-5" />} title={th ? "การทดสอบความใช้งานง่าย" : "Usability testing"} subtitle={th ? "จับเวลาผู้ทดสอบขณะทำงานที่กำหนด" : "Time a tester completing set tasks"} />
      <div className="space-y-4 px-5 pb-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select value={task} onChange={(e) => setTask(e.target.value)} disabled={start != null} className={cn(inputCls, "flex-1")} aria-label="Task">
            {TASKS.map((t) => (
              <option key={t.id} value={t.id}>
                {tr(t.label, lang)}
              </option>
            ))}
          </select>
          {start == null ? (
            <Button onClick={begin}>
              <Play className="size-4" /> {th ? "เริ่ม" : "Start"}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => stop(true)} className="bg-none bg-teal-600 hover:bg-teal-700">
                <CheckCircle2 className="size-4" /> {th ? "สำเร็จ" : "Done"}
              </Button>
              <Button variant="outline" onClick={() => stop(false)}>
                <Square className="size-4" /> {th ? "ไม่สำเร็จ" : "Gave up"}
              </Button>
            </div>
          )}
        </div>
        {start != null && <p className="text-center text-4xl font-bold tabular-nums text-brand-600">{elapsed.toFixed(1)}s</p>}
        <div className="h-52">
          {results.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit="s" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-2)" }} formatter={(v, n, p) => [`${v}s · ${p.payload.success}% ${th ? "สำเร็จ" : "success"} · n=${p.payload.n}`, th ? "เวลาเฉลี่ย" : "Avg time"]} />
                <Bar dataKey="avg" fill="#1fb5a8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="grid h-full place-items-center text-center text-sm text-muted">{th ? "ยังไม่มีผลการทดสอบ" : "No test sessions recorded yet."}</p>
          )}
        </div>
        {results.length > 0 && (
          <p className="text-xs text-muted">
            {th ? "อัตราความสำเร็จรวม" : "Overall task success"}: <strong>{Math.round((results.filter((r) => r.success).length / results.length) * 100)}%</strong> · n={results.length}
          </p>
        )}
      </div>
    </Card>
  );
}

type Perf = { label: string; value: string; ok: boolean }[];

function PerformanceCard({ lang }: { lang: "en" | "th" }) {
  const th = lang === "th";
  const [perf, setPerf] = useState<Perf | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    const out: Perf = [];
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) out.push({ label: th ? "เวลาโหลดหน้า" : "Page load (DOM ready)", value: `${Math.round(nav.domContentLoadedEventEnd)} ms`, ok: nav.domContentLoadedEventEnd < 3000 });
    const t0 = performance.now();
    try {
      const r = await fetch("/api/status", { cache: "no-store" });
      const j = await r.json();
      out.push({ label: th ? "เวลาตอบสนอง API" : "API response time", value: `${Math.round(performance.now() - t0)} ms`, ok: r.ok });
      out.push({ label: th ? "โหมด AI" : "AI mode", value: j.ai ? `Live (${j.model})` : "Demo", ok: true });
    } catch {
      out.push({ label: th ? "เวลาตอบสนอง API" : "API response time", value: "failed", ok: false });
    }
    const t1 = performance.now();
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symptoms: ["cough", "sore_throat"], redFlags: [], description: "", durationId: "1to3", severity: 3, context: [], lang }) });
      const j = await r.json();
      out.push({ label: th ? "ทดสอบการวิเคราะห์ (ตัวอย่าง)" : "Analysis pipeline test", value: `${Math.round(performance.now() - t1)} ms · ${j.mode}`, ok: r.ok && j.finalLevel === 0 });
    } catch {
      out.push({ label: th ? "ทดสอบการวิเคราะห์" : "Analysis pipeline test", value: "failed", ok: false });
    }
    const t2 = performance.now();
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symptoms: [], redFlags: ["chest_pain"], description: "", durationId: "lt1", severity: 5, context: [], lang }) });
      const j = await r.json();
      out.push({ label: th ? "ทดสอบความปลอดภัย: เจ็บหน้าอก → เร่งด่วน" : "Safety test: chest pain → Urgent", value: `${j.finalLevel === 3 ? "PASS" : "FAIL"} · ${Math.round(performance.now() - t2)} ms`, ok: j.finalLevel === 3 });
    } catch {
      out.push({ label: "Safety test", value: "failed", ok: false });
    }
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symptoms: [] }) });
      out.push({ label: th ? "ทดสอบข้อมูลไม่ถูกต้อง → ปฏิเสธ" : "Invalid input → rejected", value: r.status === 400 ? "PASS (400)" : `FAIL (${r.status})`, ok: r.status === 400 });
    } catch {
      /* ignore */
    }
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)!;
        if (k.startsWith("pa.")) bytes += (localStorage.getItem(k) ?? "").length * 2;
      }
    } catch {
      /* ignore */
    }
    out.push({ label: th ? "พื้นที่จัดเก็บในเครื่อง" : "Local storage used", value: `${(bytes / 1024).toFixed(1)} KB`, ok: bytes < 4_000_000 });
    const sw = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
    out.push({ label: th ? "ใช้งานออฟไลน์ (PWA)" : "Offline support (PWA service worker)", value: sw ? (th ? "เปิดใช้งาน" : "Active") : th ? "ไม่ทำงาน (โหมด dev)" : "Not active (dev mode)", ok: !!sw });
    out.push({ label: th ? "ขนาดหน้าจอ" : "Viewport", value: `${window.innerWidth}×${window.innerHeight}`, ok: true });
    setPerf(out);
    setRunning(false);
  };

  return (
    <Card>
      <CardHeader
        icon={<GaugeIcon className="size-5" />}
        title={th ? "ประสิทธิภาพและความเสถียรของระบบ" : "System performance & stability"}
        subtitle={th ? "วัดผลจริงบนอุปกรณ์นี้" : "Measured live on this device"}
        action={
          <Button size="sm" onClick={run} disabled={running}>
            <Play className="size-4" /> {running ? (th ? "กำลังทดสอบ…" : "Running…") : th ? "รันการทดสอบ" : "Run checks"}
          </Button>
        }
      />
      <div className="px-5 pb-5">
        {perf ? (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {perf.map((p) => (
              <li key={p.label} className="surface-2 flex items-center justify-between gap-3 rounded-xl p-3 text-sm">
                <span className="text-muted">{p.label}</span>
                <span className={cn("shrink-0 font-semibold tabular-nums", p.ok ? "text-teal-600 dark:text-teal-400" : "text-red-600")}>{p.value}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{th ? "กด “รันการทดสอบ” เพื่อวัดเวลาโหลด เวลาตอบสนอง API และทดสอบกฎความปลอดภัย" : "Press “Run checks” to measure load time and API latency, and to test the safety rules."}</p>
        )}
      </div>
    </Card>
  );
}
