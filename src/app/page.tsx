"use client";

import { ArrowRight, Bot, ChevronLeft, ChevronRight, CloudSun, Droplets, Globe2, Hand, Lightbulb, Moon, Plus, Stethoscope, Sun, Thermometer, Footprints, CheckCircle2, Circle, Activity, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { CheckHistory } from "@/components/CheckHistory";
import { WellnessCard } from "@/components/Wellness";
import { DataSourceTag, Gauge, LevelBadge } from "@/components/health";
import { Card, CardHeader, Item, LinkButton, Stagger, Badge } from "@/components/ui";
import { aqiCategory, heatCategory, uvCategory } from "@/lib/environment";
import { t, tr, type L } from "@/lib/i18n";
import { DAILY_TIPS } from "@/lib/prevention";
import { useStore } from "@/lib/store";
import { symptomLabel } from "@/lib/symptoms";
import { useEnvironment } from "@/lib/useEnvironment";
import { cn, formatDate, todayISO } from "@/lib/utils";

const REMINDER_TEXT: Record<string, { label: L; icon: React.ComponentType<{ className?: string }> }> = {
  water: { label: { en: "Drink water regularly", th: "ดื่มน้ำสม่ำเสมอ" }, icon: Droplets },
  hands: { label: { en: "Wash hands before meals", th: "ล้างมือก่อนกินอาหาร" }, icon: Hand },
  move: { label: { en: "60 minutes of activity", th: "เคลื่อนไหว 60 นาที" }, icon: Footprints },
  sleep: { label: { en: "Screens off before bed", th: "ปิดหน้าจอก่อนนอน" }, icon: Moon },
};

export default function Home() {
  const { settings, records, checks, reminders, setReminders, ready } = useStore();
  const lang = settings.lang;
  const { data: env, place, loading } = useEnvironment();
  const [tip, setTip] = useState(() => new Date().getDate() % DAILY_TIPS.length);
  const today = todayISO();

  const hour = new Date().getHours();
  const greet = t(hour < 12 ? "good_morning" : hour < 18 ? "good_afternoon" : "good_evening", lang);

  const week = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const off = d.getTimezoneOffset();
      return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
    });
    const series = days.map((d) => {
      const rs = records.filter((r) => r.date === d);
      return { d, v: rs.length ? Math.max(...rs.map((r) => r.severity)) : 0 };
    });
    const inWeek = records.filter((r) => r.date >= days[0]);
    return { series, count: inWeek.length, avg: inWeek.length ? inWeek.reduce((a, r) => a + r.severity, 0) / inWeek.length : null };
  }, [records]);

  const lastCheck = checks[checks.length - 1];
  const recent = [...records].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  const enabledReminders = reminders.filter((r) => r.enabled);
  const doneToday = enabledReminders.filter((r) => r.doneDates.includes(today)).length;
  const month = new Date().getMonth();
  const thai = place.country === "TH" || place.id.startsWith("geo:");
  const rainy = month >= 4 && month <= 9;

  const toggleReminder = (id: string) =>
    setReminders((rs) => rs.map((r) => (r.id === id ? { ...r, doneDates: r.doneDates.includes(today) ? r.doneDates.filter((d) => d !== today) : [...r.doneDates.slice(-60), today] } : r)));

  const aqi = aqiCategory(env?.current.aqi ?? null);
  const heat = env ? heatCategory(env.current.apparent) : null;
  const uv = env ? uvCategory(env.current.uv) : null;

  return (
    <Stagger className="space-y-6">
      {/* Hero */}
      <Item>
        <Card className="hero-gradient relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-brand-400/30 to-teal-450/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{formatDate(today, lang, { weekday: "long", day: "numeric", month: "long" })}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                {greet}
                {settings.nickname ? `, ${settings.nickname}` : ""} 👋
              </h1>
              <p className="mt-2 text-muted">
                {lang === "th"
                  ? "ทำความเข้าใจอาการ ติดตามสุขภาพ และเรียนรู้วิธีป้องกันโรค — อย่างปลอดภัยและเป็นส่วนตัว"
                  : "Understand symptoms, track how you feel, and learn simple ways to prevent illness — safely and privately."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <LinkButton href="/analyze" size="lg">
                  <Stethoscope className="size-5" /> {t("start_check", lang)}
                </LinkButton>
                <LinkButton href="/tracker?new=1" variant="outline" size="lg">
                  <Plus className="size-5" /> {t("log_symptom", lang)}
                </LinkButton>
                <LinkButton href="/assistant" variant="ghost" size="lg">
                  <Bot className="size-5" /> {t("ask_assistant", lang)}
                </LinkButton>
              </div>
            </div>
            <div className="surface hidden shrink-0 rounded-3xl border border-soft p-5 text-center backdrop-blur md:block">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{t("todays_overview", lang)}</p>
              <div className="relative mx-auto mt-3 grid size-28 place-items-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#g1)" strokeWidth="10" strokeLinecap="round" strokeDasharray={264} strokeDashoffset={264 * (1 - (enabledReminders.length ? doneToday / enabledReminders.length : 0))} style={{ transition: "stroke-dashoffset .8s" }} />
                  <defs>
                    <linearGradient id="g1">
                      <stop offset="0" stopColor="#3b93f6" />
                      <stop offset="1" stopColor="#1fb5a8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <div className="text-2xl font-bold">
                    {doneToday}/{enabledReminders.length}
                  </div>
                  <div className="text-[11px] text-muted">{lang === "th" ? "นิสัยวันนี้" : "habits today"}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Item>

      {/* Overview tiles */}
      <Item className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">{lang === "th" ? "การตรวจอาการล่าสุด" : "Last symptom check"}</p>
          <div className="mt-2">{lastCheck ? <LevelBadge level={lastCheck.level} lang={lang} /> : <span className="text-sm text-muted">{lang === "th" ? "ยังไม่มี" : "None yet"}</span>}</div>
          <p className="mt-2 text-xs text-muted">{lastCheck ? formatDate(lastCheck.createdAt, lang) : <Link href="/analyze" className="text-brand-600 underline-offset-2 hover:underline">{t("start_check", lang)}</Link>}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">{lang === "th" ? "บันทึก 7 วันล่าสุด" : "Records, last 7 days"}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{ready ? week.count : "–"}</p>
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={week.series}>
                <defs>
                  <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#3b93f6" stopOpacity={0.4} />
                    <stop offset="1" stopColor="#3b93f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area dataKey="v" stroke="#3b93f6" strokeWidth={2} fill="url(#sp)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">{lang === "th" ? "ความรุนแรงเฉลี่ย (7 วัน)" : "Avg. severity (7 days)"}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {week.avg == null ? "—" : week.avg.toFixed(1)}
            <span className="text-base font-medium text-muted">/10</span>
          </p>
          <p className="mt-1 text-xs text-muted">{lang === "th" ? "จากบันทึกของคุณ" : "From your own records"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted">{lang === "th" ? "อากาศตอนนี้" : "Weather now"}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{env ? `${Math.round(env.current.temperature)}°` : "—"}</p>
          <p className="mt-1 truncate text-xs text-muted">
            {tr(place.name, lang)}
            {env?.source === "simulated" && <Badge tone="amber" className="ml-1">{t("simulated", lang)}</Badge>}
          </p>
        </Card>
      </Item>

      <Item>
        <WellnessCard />
      </Item>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Environment */}
        <Item className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader
              icon={<CloudSun className="size-5" />}
              title={t("env_indicators", lang)}
              subtitle={tr(place.name, lang)}
              action={
                <Link href="/environment" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {t("view_all", lang)} <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="px-5 pb-5">
              {loading && !env ? (
                <div className="grid h-40 place-items-center text-sm text-muted">{t("loading", lang)}</div>
              ) : env ? (
                <>
                  <div className="grid grid-cols-2 items-center gap-4 sm:grid-cols-4">
                    <Gauge value={env.current.aqi} max={300} color={aqi.color} label={`AQI · ${tr(aqi.label, lang)}`} size={120} />
                    <Stat icon={<Thermometer className="size-4" />} label={lang === "th" ? "รู้สึกเหมือน" : "Feels like"} value={`${Math.round(env.current.apparent)}°C`} tag={heat ? tr(heat.label, lang) : ""} color={heat?.color} />
                    <Stat icon={<Droplets className="size-4" />} label={lang === "th" ? "ความชื้น" : "Humidity"} value={`${Math.round(env.current.humidity)}%`} tag={env.current.humidity >= 80 ? (lang === "th" ? "สูงมาก" : "Very humid") : ""} color="#0ea5e9" />
                    <Stat icon={<Sun className="size-4" />} label={lang === "th" ? "ดัชนียูวี" : "UV index"} value={env.current.uv.toFixed(0)} tag={uv ? tr(uv.label, lang) : ""} color={uv?.color} />
                  </div>
                  <div className="mt-4">
                    <DataSourceTag live={env.source === "live"} source={env.source === "live" ? "Open-Meteo.com (CC BY 4.0)" : lang === "th" ? "ข้อมูลจำลอง — เชื่อมต่อข้อมูลจริงไม่ได้" : "Simulated — live source unreachable"} time={env.fetchedAt} lang={lang} />
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        </Item>

        {/* Reminders */}
        <Item>
          <Card className="h-full">
            <CardHeader icon={<CalendarDays className="size-5" />} title={t("reminders", lang)} subtitle={lang === "th" ? "แตะเพื่อทำเครื่องหมายว่าทำแล้ววันนี้" : "Tap to mark as done today"} />
            <ul className="space-y-1 px-3 pb-4">
              {enabledReminders.map((r) => {
                const meta = REMINDER_TEXT[r.key];
                const done = r.doneDates.includes(today);
                const Icon = meta?.icon ?? Activity;
                return (
                  <li key={r.id}>
                    <button onClick={() => toggleReminder(r.id)} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-black/[.03] dark:hover:bg-white/5" aria-pressed={done}>
                      {done ? <CheckCircle2 className="size-5 text-teal-500" /> : <Circle className="size-5 text-muted" />}
                      <Icon className="size-4 text-brand-500" />
                      <span className={cn("text-sm", done && "text-muted line-through")}>{meta ? tr(meta.label, lang) : r.text}</span>
                    </button>
                  </li>
                );
              })}
              {!enabledReminders.length && <li className="px-2 text-sm text-muted">{lang === "th" ? "ปิดการแจ้งเตือนทั้งหมดในการตั้งค่า" : "All reminders are turned off in Settings."}</li>}
            </ul>
          </Card>
        </Item>

        {/* Recent records */}
        <Item className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader
              icon={<Activity className="size-5" />}
              title={t("recent_records", lang)}
              action={
                <Link href="/tracker" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {t("view_all", lang)} <ArrowRight className="size-4" />
                </Link>
              }
            />
            <div className="px-5 pb-5">
              {recent.length ? (
                <ul className="divide-y divide-[var(--border)]">
                  {recent.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {symptomLabel(r.symptom) ? tr(symptomLabel(r.symptom)!, lang) : r.symptom}
                          {r.demo && <Badge tone="amber" className="ml-2">{lang === "th" ? "ตัวอย่าง" : "Demo"}</Badge>}
                        </p>
                        <p className="text-xs text-muted">{formatDate(r.date, lang)}</p>
                      </div>
                      <SeverityPill v={r.severity} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed border-soft p-6 text-center">
                  <p className="text-sm text-muted">{t("no_records", lang)}</p>
                  <LinkButton href="/tracker?new=1" size="sm" className="mt-3">
                    <Plus className="size-4" /> {t("log_symptom", lang)}
                  </LinkButton>
                </div>
              )}
            </div>
          </Card>
        </Item>

        {/* Tips */}
        <Item>
          <Card className="relative h-full overflow-hidden bg-gradient-to-br from-brand-600 to-teal-450 text-white">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="size-4" /> {t("tips", lang)}
                </span>
                <div className="flex gap-1">
                  <button aria-label="Previous tip" onClick={() => setTip((x) => (x - 1 + DAILY_TIPS.length) % DAILY_TIPS.length)} className="rounded-lg p-1 hover:bg-white/15">
                    <ChevronLeft className="size-4" />
                  </button>
                  <button aria-label="Next tip" onClick={() => setTip((x) => (x + 1) % DAILY_TIPS.length)} className="rounded-lg p-1 hover:bg-white/15">
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
              <p key={tip} className="mt-4 min-h-16 text-lg font-semibold leading-snug">
                {tr(DAILY_TIPS[tip], lang)}
              </p>
              <div className="mt-4 flex gap-1">
                {DAILY_TIPS.map((_, i) => (
                  <span key={i} className={cn("h-1 flex-1 rounded-full", i === tip ? "bg-white" : "bg-white/30")} />
                ))}
              </div>
              <Link href="/prevention" className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline">
                {lang === "th" ? "ไปที่ศูนย์การป้องกัน" : "Explore the Prevention Center"} <ArrowRight className="size-4" />
              </Link>
            </div>
          </Card>
        </Item>

        {/* Community */}
        <Item className="lg:col-span-3">
          <Card>
            <CardHeader icon={<Globe2 className="size-5" />} title={t("community", lang)} subtitle={lang === "th" ? "ข้อมูลระดับพื้นที่กว้าง แยกจากอาการของคุณ" : "Broad-area information, kept separate from your personal symptoms"} />
            <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
              <div className="rounded-2xl border border-soft p-4">
                <p className="text-sm font-semibold">{lang === "th" ? "คำเตือนที่ได้รับการยืนยัน" : "Verified warnings"}</p>
                <p className="mt-1 text-sm text-muted">
                  {lang === "th"
                    ? "ต้นแบบนี้ไม่สร้างหรือคาดเดาการระบาดเอง และยังไม่ได้เชื่อมต่อฟีดการแจ้งเตือนอย่างเป็นทางการ โปรดตรวจสอบจากกรมควบคุมโรคและ WHO"
                    : "This prototype never creates or guesses outbreak alerts, and no official alert feed is connected yet. Check the Thai DDC and WHO for current warnings."}
                </p>
                <Link href="/trends" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  {lang === "th" ? "ดูแนวโน้มโรคและแหล่งข้อมูลทางการ" : "Disease trends & official sources"} <ArrowRight className="size-4" />
                </Link>
              </div>
              {thai && (
                <div className="rounded-2xl border border-soft p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    {lang === "th" ? "ความรู้ตามฤดูกาล" : "Seasonal awareness"} <Badge>{lang === "th" ? "ความรู้ทั่วไป ไม่ใช่ข้อมูลสด" : "General knowledge, not live data"}</Badge>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {rainy
                      ? lang === "th"
                        ? "ขณะนี้อยู่ในช่วงฤดูฝนของไทย ซึ่งโดยทั่วไปผู้ป่วยไข้เลือดออกจะเพิ่มขึ้น กำจัดน้ำขังและป้องกันยุงกัด"
                        : "It's the Thai rainy season, when dengue cases typically rise. Remove standing water and prevent mosquito bites."
                      : lang === "th"
                        ? "ช่วงฤดูแล้ง/หนาว ภาคเหนือมักมีปัญหาฝุ่น PM2.5 จากการเผา ตรวจค่า AQI ก่อนทำกิจกรรมกลางแจ้ง"
                        : "In the dry/cool season, northern Thailand often sees high PM2.5 from burning. Check the AQI before outdoor activity."}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </Item>
      </div>
    </Stagger>
  );
}

function Stat({ icon, label, value, tag, color }: { icon: React.ReactNode; label: string; value: string; tag?: string; color?: string }) {
  return (
    <div className="surface-2 rounded-2xl p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        {icon} {label}
      </div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
      {tag && (
        <div className="text-xs font-medium" style={{ color }}>
          {tag}
        </div>
      )}
    </div>
  );
}

function SeverityPill({ v }: { v: number }) {
  const c = v >= 7 ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" : v >= 4 ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  return <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", c)}>{v}/10</span>;
}
