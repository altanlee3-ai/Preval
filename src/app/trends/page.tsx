"use client";

import { AlertTriangle, ExternalLink, Globe2, LineChart as LineIcon, Megaphone, RefreshCw, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataSourceTag } from "@/components/health";
import { Badge, Button, Card, CardHeader, PageHeader, Segmented, inputCls } from "@/components/ui";
import { PLACES } from "@/lib/environment";
import { tr } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { ISO3, OFFICIAL_SOURCES, SIMULATED_SEASONAL, WHO_INDICATORS, type SeriesPoint } from "@/lib/trends";
import { usePlace } from "@/lib/useEnvironment";
import { cn } from "@/lib/utils";

const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" };
const COUNTRIES = [
  { code: "THA", name: { en: "Thailand", th: "ประเทศไทย" } },
  { code: "SGP", name: { en: "Singapore", th: "สิงคโปร์" } },
  { code: "GBR", name: { en: "United Kingdom", th: "สหราชอาณาจักร" } },
  { code: "USA", name: { en: "United States", th: "สหรัฐอเมริกา" } },
  { code: "AUS", name: { en: "Australia", th: "ออสเตรเลีย" } },
];

type State = { status: "loading" } | { status: "ok"; points: SeriesPoint[]; fetchedAt: string } | { status: "error"; error: string };

