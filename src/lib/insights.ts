import type { L } from "./i18n";
import type { SymptomRecord, WellnessEntry } from "./store";

/**
 * Pattern finder. Simple, explainable statistics on the user's own records:
 * compares symptom severity on days that met a wellness goal with days that didn't,
 * and measures how strongly each habit moves with symptoms (Pearson r).
 * These are associations in a small sample, never causes.
 */
export interface DayRow {
  date: string;
  sleep: number;
  water: number;
  activity: number;
  mood: number;
  severity: number; // highest symptom severity that day, 0 = none logged
}

export interface Finding {
  factor: "sleep" | "water" | "activity" | "mood";
  label: L;
  lowLabel: L;
  highLabel: L;
  lowAvg: number;
  highAvg: number;
  lowN: number;
  highN: number;
  r: number | null;
  strength: "none" | "weak" | "moderate" | "strong";
  notable: boolean;
}

export const FACTORS = [
  { factor: "sleep", key: "sleep", goal: 8, label: { en: "Sleep", th: "การนอน" }, low: { en: "under 8 h sleep", th: "นอนน้อยกว่า 8 ชม." }, high: { en: "8 h+ sleep", th: "นอน 8 ชม.ขึ้นไป" } },
  { factor: "water", key: "water", goal: 6, label: { en: "Water", th: "การดื่มน้ำ" }, low: { en: "under 6 glasses", th: "น้ำน้อยกว่า 6 แก้ว" }, high: { en: "6+ glasses", th: "น้ำ 6 แก้วขึ้นไป" } },
  { factor: "activity", key: "activity", goal: 60, label: { en: "Activity", th: "การเคลื่อนไหว" }, low: { en: "under 60 min active", th: "เคลื่อนไหวน้อยกว่า 60 นาที" }, high: { en: "60+ min active", th: "เคลื่อนไหว 60 นาทีขึ้นไป" } },
  { factor: "mood", key: "mood", goal: 3, label: { en: "Mood", th: "อารมณ์" }, low: { en: "low-mood days", th: "วันที่อารมณ์ไม่ดี" }, high: { en: "OK-mood days", th: "วันที่อารมณ์ปกติ" } },
] as const;

export function buildDays(wellness: WellnessEntry[], records: SymptomRecord[]): DayRow[] {
  const sev = new Map<string, number>();
  for (const r of records) sev.set(r.date, Math.max(sev.get(r.date) ?? 0, r.severity));
  return wellness
    .map((w) => ({ date: w.date, sleep: w.sleepHours, water: w.water, activity: w.activityMin, mood: w.mood, severity: sev.get(w.date) ?? 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function pearson(xs: number[], ys: number[]): number | null {
  const n = xs.length;
  if (n < 5) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  if (!sxx || !syy) return null;
  return sxy / Math.sqrt(sxx * syy);
}

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const strengthOf = (r: number | null): Finding["strength"] => {
  const a = Math.abs(r ?? 0);
  return a >= 0.6 ? "strong" : a >= 0.4 ? "moderate" : a >= 0.2 ? "weak" : "none";
};

export function findPatterns(days: DayRow[]): Finding[] {
  return FACTORS.map((f) => {
    const val = (d: DayRow) => d[f.key];
    const low = days.filter((d) => val(d) < f.goal);
    const high = days.filter((d) => val(d) >= f.goal);
    const r = pearson(days.map(val), days.map((d) => d.severity));
    const lowAvg = avg(low.map((d) => d.severity));
    const highAvg = avg(high.map((d) => d.severity));
    return {
      factor: f.factor,
      label: f.label,
      lowLabel: f.low,
      highLabel: f.high,
      lowAvg,
      highAvg,
      lowN: low.length,
      highN: high.length,
      r,
      strength: strengthOf(r),
      notable: low.length >= 3 && high.length >= 3 && lowAvg - highAvg >= 1,
    };
  });
}

/** Short, factual summary of the statistics only (no raw records). Used for the optional AI explanation. */
export function statsSummary(days: DayRow[], findings: Finding[]) {
  const lines = [`Days with both a wellness check-in and symptom data: ${days.length}.`];
  for (const f of findings)
    lines.push(
      `${f.label.en}: average symptom severity ${f.lowAvg.toFixed(1)}/10 on ${f.lowLabel.en} days (n=${f.lowN}) vs ${f.highAvg.toFixed(1)}/10 on ${f.highLabel.en} days (n=${f.highN}); Pearson r = ${f.r == null ? "n/a" : f.r.toFixed(2)}.`,
    );
  return lines.join("\n");
}

export type Badge = { id: string; icon: string; title: L; desc: L; earned: boolean; progress?: string };

export function achievements(wellness: WellnessEntry[], records: SymptomRecord[], checks: number, quizDone: boolean): Badge[] {
  const dates = new Set(wellness.map((w) => w.date));
  let best = 0, run = 0;
  const sorted = [...dates].sort();
  for (let i = 0; i < sorted.length; i++) {
    const prev = i && new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime() === 86400000;
    run = prev ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const sleepGood = wellness.filter((w) => w.sleepHours >= 8).length;
  const activeGood = wellness.filter((w) => w.activityMin >= 60).length;
  const waterGood = wellness.filter((w) => w.water >= 6).length;
  const allGoals = wellness.filter((w) => w.sleepHours >= 8 && w.activityMin >= 60 && w.water >= 6).length;
  const b = (id: string, icon: string, en: string, th: string, den: string, dth: string, have: number, need: number): Badge => ({
    id, icon, title: { en, th }, desc: { en: den, th: dth }, earned: have >= need, progress: `${Math.min(have, need)}/${need}`,
  });
  return [
    b("first", "🌱", "First step", "ก้าวแรก", "Do your first wellness check-in", "เช็คอินสุขภาพครั้งแรก", wellness.length, 1),
    b("streak3", "🔥", "On a roll", "ต่อเนื่อง", "Check in 3 days in a row", "เช็คอิน 3 วันติดต่อกัน", best, 3),
    b("streak7", "🏆", "Week warrior", "นักสู้ 7 วัน", "Check in 7 days in a row", "เช็คอิน 7 วันติดต่อกัน", best, 7),
    b("sleep", "😴", "Sleep champion", "แชมป์การนอน", "Sleep 8 h+ on 5 days", "นอน 8 ชม.ขึ้นไป 5 วัน", sleepGood, 5),
    b("active", "🏃", "Mover", "นักเคลื่อนไหว", "Reach 60 active minutes on 5 days", "เคลื่อนไหวครบ 60 นาที 5 วัน", activeGood, 5),
    b("water", "💧", "Hydration hero", "ฮีโร่ดื่มน้ำ", "Drink 6+ glasses on 5 days", "ดื่มน้ำ 6 แก้วขึ้นไป 5 วัน", waterGood, 5),
    b("perfect", "⭐", "Perfect day", "วันสมบูรณ์แบบ", "Meet sleep, water and activity goals on one day", "ทำได้ครบทั้งการนอน น้ำ และการเคลื่อนไหวใน 1 วัน", allGoals, 1),
    b("tracker", "📒", "Record keeper", "นักบันทึก", "Log 5 symptom records", "บันทึกอาการ 5 ครั้ง", records.length, 5),
    b("checker", "🩺", "Body listener", "ฟังร่างกาย", "Complete a symptom check", "ตรวจอาการ 1 ครั้ง", checks, 1),
    b("quiz", "🧠", "Prevention pro", "มือโปรการป้องกัน", "Finish the prevention quiz", "ทำแบบทดสอบการป้องกันครบ", quizDone ? 1 : 0, 1),
  ];
}
