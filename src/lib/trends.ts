import type { L } from "./i18n";

export const ISO3: Record<string, string> = { TH: "THA", SG: "SGP", GB: "GBR", US: "USA", AU: "AUS" };

export interface WhoIndicator {
  code: string;
  name: L;
  unit: L;
  note: L;
}

/** WHO Global Health Observatory indicators fetched live (annual, country-level). */
export const WHO_INDICATORS: WhoIndicator[] = [
  {
    code: "MDG_0000000020",
    name: { en: "Tuberculosis incidence", th: "อุบัติการณ์วัณโรค" },
    unit: { en: "new cases per 100,000 people per year (WHO estimate)", th: "ผู้ป่วยใหม่ต่อประชากร 100,000 คนต่อปี (ประมาณการของ WHO)" },
    note: { en: "Estimated by WHO; includes uncertainty.", th: "ประมาณการโดย WHO มีความไม่แน่นอน" },
  },
  {
    code: "WHS3_62",
    name: { en: "Measles — reported cases", th: "โรคหัด — จำนวนผู้ป่วยที่รายงาน" },
    unit: { en: "reported cases per year", th: "จำนวนผู้ป่วยที่รายงานต่อปี" },
    note: { en: "Reported cases depend on testing and reporting systems.", th: "จำนวนที่รายงานขึ้นกับระบบการตรวจและรายงาน" },
  },
];

export interface SeriesPoint {
  year: number;
  value: number;
}

export interface WhoSeries {
  code: string;
  country: string;
  source: "live";
  fetchedAt: string;
  points: SeriesPoint[];
}

/**
 * ILLUSTRATIVE seasonal shapes — NOT real case counts.
 * The relative shape reflects seasonal patterns described in public sources
 * (e.g. dengue rising during the rainy season in Thailand, WHO/Thai DDC;
 * influenza activity in tropical Asia often peaking in the rainy season, WHO FluNet commentary).
 * Values are an index (peak month = 100) generated for teaching purposes.
 */
export const SIMULATED_SEASONAL = {
  months: { en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], th: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."] },
  dengue: [12, 9, 10, 14, 30, 58, 86, 100, 82, 55, 30, 18],
  influenza: [45, 38, 30, 28, 42, 66, 88, 100, 84, 60, 48, 52],
  diarrhoea: [70, 68, 82, 100, 92, 74, 66, 64, 62, 60, 62, 66],
};

export const OFFICIAL_SOURCES: { name: L; url: string; desc: L }[] = [
  {
    name: { en: "WHO — Disease Outbreak News", th: "WHO — ข่าวการระบาดของโรค" },
    url: "https://www.who.int/emergencies/disease-outbreak-news",
    desc: { en: "Official WHO reports on acute public health events worldwide.", th: "รายงานทางการของ WHO เกี่ยวกับเหตุการณ์สาธารณสุขเฉียบพลันทั่วโลก" },
  },
  {
    name: { en: "Thailand Department of Disease Control (DDC)", th: "กรมควบคุมโรค ประเทศไทย" },
    url: "https://ddc.moph.go.th/",
    desc: { en: "National disease surveillance, alerts and prevention advice. Hotline 1422.", th: "การเฝ้าระวังโรค การแจ้งเตือน และคำแนะนำการป้องกันระดับประเทศ สายด่วน 1422" },
  },
  {
    name: { en: "CDC — Travelers' Health Notices", th: "CDC — ประกาศสุขภาพนักเดินทาง" },
    url: "https://wwwnc.cdc.gov/travel/notices",
    desc: { en: "US CDC travel health notices by destination.", th: "ประกาศสุขภาพการเดินทางของ CDC สหรัฐฯ ตามจุดหมาย" },
  },
  {
    name: { en: "WHO Global Health Observatory", th: "WHO Global Health Observatory" },
    url: "https://www.who.int/data/gho",
    desc: { en: "WHO's open data portal used for the live charts on this page.", th: "แหล่งข้อมูลเปิดของ WHO ที่ใช้สร้างกราฟข้อมูลจริงในหน้านี้" },
  },
];
