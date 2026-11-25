import type { L } from "./i18n";

export interface Place {
  id: string;
  name: L;
  lat: number;
  lon: number;
  country: string;
}

export const PLACES: Place[] = [
  { id: "bangkok", name: { en: "Bangkok", th: "กรุงเทพมหานคร" }, lat: 13.75, lon: 100.5, country: "TH" },
  { id: "chiangmai", name: { en: "Chiang Mai", th: "เชียงใหม่" }, lat: 18.79, lon: 98.98, country: "TH" },
  { id: "khonkaen", name: { en: "Khon Kaen", th: "ขอนแก่น" }, lat: 16.43, lon: 102.83, country: "TH" },
  { id: "phuket", name: { en: "Phuket", th: "ภูเก็ต" }, lat: 7.88, lon: 98.39, country: "TH" },
  { id: "hatyai", name: { en: "Hat Yai", th: "หาดใหญ่" }, lat: 7.01, lon: 100.47, country: "TH" },
  { id: "singapore", name: { en: "Singapore", th: "สิงคโปร์" }, lat: 1.35, lon: 103.82, country: "SG" },
  { id: "london", name: { en: "London", th: "ลอนดอน" }, lat: 51.51, lon: -0.13, country: "GB" },
  { id: "newyork", name: { en: "New York", th: "นิวยอร์ก" }, lat: 40.71, lon: -74.01, country: "US" },
  { id: "sydney", name: { en: "Sydney", th: "ซิดนีย์" }, lat: -33.87, lon: 151.21, country: "AU" },
];

export interface EnvData {
  source: "live" | "simulated";
  fetchedAt: string;
  error?: string;
  current: {
    temperature: number;
    apparent: number;
    humidity: number;
    uv: number;
    wind: number;
    aqi: number | null;
    pm25: number | null;
    pm10: number | null;
  };
  hourly: { time: string; temperature: number; humidity: number; aqi: number | null; pm25: number | null }[];
  daily: { date: string; max: number; min: number; uvMax: number; rainProb: number }[];
}

/** Fetch real data from Open-Meteo (free, no key, CORS-enabled). Coordinates are broad-area only. */
export async function fetchEnvironment(lat: number, lon: number, signal?: AbortSignal): Promise<EnvData> {
  const w = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,uv_index,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=7`;
  const a = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10&hourly=us_aqi,pm2_5&timezone=auto&forecast_days=2`;
  const [wr, ar] = await Promise.all([fetch(w, { signal }), fetch(a, { signal }).catch(() => null)]);
  if (!wr.ok) throw new Error(`Weather service responded ${wr.status}`);
  const wj = await wr.json();
  const aj = ar && ar.ok ? await ar.json() : null;
  const nowIdx = Math.max(0, (wj.hourly.time as string[]).findIndex((t) => t >= (wj.current.time as string)));
  const aqiByTime = new Map<string, { aqi: number | null; pm25: number | null }>();
  if (aj?.hourly) (aj.hourly.time as string[]).forEach((t, i) => aqiByTime.set(t, { aqi: aj.hourly.us_aqi[i], pm25: aj.hourly.pm2_5[i] }));
  const hourly = (wj.hourly.time as string[]).slice(nowIdx, nowIdx + 24).map((t, k) => ({
    time: t,
    temperature: wj.hourly.temperature_2m[nowIdx + k],
    humidity: wj.hourly.relative_humidity_2m[nowIdx + k],
    aqi: aqiByTime.get(t)?.aqi ?? null,
    pm25: aqiByTime.get(t)?.pm25 ?? null,
  }));
  return {
    source: "live",
    fetchedAt: new Date().toISOString(),
    current: {
      temperature: wj.current.temperature_2m,
      apparent: wj.current.apparent_temperature,
      humidity: wj.current.relative_humidity_2m,
      uv: wj.current.uv_index ?? 0,
      wind: wj.current.wind_speed_10m,
      aqi: aj?.current?.us_aqi ?? null,
      pm25: aj?.current?.pm2_5 ?? null,
      pm10: aj?.current?.pm10 ?? null,
    },
    hourly,
    daily: (wj.daily.time as string[]).map((d, i) => ({
      date: d,
      max: wj.daily.temperature_2m_max[i],
      min: wj.daily.temperature_2m_min[i],
      uvMax: wj.daily.uv_index_max[i],
      rainProb: wj.daily.precipitation_probability_max[i] ?? 0,
    })),
  };
}

