"use client";

import { Award, Bot, Brain, FileText, Lightbulb, Printer, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Badge, Button, Card, CardHeader, LinkButton, Markdown, PageHeader, Segmented } from "@/components/ui";
import { tr } from "@/lib/i18n";
import { achievements, buildDays, FACTORS, findPatterns, type Finding } from "@/lib/insights";
import { useStore } from "@/lib/store";
import { symptomLabel } from "@/lib/symptoms";
import { cn, formatDate } from "@/lib/utils";

const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" };
const MIN_DAYS = 7;
type FactorId = Finding["factor"];

export default function InsightsPage() {
  const { settings, wellness, records, checks } = useStore();
  const lang = settings.lang;
  const th = lang === "th";
  const days = useMemo(() => buildDays(wellness, records), [wellness, records]);
  const findings = useMemo(() => findPatterns(days), [days]);
  const badges = useMemo(() => achievements(wellness, records, checks.length, !!settings.quizDone), [wellness, records, checks.length, settings.quizDone]);
  const usesDemo = wellness.some((w) => w.demo) || records.some((r) => r.demo);
  const [factor, setFactor] = useState<FactorId>("sleep");
  const [ai, setAi] = useState<{ text: string; mode: string; model?: string; notice?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const enough = days.length >= MIN_DAYS;
  const notable = findings.filter((f) => f.notable).sort((a, b) => b.lowAvg - b.highAvg - (a.lowAvg - a.highAvg));
  const f = FACTORS.find((x) => x.factor === factor)!;

  const explain = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, days: days.length, findings: findings.map(({ factor, lowAvg, highAvg, lowN, highN, r }) => ({ factor, lowAvg, highAvg, lowN, highN, r })) }),
      });
      const j = await r.json();
      setAi(j.text ? j : { text: j.error ?? "Error", mode: "demo" });
    } catch {
      setAi({ text: th ? "เชื่อมต่อไม่ได้" : "Could not connect to the app server.", mode: "demo" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Sparkles className="size-5" />}
        title={th ? "ข้อมูลเชิงลึก" : "Insights"}
        subtitle={th ? "ค้นหารูปแบบระหว่างพฤติกรรมสุขภาพกับอาการของคุณ" : "Find patterns between your daily habits and your symptoms"}
        action={
          <Button variant="outline" className="no-print" onClick={() => window.print()}>
            <Printer className="size-4" /> {th ? "พิมพ์รายงาน / PDF" : "Print report / PDF"}
          </Button>
        }
      />

      {usesDemo && (
        <p className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {th ? "มีข้อมูลตัวอย่าง (จำลอง) รวมอยู่ในการวิเคราะห์นี้" : "This analysis includes simulated demo data."}
        </p>
      )}

      <WeeklyReport />

      {/* Pattern finder */}
      <Card className="print-area">
        <CardHeader
          icon={<Brain className="size-5" />}
          title={th ? "ตัวค้นหารูปแบบ" : "Pattern finder"}
          subtitle={
            th
              ? `เปรียบเทียบความรุนแรงของอาการในวันที่ทำตามเป้าหมายกับวันที่ไม่ได้ทำ (${days.length} วันที่มีข้อมูล)`
              : `Compares symptom severity on days you met each goal with days you didn't (${days.length} days of data)`
          }
        />
        <div className="space-y-5 px-5 pb-5">
          {!enough ? (
            <div className="rounded-2xl border border-dashed border-soft p-6 text-center text-sm">
              <p className="text-muted">
                {th
                  ? `ต้องมีเช็คอินสุขภาพอย่างน้อย ${MIN_DAYS} วัน (ตอนนี้ ${days.length} วัน) ทำเช็คอินที่หน้าหลักทุกวันและบันทึกอาการเมื่อไม่สบาย`
                  : `Needs at least ${MIN_DAYS} days of wellness check-ins (you have ${days.length}). Check in on the Home page each day and log symptoms when you feel unwell.`}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <LinkButton href="/" size="sm">{th ? "ไปเช็คอิน" : "Go to check-in"}</LinkButton>
                <LinkButton href="/settings#demo" size="sm" variant="outline">{th ? "ลองด้วยข้อมูลตัวอย่าง" : "Try with demo data"}</LinkButton>
              </div>
            </div>
          ) : (
            <>
              {notable.length > 0 ? (
                <div className="rounded-2xl bg-brand-50 p-4 text-sm dark:bg-brand-500/10">
                  <p className="flex items-center gap-2 font-semibold">
                    <Lightbulb className="size-4 text-brand-600" /> {th ? "รูปแบบที่น่าสนใจ" : "What stands out"}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {notable.map((n) => (
                      <li key={n.factor}>
                        {th
                          ? `วันที่${tr(n.lowLabel, lang)} อาการเฉลี่ย ${n.lowAvg.toFixed(1)}/10 เทียบกับ ${n.highAvg.toFixed(1)}/10 ในวันที่${tr(n.highLabel, lang)}`
                          : `On days with ${n.lowLabel.en}, your symptoms averaged ${n.lowAvg.toFixed(1)}/10, compared with ${n.highAvg.toFixed(1)}/10 on days with ${n.highLabel.en}.`}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted">{th ? "ยังไม่พบความแตกต่างที่ชัดเจน บันทึกต่อไปเพื่อดูรูปแบบ" : "No clear difference found yet. Keep logging to see patterns."}</p>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {findings.map((x) => {
                  const max = Math.max(x.lowAvg, x.highAvg, 1);
                  return (
                    <div key={x.factor} className={cn("rounded-2xl border p-4", x.notable ? "border-brand-300 dark:border-brand-500/40" : "border-soft")}>
                      <p className="flex items-center justify-between text-sm font-semibold">
                        {tr(x.label, lang)}
                        <Badge tone={x.strength === "strong" ? "violet" : x.strength === "moderate" ? "blue" : "neutral"}>
                          {th ? { none: "ไม่ชัด", weak: "อ่อน", moderate: "ปานกลาง", strong: "ชัด" }[x.strength] : { none: "no link", weak: "weak", moderate: "moderate", strong: "strong" }[x.strength]}
                        </Badge>
                      </p>
                      {[
                        { l: x.lowLabel, v: x.lowAvg, n: x.lowN, c: "bg-amber-400" },
                        { l: x.highLabel, v: x.highAvg, n: x.highN, c: "bg-teal-500" },
                      ].map((row) => (
                        <div key={row.l.en} className="mt-3">
                          <div className="flex justify-between text-xs text-muted">
                            <span>
                              {tr(row.l, lang)} ({row.n} {th ? "วัน" : "d"})
                            </span>
                            <span className="font-semibold tabular-nums text-[var(--text)]">{row.n ? row.v.toFixed(1) : "–"}</span>
                          </div>
                          <div className="surface-2 mt-1 h-2 rounded-full">
                            <div className={cn("h-2 rounded-full", row.c)} style={{ width: `${row.n ? (row.v / max) * 100 : 0}%` }} />
                          </div>
                        </div>
                      ))}
                      <p className="mt-3 text-[11px] text-muted">r = {x.r == null ? "–" : x.r.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <div className="no-print flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{th ? "กราฟกระจาย: แต่ละจุดคือหนึ่งวัน" : "Scatter chart: each dot is one day"}</p>
                  <Segmented label="factor" value={factor} onChange={setFactor} options={FACTORS.map((x) => ({ value: x.factor as FactorId, label: tr(x.label, lang) }))} />
                </div>
                <div className="mt-3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey={f.key} name={tr(f.label, lang)} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} label={{ value: tr(f.label, lang), position: "insideBottom", offset: -4, fontSize: 12 }} />
                      <YAxis type="number" dataKey="severity" name={th ? "ความรุนแรง" : "Severity"} domain={[0, 10]} tickLine={false} />
                      <ZAxis range={[90, 90]} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={days} fill="#6366f1" fillOpacity={0.7} isAnimationActive={false} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-soft p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <Bot className="size-4 text-brand-600" /> {th ? "ให้ AI อธิบายรูปแบบ" : "Explain my patterns with AI"}
                  </p>
                  <Button size="sm" className="no-print" onClick={explain} disabled={loading}>
                    <Sparkles className="size-4" /> {loading ? (th ? "กำลังวิเคราะห์…" : "Analysing…") : th ? "อธิบาย" : "Explain"}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted">{th ? "ส่งเฉพาะตัวเลขสรุป ไม่ส่งบันทึกของคุณ" : "Only the summary numbers above are sent, never your records."}</p>
                {ai && (
                  <div className="mt-3 text-sm">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge tone={ai.mode === "ai" ? "green" : "amber"}>{ai.mode === "ai" ? `${th ? "AI จริง" : "Live AI"}${ai.model ? ` · ${ai.model}` : ""}` : th ? "โหมดสาธิต" : "Demonstration mode"}</Badge>
                    </div>
                    {ai.notice && <p className="mb-2 text-xs text-amber-700 dark:text-amber-300">{ai.notice}</p>}
                    <Markdown text={ai.text} />
                  </div>
                )}
              </div>

              <p className="text-xs text-muted">
                {th
                  ? "นี่คือความสัมพันธ์จากตัวอย่างขนาดเล็ก ไม่ได้บอกว่าอะไรเป็นสาเหตุ และไม่ใช่การวินิจฉัย r คือค่าสหสัมพันธ์เพียร์สัน (−1 ถึง 1)"
                  : "These are associations in a small sample. They don't show what causes what, and they aren't a diagnosis. r is the Pearson correlation (−1 to 1)."}
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Achievements */}
      <Card className="no-print">
        <CardHeader icon={<Award className="size-5" />} title={th ? "ความสำเร็จ" : "Achievements"} subtitle={`${badges.filter((b) => b.earned).length}/${badges.length} ${th ? "ปลดล็อกแล้ว" : "unlocked"}`} />
        <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => (
            <div key={b.id} className={cn("rounded-2xl border p-3 text-center", b.earned ? "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10" : "border-soft opacity-60")}>
              <div className={cn("text-3xl", !b.earned && "grayscale")}>{b.icon}</div>
              <p className="mt-1 text-sm font-semibold">{tr(b.title, lang)}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{tr(b.desc, lang)}</p>
              {!b.earned && <p className="mt-1 text-[11px] font-medium tabular-nums">{b.progress}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WeeklyReport() {
  const { settings, wellness, records, checks } = useStore();
  const lang = settings.lang;
  const th = lang === "th";
  const since = new Date(Date.now() - 6 * 86400000);
  const sinceISO = new Date(since.getTime() - since.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const w = wellness.filter((x) => x.date >= sinceISO);
  const r = records.filter((x) => x.date >= sinceISO);
  const c = checks.filter((x) => x.createdAt.slice(0, 10) >= sinceISO);
  const avg = (a: number[]) => (a.length ? (a.reduce((p, q) => p + q, 0) / a.length).toFixed(1) : "–");
  const counts = new Map<string, number>();
  r.forEach((x) => counts.set(x.symptom, (counts.get(x.symptom) ?? 0) + 1));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const MOODS = ["😣", "🙁", "😐", "🙂", "😄"];
  const moodAvg = w.length ? Math.round(w.reduce((p, q) => p + q.mood, 0) / w.length) : 0;
  const stats = [
    { l: th ? "นอนเฉลี่ย" : "Avg sleep", v: `${avg(w.map((x) => x.sleepHours))} h`, goal: "8–10 h" },
    { l: th ? "น้ำเฉลี่ย" : "Avg water", v: `${avg(w.map((x) => x.water))} ${th ? "แก้ว" : "gl"}`, goal: "6–8" },
    { l: th ? "เคลื่อนไหวเฉลี่ย" : "Avg activity", v: `${avg(w.map((x) => x.activityMin))} min`, goal: "60 min" },
    { l: th ? "อารมณ์" : "Mood", v: moodAvg ? MOODS[moodAvg - 1] : "–", goal: "" },
    { l: th ? "วันที่มีอาการ" : "Days with symptoms", v: String(new Set(r.map((x) => x.date)).size), goal: "" },
    { l: th ? "การตรวจอาการ" : "Symptom checks", v: String(c.length), goal: "" },
  ];
  return (
    <Card className="print-area">
      <CardHeader
        icon={<FileText className="size-5" />}
        title={th ? "รายงานสุขภาพ 7 วัน" : "7-day health report"}
        subtitle={`${formatDate(sinceISO, lang)} – ${formatDate(new Date().toISOString(), lang)} · ${w.length} ${th ? "วันที่เช็คอิน" : "check-in days"}`}
      />
      <div className="space-y-4 px-5 pb-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.l} className="surface-2 rounded-xl p-3">
              <p className="text-xs text-muted">{s.l}</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{s.v}</p>
              {s.goal && <p className="text-[11px] text-muted">{th ? "เป้าหมาย" : "Goal"} {s.goal}</p>}
            </div>
          ))}
        </div>
        <p className="text-sm">
          <span className="font-semibold">{th ? "อาการที่พบบ่อย: " : "Most logged symptoms: "}</span>
          {top.length ? top.map(([id, n]) => `${symptomLabel(id) ? tr(symptomLabel(id)!, lang) : id} (${n})`).join(", ") : th ? "ไม่มี" : "none"}
        </p>
        <p className="text-xs text-muted">
          {th
            ? "สร้างโดย Preval (ต้นแบบเพื่อการศึกษา) ไม่ใช่การวินิจฉัย นำรายงานนี้ไปคุยกับบุคลากรทางการแพทย์ได้"
            : "Made with Preval (educational prototype). Not a diagnosis. You can bring this report to a health professional."}{" "}
          <Link href="/tracker" className="no-print underline">{th ? "ดูบันทึกทั้งหมด" : "See all records"}</Link>
        </p>
      </div>
    </Card>
  );
}