export default function TrendsPage() {
  const { settings } = useStore();
  const lang = settings.lang;
  const place = usePlace();
  const defaultCountry = ISO3[PLACES.find((p) => p.id === place.id)?.country ?? "TH"] ?? "THA";
  const [country, setCountry] = useState(defaultCountry);
  const [code, setCode] = useState(WHO_INDICATORS[0].code);
  const [state, setState] = useState<State>({ status: "loading" });
  const [seasonal, setSeasonal] = useState<"dengue" | "influenza" | "diarrhoea">("dengue");

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const r = await fetch(`/api/who?code=${code}&country=${country}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      setState({ status: "ok", points: j.points, fetchedAt: j.fetchedAt });
    } catch (e) {
      setState({ status: "error", error: e instanceof Error ? e.message : "unavailable" });
    }
  }, [code, country]);

  useEffect(() => {
    void load();
  }, [load]);

  const ind = WHO_INDICATORS.find((i) => i.code === code)!;
  const seasonalData = SIMULATED_SEASONAL.months[lang].map((m, i) => ({ m, v: SIMULATED_SEASONAL[seasonal][i] }));
  const nowMonth = new Date().getMonth();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<LineIcon className="size-5" />}
        title={lang === "th" ? "แนวโน้มโรคและคำเตือนสาธารณสุข" : "Disease Trends & Public Health Warnings"}
        subtitle={lang === "th" ? "ข้อมูลระดับประเทศจากแหล่งที่เชื่อถือได้ พร้อมป้ายกำกับแหล่งที่มาและเวลา" : "Country-level data from trusted sources, always labelled with source and time."}
      />

      {/* Warnings */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Megaphone className="size-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{lang === "th" ? "คำเตือนที่ได้รับการยืนยัน" : "Verified public health warnings"}</h2>
              <Badge>{lang === "th" ? "ไม่มีฟีดที่เชื่อมต่อ" : "No feed connected"}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {lang === "th"
                ? "PreventAI จะไม่สร้าง คาดเดา หรือจำลองคำเตือนการระบาด เนื่องจากยังไม่มีฟีดการแจ้งเตือนอย่างเป็นทางการที่เชื่อมต่อแบบอ่านได้ด้วยเครื่อง จึงไม่มีคำเตือนแสดงที่นี่ โปรดตรวจสอบจากแหล่งทางการด้านล่างเพื่อข้อมูลล่าสุด"
                : "PreventAI never creates, guesses or simulates outbreak warnings. No machine-readable official alert feed is connected in this prototype, so no warnings are shown here. For current alerts, check the official sources below."}
            </p>
          </div>
        </div>
        <div className="grid gap-px border-t border-soft bg-[var(--border)] sm:grid-cols-2">
          {OFFICIAL_SOURCES.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="surface group flex items-start gap-3 p-4 transition hover:bg-brand-50/50 dark:hover:bg-brand-500/5">
              <Globe2 className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-sm font-semibold">
                  {tr(s.name, lang)} <ExternalLink className="size-3.5 opacity-50 group-hover:opacity-100" />
                </p>
                <p className="text-xs text-muted">{tr(s.desc, lang)}</p>
              </div>
            </a>
          ))}
        </div>
      </Card>

      {/* WHO live */}
      <Card>
        <CardHeader
          icon={<Globe2 className="size-5" />}
          title={lang === "th" ? "แนวโน้มระยะยาว (ข้อมูลจริงจาก WHO)" : "Long-term trends (live WHO data)"}
          subtitle={`${tr(ind.name, lang)} — ${tr(ind.unit, lang)}`}
          action={
            <Button variant="ghost" size="sm" onClick={load} aria-label="Reload">
              <RefreshCw className={cn("size-4", state.status === "loading" && "animate-spin")} />
            </Button>
          }
        />
        <div className="flex flex-col gap-3 px-5 sm:flex-row">
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={cn(inputCls, "sm:w-52")} aria-label="Country">
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {tr(c.name, lang)}
              </option>
            ))}
          </select>
          <Segmented label="indicator" value={code} onChange={setCode} options={WHO_INDICATORS.map((i) => ({ value: i.code, label: tr(i.name, lang) }))} />
        </div>
        <div className="h-72 px-2 pb-2 pt-4">
          {state.status === "loading" && <p className="grid h-full place-items-center text-sm text-muted">{lang === "th" ? "กำลังโหลดจาก WHO…" : "Loading from WHO…"}</p>}
          {state.status === "error" && (
            <div className="grid h-full place-items-center p-6 text-center">
              <div>
                <AlertTriangle className="mx-auto size-8 text-amber-500" />
                <p className="mt-2 text-sm font-medium">{lang === "th" ? "ไม่สามารถโหลดข้อมูลจาก WHO ได้ในขณะนี้" : "WHO data couldn't be loaded right now"}</p>
                <p className="mt-1 text-xs text-muted">
                  {state.error}. {lang === "th" ? "เราไม่แสดงตัวเลขแทนเพื่อหลีกเลี่ยงข้อมูลที่ไม่ถูกต้อง" : "No substitute numbers are shown, to avoid presenting unverified data."}
                </p>
                <Button size="sm" variant="outline" className="mt-3" onClick={load}>
                  <RefreshCw className="size-4" /> {lang === "th" ? "ลองใหม่" : "Retry"}
                </Button>
              </div>
            </div>
          )}
          {state.status === "ok" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.points} margin={{ top: 5, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v).toLocaleString(), tr(ind.name, lang)]} />
                <Line dataKey="value" stroke="#2574eb" strokeWidth={2.5} dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="px-5 pb-5">
          {state.status === "ok" ? (
            <DataSourceTag
              live
              lang={lang}
              time={state.fetchedAt}
              source={
                <a href="https://www.who.int/data/gho" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  WHO Global Health Observatory ({code})
                </a>
              }
            />
          ) : null}
          <p className="mt-2 text-xs text-muted">{tr(ind.note, lang)} {lang === "th" ? "ข้อมูลรายปีระดับประเทศ ไม่ได้แสดงสถานการณ์ปัจจุบันในพื้นที่ของคุณ" : "Annual national figures — they don't describe the current situation in your area."}</p>
        </div>
      </Card>

      {/* Simulated seasonal */}
      <Card className="ring-1 ring-amber-200 dark:ring-amber-500/30">
        <CardHeader
          icon={<ShieldAlert className="size-5" />}
          title={lang === "th" ? "รูปแบบตามฤดูกาล (ข้อมูลจำลองเพื่อการเรียนรู้)" : "Seasonal patterns (simulated, for learning)"}
          subtitle={lang === "th" ? "ดัชนี 0–100 แสดงรูปแบบทั่วไปในประเทศไทย ไม่ใช่จำนวนผู้ป่วยจริง" : "A 0–100 index showing the typical shape in Thailand — not real case counts"}
          action={<Badge tone="amber">{lang === "th" ? "ข้อมูลจำลอง" : "SIMULATED"}</Badge>}
        />
        <div className="px-5">
          <Segmented
            label="seasonal"
            value={seasonal}
            onChange={setSeasonal}
            options={[
              { value: "dengue", label: lang === "th" ? "ไข้เลือดออก" : "Dengue" },
              { value: "influenza", label: lang === "th" ? "ไข้หวัดใหญ่" : "Influenza" },
              { value: "diarrhoea", label: lang === "th" ? "ท้องร่วง" : "Diarrhoea" },
            ]}
          />
        </div>
        <div className="h-64 px-2 pb-2 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonalData} margin={{ top: 5, right: 16, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="seas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="1" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} (index)`, lang === "th" ? "ดัชนีจำลอง" : "Simulated index"]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area dataKey="v" name={lang === "th" ? "ดัชนีจำลอง (ไม่ใช่ข้อมูลจริง)" : "Simulated index (not real data)"} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 3" fill="url(#seas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 px-5 pb-5 text-xs text-muted">
          <p>
            {lang === "th"
              ? "รูปร่างของกราฟอ้างอิงจากรูปแบบตามฤดูกาลที่อธิบายในแหล่งข้อมูลสาธารณะ (เช่น ไข้เลือดออกเพิ่มขึ้นในฤดูฝน — WHO, กรมควบคุมโรค) แต่ตัวเลขถูกสร้างขึ้นเพื่อการสอน ห้ามใช้ตัดสินใจด้านสุขภาพ"
              : "The curve's shape follows seasonal patterns described in public sources (e.g. dengue rising in the rainy season — WHO, Thai DDC), but the numbers were generated for teaching. Do not use them for health decisions."}
          </p>
          <p>
            {lang === "th" ? "เดือนปัจจุบัน" : "Current month"}: <strong>{SIMULATED_SEASONAL.months[lang][nowMonth]}</strong>. {lang === "th" ? "สำหรับข้อมูลจริง ดูรายงาน 506 ของกรมควบคุมโรค" : "For real Thai surveillance data, see the DDC's Report 506 system."}
          </p>
        </div>
      </Card>
    </div>
  );
}