/** Clearly-labelled simulated data used only when live data cannot be reached. Deterministic per place. */
export function simulatedEnvironment(place: Place, error?: string): EnvData {
  const tropical = Math.abs(place.lat) < 23;
  const base = tropical ? 31 : 14;
  const seed = place.id.length;
  const now = new Date();
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now.getTime() + i * 3600_000);
    const h = t.getHours();
    const diurnal = Math.sin(((h - 9) / 24) * 2 * Math.PI);
    return {
      time: t.toISOString().slice(0, 16),
      temperature: +(base + 4 * diurnal).toFixed(1),
      humidity: Math.round((tropical ? 70 : 65) - 15 * diurnal),
      aqi: Math.round((tropical ? 75 : 40) + 20 * Math.cos(((h - 7) / 24) * 2 * Math.PI) + seed),
      pm25: +((tropical ? 24 : 10) + 8 * Math.cos(((h - 7) / 24) * 2 * Math.PI)).toFixed(1),
    };
  });
  return {
    source: "simulated",
    fetchedAt: now.toISOString(),
    error,
    current: { temperature: hourly[0].temperature, apparent: hourly[0].temperature + (tropical ? 4 : 0), humidity: hourly[0].humidity, uv: tropical ? 8 : 3, wind: 9, aqi: hourly[0].aqi, pm25: hourly[0].pm25, pm10: hourly[0].pm25 ? hourly[0].pm25 * 1.6 : null },
    hourly,
    daily: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() + i * 86400_000);
      return { date: d.toISOString().slice(0, 10), max: base + 3 + ((i * 7 + seed) % 3), min: base - 5 + ((i * 3) % 2), uvMax: tropical ? 9 + (i % 3) : 3 + (i % 2), rainProb: (i * 23 + seed * 7) % 90 };
    }),
  };
}

/** US EPA AQI categories. */
export function aqiCategory(aqi: number | null) {
  if (aqi == null) return { label: { en: "Unavailable", th: "ไม่มีข้อมูล" }, color: "#94a3b8", level: -1 };
  if (aqi <= 50) return { label: { en: "Good", th: "ดี" }, color: "#10b981", level: 0 };
  if (aqi <= 100) return { label: { en: "Moderate", th: "ปานกลาง" }, color: "#eab308", level: 1 };
  if (aqi <= 150) return { label: { en: "Unhealthy for sensitive groups", th: "มีผลต่อกลุ่มเสี่ยง" }, color: "#f97316", level: 2 };
  if (aqi <= 200) return { label: { en: "Unhealthy", th: "มีผลต่อสุขภาพ" }, color: "#ef4444", level: 3 };
  if (aqi <= 300) return { label: { en: "Very unhealthy", th: "มีผลต่อสุขภาพมาก" }, color: "#a855f7", level: 4 };
  return { label: { en: "Hazardous", th: "อันตราย" }, color: "#7f1d1d", level: 5 };
}

/** WHO UV index categories. */
export function uvCategory(uv: number) {
  if (uv < 3) return { label: { en: "Low", th: "ต่ำ" }, color: "#10b981" };
  if (uv < 6) return { label: { en: "Moderate", th: "ปานกลาง" }, color: "#eab308" };
  if (uv < 8) return { label: { en: "High", th: "สูง" }, color: "#f97316" };
  if (uv < 11) return { label: { en: "Very high", th: "สูงมาก" }, color: "#ef4444" };
  return { label: { en: "Extreme", th: "รุนแรงมาก" }, color: "#a855f7" };
}

/** Heat guidance based on "feels like" temperature (simplified from the US NWS heat index caution bands). */
export function heatCategory(feels: number) {
  if (feels < 27) return { label: { en: "Comfortable", th: "สบาย" }, color: "#10b981", level: 0 };
  if (feels < 32) return { label: { en: "Caution", th: "ควรระวัง" }, color: "#eab308", level: 1 };
  if (feels < 41) return { label: { en: "Extreme caution", th: "ระวังมาก" }, color: "#f97316", level: 2 };
  if (feels < 54) return { label: { en: "Danger", th: "อันตราย" }, color: "#ef4444", level: 3 };
  return { label: { en: "Extreme danger", th: "อันตรายมาก" }, color: "#7f1d1d", level: 4 };
}

