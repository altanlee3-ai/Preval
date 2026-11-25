"use client";

import { CloudSun, Droplets, LocateFixed, RefreshCw, Sun, Thermometer, Wind, AlertTriangle, CheckCircle2, Leaf, Flame, CloudRain, Footprints } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { DataSourceTag, Gauge } from "@/components/health";
import { Button, Card, CardHeader, PageHeader, inputCls } from "@/components/ui";
import { aqiCategory, envAdvice, heatCategory, outdoorPlan, PLACES, uvCategory } from "@/lib/environment";
import { tr } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useEnvironment } from "@/lib/useEnvironment";
import { cn, formatDate } from "@/lib/utils";

const tooltipStyle = { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" };
const ADVICE_ICON = { air: Wind, heat: Flame, uv: Sun, humid: CloudRain, ok: CheckCircle2 };

export default function EnvironmentPage() {
  const { settings, updateSettings, toast } = useStore();
  const lang = settings.lang;
  const { data, loading, reload, place } = useEnvironment();
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast(lang === "th" ? "อุปกรณ์ไม่รองรับตำแหน่ง" : "Location isn't supported on this device", "warn");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        // Round to 1 decimal (~11 km) so only a broad area is used.
        updateSettings({ locationId: `geo:${p.coords.latitude.toFixed(1)}:${p.coords.longitude.toFixed(1)}` });
        setLocating(false);
      },
      () => {
        setLocating(false);
        toast(lang === "th" ? "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง" : "Location permission was not granted", "warn");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  const hourly = (data?.hourly ?? []).map((h) => ({ ...h, label: h.time.slice(11, 16) }));
  const daily = (data?.daily ?? []).map((d) => ({ ...d, label: formatDate(d.date, lang, { weekday: "short", day: "numeric" }) }));
  const aqi = aqiCategory(data?.current.aqi ?? null);
  const heat = data ? heatCategory(data.current.apparent) : null;
  const uv = data ? uvCategory(data.current.uv) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CloudSun className="size-5" />}
        title={lang === "th" ? "แดชบอร์ดสุขภาพสิ่งแวดล้อม" : "Environmental Health"}
        subtitle={lang === "th" ? "คุณภาพอากาศ อุณหภูมิ ความชื้น และยูวี พร้อมคำแนะนำด้านสุขภาพ" : "Air quality, heat, humidity and UV — with health considerations."}
        action={
          <div className="flex flex-wrap gap-2">
            <select
              value={place.id.startsWith("geo:") ? "geo" : place.id}
              onChange={(e) => e.target.value !== "geo" && updateSettings({ locationId: e.target.value })}
              className={cn(inputCls, "w-auto")}
              aria-label="Area"
            >
              {place.id.startsWith("geo:") && <option value="geo">{tr(place.name, lang)}</option>}
              {PLACES.map((p) => (
                <option key={p.id} value={p.id}>
                  {tr(p.name, lang)}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={useMyLocation} disabled={locating} aria-label="Use my approximate location">
              <LocateFixed className={cn("size-4", locating && "animate-pulse")} /> <span className="hidden sm:inline">{lang === "th" ? "ตำแหน่งของฉัน" : "My area"}</span>
            </Button>
            <Button variant="outline" onClick={reload} disabled={loading} aria-label="Refresh">
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>
        }
      />

      {data && (
        <div className="space-y-2">
          <DataSourceTag
            live={data.source === "live"}
            source={
              data.source === "live" ? (
                <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Open-Meteo.com — weather & air quality (CAMS) · CC BY 4.0
                </a>
              ) : lang === "th" ? (
                "ข้อมูลจำลองเพื่อการสาธิต"
              ) : (
                "Simulated values for demonstration"
              )
            }
            time={data.fetchedAt}
            lang={lang}
          />
          {data.source === "simulated" && (
            <p className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {lang === "th"
                ? `ไม่สามารถเชื่อมต่อแหล่งข้อมูลจริง (${data.error ?? "ไม่ทราบสาเหตุ"}) ค่าด้านล่างเป็นข้อมูลจำลอง ไม่ใช่สภาพอากาศจริง`
                : `Couldn't reach the live data source (${data.error ?? "unknown reason"}). The values below are SIMULATED and do not describe real conditions.`}
            </p>
          )}
        </div>
      )}

      {loading && !data ? (
        <Card className="grid h-64 place-items-center text-sm text-muted">{lang === "th" ? "กำลังโหลดข้อมูลสิ่งแวดล้อม…" : "Loading environmental data…"}</Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted">
                <Leaf className="size-4" /> {lang === "th" ? "ดัชนีคุณภาพอากาศ (US AQI)" : "Air Quality (US AQI)"}
              </p>
              <div className="mt-2">
                <Gauge value={data.current.aqi} max={300} color={aqi.color} label={tr(aqi.label, lang)} sub={`PM2.5 ${data.current.pm25?.toFixed(0) ?? "—"} · PM10 ${data.current.pm10?.toFixed(0) ?? "—"} µg/m³`} />
              </div>
            </Card>
            <Metric icon={<Thermometer className="size-4" />} title={lang === "th" ? "อุณหภูมิ" : "Temperature"} value={`${data.current.temperature.toFixed(1)}°C`} sub={`${lang === "th" ? "รู้สึกเหมือน" : "Feels like"} ${data.current.apparent.toFixed(1)}°C`} tag={heat ? tr(heat.label, lang) : ""} color={heat?.color} />
            <Metric icon={<Droplets className="size-4" />} title={lang === "th" ? "ความชื้นสัมพัทธ์" : "Humidity"} value={`${Math.round(data.current.humidity)}%`} sub={`${lang === "th" ? "ลม" : "Wind"} ${Math.round(data.current.wind)} km/h`} tag={data.current.humidity >= 80 ? (lang === "th" ? "สูงมาก" : "Very humid") : data.current.humidity <= 30 ? (lang === "th" ? "แห้ง" : "Dry") : lang === "th" ? "ปกติ" : "Typical"} color="#0ea5e9" />
            <Metric icon={<Sun className="size-4" />} title={lang === "th" ? "ดัชนียูวี" : "UV index"} value={data.current.uv.toFixed(1)} sub={`${lang === "th" ? "สูงสุดวันนี้" : "Today's max"} ${data.daily[0]?.uvMax?.toFixed(0) ?? "—"}`} tag={uv ? tr(uv.label, lang) : ""} color={uv?.color} />
          </div>

          <Card>
            <CardHeader icon={<CheckCircle2 className="size-5" />} title={lang === "th" ? "ข้อควรพิจารณาด้านสุขภาพวันนี้" : "Health considerations right now"} subtitle={lang === "th" ? "คำแนะนำทั่วไปตามเกณฑ์ของ EPA, WHO และ NWS" : "General guidance based on US EPA, WHO and US NWS thresholds"} />
            <ul className="grid gap-3 px-5 pb-5 md:grid-cols-2">
              {envAdvice(data).map((a, i) => {
                const I = ADVICE_ICON[a.icon];
                return (
                  <li key={i} className="surface-2 flex gap-3 rounded-xl p-3.5 text-sm">
                    <I className="mt-0.5 size-5 shrink-0 text-teal-600" />
                    {tr(a.text, lang)}
                  </li>
                );
              })}
            </ul>
          </Card>

          <OutdoorPlanner data={data} lang={lang} />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title={lang === "th" ? "อุณหภูมิและความชื้น 24 ชั่วโมง" : "Next 24 hours: temperature & humidity"} />
              <div className="h-64 px-2 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={hourly} margin={{ top: 5, right: 0, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" interval={3} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="t" tickLine={false} axisLine={false} unit="°" />
                    <YAxis yAxisId="h" orientation="right" domain={[0, 100]} tickLine={false} axisLine={false} unit="%" width={40} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="h" dataKey="humidity" name={lang === "th" ? "ความชื้น %" : "Humidity %"} fill="#0ea5e9" opacity={0.25} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="t" dataKey="temperature" name={lang === "th" ? "อุณหภูมิ °C" : "Temp °C"} stroke="#f97316" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title={lang === "th" ? "คุณภาพอากาศ 24 ชั่วโมง" : "Next 24 hours: air quality"} subtitle={lang === "th" ? "เส้นประ = 100 (เริ่มมีผลต่อกลุ่มเสี่ยง)" : "Dashed line = 100 (sensitive-group threshold)"} />
              <div className="h-64 px-2 pb-4">
                {hourly.some((h) => h.aqi != null) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourly} margin={{ top: 5, right: 12, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aqiG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#1fb5a8" stopOpacity={0.45} />
                          <stop offset="1" stopColor="#1fb5a8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" interval={3} tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <ReferenceLine y={100} stroke="#f97316" strokeDasharray="4 4" />
                      <Area dataKey="aqi" name="US AQI" stroke="#1fb5a8" strokeWidth={2.5} fill="url(#aqiG)" connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="grid h-full place-items-center text-sm text-muted">{lang === "th" ? "ไม่มีข้อมูลคุณภาพอากาศสำหรับพื้นที่นี้" : "No air-quality data available for this area."}</p>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title={lang === "th" ? "พยากรณ์ 7 วัน" : "7-day outlook"} subtitle={lang === "th" ? "อุณหภูมิสูงสุด/ต่ำสุด, ยูวีสูงสุด และโอกาสฝน" : "High/low temperature, max UV and chance of rain"} />
            <div className="grid grid-cols-2 gap-2 px-5 pb-5 sm:grid-cols-4 lg:grid-cols-7">
              {daily.map((d) => (
                <div key={d.date} className="surface-2 rounded-xl p-3 text-center">
                  <p className="text-xs font-medium text-muted">{d.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    {Math.round(d.max)}° <span className="text-sm font-medium text-muted">{Math.round(d.min)}°</span>
                  </p>
                  <p className="mt-1 text-xs" style={{ color: uvCategory(d.uvMax).color }}>
                    UV {Math.round(d.uvMax)}
                  </p>
                  <p className="text-xs text-sky-600 dark:text-sky-400">☂ {d.rainProb}%</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title={lang === "th" ? "ทำความเข้าใจค่า AQI" : "Understanding AQI"} subtitle="US EPA Air Quality Index categories" />
            <div className="grid gap-2 px-5 pb-5 sm:grid-cols-3 lg:grid-cols-6">
              {[25, 75, 125, 175, 250, 350].map((v, i) => {
                const c = aqiCategory(v);
                const ranges = ["0–50", "51–100", "101–150", "151–200", "201–300", "301+"];
                return (
                  <div key={v} className={cn("rounded-xl border p-3", c.level === aqi.level ? "border-2" : "border-soft")} style={c.level === aqi.level ? { borderColor: c.color } : undefined}>
                    <span className="block h-1.5 rounded-full" style={{ background: c.color }} />
                    <p className="mt-2 text-sm font-semibold">{ranges[i]}</p>
                    <p className="text-xs text-muted">{tr(c.label, lang)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}

function Metric({ icon, title, value, sub, tag, color }: { icon: React.ReactNode; title: string; value: string; sub: string; tag?: string; color?: string }) {
  return (
    <Card className="p-5">
      <p className="flex items-center gap-1.5 text-sm font-medium text-muted">
        {icon} {title}
      </p>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted">{sub}</p>
      {tag && (
        <span className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ color, background: `${color}1a` }}>
          {tag}
        </span>
      )}
    </Card>
  );
}

function OutdoorPlanner({ data, lang }: { data: NonNullable<ReturnType<typeof useEnvironment>["data"]>; lang: "en" | "th" }) {
  const th = lang === "th";
  const { hours, best } = outdoorPlan(data);
  const STYLE = {
    good: { cls: "bg-emerald-500", label: th ? "เหมาะ" : "Good" },
    ok: { cls: "bg-amber-400", label: th ? "ระวัง" : "Take care" },
    avoid: { cls: "bg-red-500", label: th ? "เลี่ยง" : "Avoid" },
  } as const;
  return (
    <Card>
      <CardHeader
        icon={<Footprints className="size-5" />}
        title={th ? "ช่วงเวลาที่เหมาะกับกิจกรรมกลางแจ้ง" : "Best time to be active outdoors"}
        subtitle={
          (th ? "คำนวณจากดัชนีความร้อน (NWS) และ AQI (EPA) รายชั่วโมง" : "Worked out from the hourly heat index (US NWS) and AQI (US EPA)") +
          (data.source === "simulated" ? (th ? " · ข้อมูลจำลอง" : " · simulated data") : "")
        }
      />
      <div className="px-5 pb-5">
        {hours.length ? (
          <>
            {best && (
              <p className="mb-3 text-sm">
                {best.rating === "avoid"
                  ? th
                    ? "วันนี้ไม่มีช่วงที่เหมาะกับการออกกำลังกายหนักกลางแจ้ง ลองออกกำลังกายในร่มแทน"
                    : "No daylight hour looks good for hard outdoor exercise today. Try an indoor workout instead."
                  : th
                    ? `ช่วงที่ดีที่สุด: ${best.time.slice(0, 10) !== hours[0].time.slice(0, 10) ? "พรุ่งนี้ " : ""}ประมาณ ${best.label} น. (รู้สึกเหมือน ${Math.round(best.feels)}°C${best.aqi != null ? `, AQI ${Math.round(best.aqi)}` : ""})`
                    : `Best slot: ${best.time.slice(0, 10) !== hours[0].time.slice(0, 10) ? "tomorrow " : ""}around ${best.label} (feels like ${Math.round(best.feels)}°C${best.aqi != null ? `, AQI ${Math.round(best.aqi)}` : ""})`}
              </p>
            )}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {hours.map((h, i) => (
                <div key={h.time} className={cn("flex min-w-11 flex-1 flex-col items-center gap-1", i > 0 && h.time.slice(0, 10) !== hours[i - 1].time.slice(0, 10) && "ml-3 border-l-2 border-dashed border-soft pl-2")} title={`${h.label} · ${Math.round(h.feels)}°C${h.aqi != null ? ` · AQI ${Math.round(h.aqi)}` : ""}`}>
                  <span className={cn("h-8 w-full rounded-md", STYLE[h.rating].cls, best?.time === h.time && "ring-2 ring-brand-500 ring-offset-2 ring-offset-[var(--surface)]")} />
                  <span className="text-[10px] tabular-nums text-muted">{h.label}</span>
                  {i > 0 && h.time.slice(0, 10) !== hours[i - 1].time.slice(0, 10) && <span className="text-[10px] font-medium text-muted">{th ? "พรุ่งนี้" : "Tomorrow"}</span>}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
              {(Object.keys(STYLE) as (keyof typeof STYLE)[]).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className={cn("size-2.5 rounded-sm", STYLE[k].cls)} /> {STYLE[k].label}
                </span>
              ))}
              <span>{th ? "ใช้ร่วมกับยูวี: ทาครีมกันแดดเมื่อยูวี ≥ 3" : "Also check UV: wear sunscreen when UV is 3 or more"}</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">{th ? "ไม่มีช่วงกลางวันเหลือในพยากรณ์ 24 ชั่วโมงนี้" : "No daylight hours left in the next 24-hour forecast."}</p>
        )}
      </div>
    </Card>
  );
}
