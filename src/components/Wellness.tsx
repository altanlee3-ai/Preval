"use client";

import { Droplets, Footprints, HeartHandshake, Minus, Moon, Pencil, Plus, Smile } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore, type WellnessEntry } from "@/lib/store";
import { cn, formatDate, todayISO } from "@/lib/utils";
import { Badge, Button, Card, CardHeader } from "./ui";

const MOODS = ["😣", "🙁", "😐", "🙂", "😄"];
const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" };

function Stepper({ label, icon, value, onChange, step, min, max, unit }: { label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void; step: number; min: number; max: number; unit: string }) {
  return (
    <div className="surface-2 rounded-2xl p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
        {icon} {label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))} className="surface grid size-8 place-items-center rounded-lg border border-soft">
          <Minus className="size-4" />
        </button>
        <span className="text-lg font-bold tabular-nums">
          {value}
          <span className="ml-0.5 text-xs font-medium text-muted">{unit}</span>
        </span>
        <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))} className="surface grid size-8 place-items-center rounded-lg border border-soft">
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Daily wellness check-in (sleep, water, activity, mood) with gentle, guideline-based feedback and a 7-day chart. */
export function WellnessCard() {
  const { settings, wellness, saveWellness, toast } = useStore();
  const th = settings.lang === "th";
  const today = todayISO();
  const todays = wellness.find((w) => w.date === today);
  const [editing, setEditing] = useState(!todays);
  const [draft, setDraft] = useState<WellnessEntry>(todays ?? { date: today, sleepHours: 8, water: 6, activityMin: 30, mood: 0 });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (todays) {
      setDraft(todays);
      setEditing(false);
    }
  }, [todays]);

  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        const w = wellness.find((x) => x.date === iso);
        return { label: formatDate(iso, settings.lang, { weekday: "short" }), sleep: w?.sleepHours ?? null, activity: w?.activityMin ?? null, mood: w?.mood ?? null };
      }),
    [wellness, settings.lang],
  );
  const hasDemo = wellness.some((w) => w.demo);
  const streak = useMemo(() => {
    const dates = new Set(wellness.map((w) => w.date));
    const d = new Date();
    const iso = () => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (!dates.has(iso())) d.setDate(d.getDate() - 1); // today not logged yet: count up to yesterday
    let n = 0;
    while (dates.has(iso())) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }, [wellness]);

  const save = () => {
    if (!draft.mood) return setErr(th ? "เลือกอารมณ์ของคุณวันนี้" : "Pick how you feel today");
    setErr("");
    saveWellness({ ...draft, date: today });
    setEditing(false);
    toast(th ? "บันทึกเช็คอินวันนี้แล้ว" : "Today's check-in saved");
  };

  const tips: string[] = [];
  if (todays && !editing) {
    if (todays.sleepHours < 8) tips.push(th ? "วัยรุ่นควรนอน 8–10 ชั่วโมง ลองเข้านอนเร็วขึ้นคืนนี้" : "Teens need 8–10 h of sleep. Try an earlier bedtime tonight.");
    if (todays.activityMin < 60) tips.push(th ? `อีก ${60 - todays.activityMin} นาทีจะครบเป้า 60 นาทีของ WHO` : `${60 - todays.activityMin} more minutes reaches the WHO 60-minute goal.`);
    if (todays.water < 6) tips.push(th ? "ดื่มน้ำเพิ่มอีกสักแก้ว โดยเฉพาะวันที่อากาศร้อน" : "Have another glass of water, especially on hot days.");
    if (todays.mood <= 2) tips.push(th ? "วันนี้ดูเหนื่อย ลองฝึกหายใจในหน้าการป้องกัน คุยกับคนที่ไว้ใจ หรือโทร 1323 หากต้องการคนรับฟัง" : "Rough day? Try the breathing exercise in Prevention, talk to someone you trust, or call 1323 if you need someone to listen.");
    if (!tips.length) tips.push(th ? "เยี่ยมมาก! ทำได้ตามเป้าทุกข้อวันนี้" : "Great job — you met every goal today!");
  }

  return (
    <Card className="h-full">
      <CardHeader
        icon={<HeartHandshake className="size-5" />}
        title={th ? "เช็คอินสุขภาพประจำวัน" : "Daily wellness check-in"}
        subtitle={
          (th ? "การนอน น้ำ การเคลื่อนไหว และอารมณ์" : "Sleep, water, activity and mood") +
          (streak >= 2 ? (th ? ` · 🔥 ต่อเนื่อง ${streak} วัน` : ` · 🔥 ${streak}-day streak`) : "")
        }
        action={
          <div className="flex items-center gap-2">
            {hasDemo && <Badge tone="amber">{th ? "มีข้อมูลตัวอย่าง" : "Includes demo"}</Badge>}
            {todays && !editing && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Pencil className="size-4" /> {th ? "แก้ไข" : "Edit"}
              </Button>
            )}
          </div>
        }
      />
      <div className="grid gap-5 px-5 pb-5 md:grid-cols-2">
        <div>
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Stepper label={th ? "นอน" : "Sleep"} icon={<Moon className="size-3.5" />} value={draft.sleepHours} onChange={(v) => setDraft({ ...draft, sleepHours: v })} step={0.5} min={0} max={16} unit="h" />
                <Stepper label={th ? "น้ำ" : "Water"} icon={<Droplets className="size-3.5" />} value={draft.water} onChange={(v) => setDraft({ ...draft, water: v })} step={1} min={0} max={20} unit={th ? "แก้ว" : "gl"} />
                <Stepper label={th ? "เคลื่อนไหว" : "Active"} icon={<Footprints className="size-3.5" />} value={draft.activityMin} onChange={(v) => setDraft({ ...draft, activityMin: v })} step={10} min={0} max={300} unit="min" />
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  <Smile className="size-3.5" /> {th ? "วันนี้รู้สึกอย่างไร?" : "How do you feel today?"}
                </p>
                <div className="mt-2 grid grid-cols-5 gap-2" role="radiogroup" aria-label="Mood">
                  {MOODS.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={draft.mood === i + 1}
                      aria-label={`Mood ${i + 1} of 5`}
                      onClick={() => setDraft({ ...draft, mood: i + 1 })}
                      className={cn("rounded-xl border py-2 text-2xl transition", draft.mood === i + 1 ? "scale-105 border-brand-500 bg-brand-50 dark:bg-brand-500/15" : "border-soft hover:border-brand-300")}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              {err && (
                <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                  {err}
                </p>
              )}
              <Button className="w-full" onClick={save}>
                {th ? "บันทึกเช็คอิน" : "Save check-in"}
              </Button>
            </div>
          ) : todays ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { v: `${todays.sleepHours}h`, l: th ? "นอน" : "sleep", ok: todays.sleepHours >= 8 },
                  { v: todays.water, l: th ? "แก้ว" : "glasses", ok: todays.water >= 6 },
                  { v: `${todays.activityMin}m`, l: th ? "เคลื่อนไหว" : "active", ok: todays.activityMin >= 60 },
                  { v: MOODS[todays.mood - 1], l: th ? "อารมณ์" : "mood", ok: todays.mood >= 3 },
                ].map((x) => (
                  <div key={x.l} className={cn("rounded-xl p-2.5", x.ok ? "bg-emerald-50 dark:bg-emerald-500/10" : "surface-2")}>
                    <p className="text-lg font-bold tabular-nums">{x.v}</p>
                    <p className="text-[11px] text-muted">{x.l}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-1.5 text-sm">
                {tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-500" /> {t}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-muted">{th ? "เป้าหมายอ้างอิง: WHO (กิจกรรม), AASM (การนอนวัยรุ่น)" : "Goals based on WHO (activity) and AASM (teen sleep) guidance."}</p>
            </div>
          ) : null}
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={week} margin={{ top: 5, right: 0, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis yAxisId="s" domain={[0, 12]} tickLine={false} axisLine={false} />
              <YAxis yAxisId="a" orientation="right" domain={[0, 120]} hide />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-2)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine yAxisId="s" y={8} stroke="#6366f1" strokeDasharray="4 4" />
              <Bar yAxisId="a" dataKey="activity" name={th ? "เคลื่อนไหว (นาที)" : "Activity (min)"} fill="#1fb5a8" radius={[6, 6, 0, 0]} opacity={0.7} />
              <Line yAxisId="s" dataKey="sleep" name={th ? "นอน (ชม.)" : "Sleep (h)"} stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