export function envAdvice(d: EnvData): { icon: "air" | "heat" | "uv" | "humid" | "ok"; text: L }[] {
  const out: { icon: "air" | "heat" | "uv" | "humid" | "ok"; text: L }[] = [];
  const aqi = aqiCategory(d.current.aqi);
  if (aqi.level >= 2)
    out.push({ icon: "air", text: { en: "Air quality may affect sensitive groups (asthma, heart or lung conditions, children, older adults). Consider reducing long or intense outdoor activity; a well-fitted N95/KN95 mask can reduce PM2.5 exposure.", th: "คุณภาพอากาศอาจส่งผลต่อกลุ่มเสี่ยง (หอบหืด โรคหัวใจหรือปอด เด็ก ผู้สูงอายุ) ควรลดกิจกรรมกลางแจ้งที่นานหรือหนัก หน้ากาก N95/KN95 ช่วยลดการรับฝุ่น PM2.5 ได้" } });
  else if (aqi.level === 1)
    out.push({ icon: "air", text: { en: "Air quality is acceptable; unusually sensitive people may want to limit prolonged outdoor exertion.", th: "คุณภาพอากาศพอใช้ ผู้ที่ไวต่อมลพิษมากอาจลดการออกแรงกลางแจ้งนาน ๆ" } });
  const heat = heatCategory(d.current.apparent);
  if (heat.level >= 2)
    out.push({ icon: "heat", text: { en: "High heat stress. Drink water regularly, rest in shade and avoid strenuous activity in the hottest hours (about 11:00–15:00). Know the signs of heat exhaustion.", th: "ความร้อนสูง ดื่มน้ำสม่ำเสมอ พักในที่ร่ม หลีกเลี่ยงกิจกรรมหนักช่วงร้อนจัด (ประมาณ 11:00–15:00) และรู้จักอาการเพลียแดด" } });
  else if (heat.level === 1) out.push({ icon: "heat", text: { en: "Warm conditions — keep hydrated during activity.", th: "อากาศค่อนข้างร้อน ควรดื่มน้ำระหว่างทำกิจกรรม" } });
  if (d.current.uv >= 6 || Math.max(...d.daily.slice(0, 1).map((x) => x.uvMax)) >= 8)
    out.push({ icon: "uv", text: { en: "High UV today. Use shade, a hat, sunglasses and SPF 30+ sunscreen around midday.", th: "รังสียูวีสูงวันนี้ ใช้ร่ม หมวก แว่นกันแดด และครีมกันแดด SPF 30+ ช่วงกลางวัน" } });
  if (d.current.humidity >= 80)
    out.push({ icon: "humid", text: { en: "Very humid: sweat evaporates less, so the body cools less effectively. Standing water after rain can increase mosquito breeding.", th: "ความชื้นสูงมาก เหงื่อระเหยได้น้อย ร่างกายระบายความร้อนได้ไม่ดี น้ำขังหลังฝนตกอาจเพิ่มแหล่งเพาะพันธุ์ยุง" } });
  if (!out.length) out.push({ icon: "ok", text: { en: "No notable environmental health concerns right now.", th: "ขณะนี้ไม่มีข้อกังวลด้านสุขภาพสิ่งแวดล้อมที่สำคัญ" } });
  return out;
}

/** US NWS heat index (Rothfusz regression) from air temperature (°C) and relative humidity (%). Returns °C. */
export function heatIndexC(tempC: number, rh: number): number {
  const T = tempC * 9 / 5 + 32;
  if (T < 80) return tempC;
  const HI = -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh - 0.00683783 * T * T - 0.05481717 * rh * rh + 0.00122874 * T * T * rh + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
  return ((HI - 32) * 5) / 9;
}

export type HourRating = "good" | "ok" | "avoid";

/** Rates each upcoming daylight hour (06:00–19:00) for outdoor activity using heat index and AQI. */
export function outdoorPlan(d: EnvData) {
  const hours = d.hourly
    .filter((h) => {
      const hr = Number(h.time.slice(11, 13));
      return hr >= 6 && hr <= 19;
    })
    .map((h) => {
      const feels = heatIndexC(h.temperature, h.humidity);
      const heat = heatCategory(feels).level;
      const air = aqiCategory(h.aqi).level;
      const rating: HourRating = heat >= 3 || air >= 3 ? "avoid" : heat >= 2 || air >= 2 ? "ok" : "good";
      return { time: h.time, label: h.time.slice(11, 16), feels, aqi: h.aqi, rating };
    });
  const score = { good: 2, ok: 1, avoid: 0 } as const;
  let best: (typeof hours)[number] | undefined;
  for (const h of hours) if (!best || score[h.rating] > score[best.rating] || (score[h.rating] === score[best.rating] && h.feels < best.feels)) best = h;
  return { hours, best };
}
