import type { L } from "./i18n";
import { CONTEXT_OPTIONS, DURATION_OPTIONS, RED_FLAGS, SYMPTOMS, symptomLabel } from "./symptoms";

export type Level = 0 | 1 | 2 | 3;
export const LEVEL_KEYS = ["level_low", "level_caution", "level_advice", "level_urgent"] as const;

export const LEVEL_STYLE: Record<Level, { bg: string; text: string; ring: string; dot: string; hex: string }> = {
  0: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", ring: "ring-emerald-200 dark:ring-emerald-500/30", dot: "bg-emerald-500", hex: "#10b981" },
  1: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-300", ring: "ring-amber-200 dark:ring-amber-500/30", dot: "bg-amber-500", hex: "#f59e0b" },
  2: { bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-700 dark:text-orange-300", ring: "ring-orange-200 dark:ring-orange-500/30", dot: "bg-orange-500", hex: "#f97316" },
  3: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-700 dark:text-red-300", ring: "ring-red-200 dark:ring-red-500/30", dot: "bg-red-600", hex: "#dc2626" },
};

export const LEVEL_GUIDANCE: Record<Level, L> = {
  0: {
    en: "Based on what you entered, this looks like something many people manage with rest and self-care. Keep an eye on it and check again if anything changes.",
    th: "จากข้อมูลที่ระบุ อาการนี้หลายคนดูแลได้ด้วยการพักผ่อนและดูแลตนเอง โปรดสังเกตอาการและตรวจอีกครั้งหากมีการเปลี่ยนแปลง",
  },
  1: {
    en: "Take care and monitor closely. If symptoms last longer, get worse, or new symptoms appear, consider speaking to a pharmacist, nurse or doctor.",
    th: "ดูแลตนเองและติดตามอาการอย่างใกล้ชิด หากอาการนานขึ้น แย่ลง หรือมีอาการใหม่ ควรปรึกษาเภสัชกร พยาบาล หรือแพทย์",
  },
  2: {
    en: "It would be sensible to get advice from a healthcare professional (clinic, doctor or pharmacist) soon, ideally within the next day or two.",
    th: "ควรขอคำแนะนำจากบุคลากรทางการแพทย์ (คลินิก แพทย์ หรือเภสัชกร) โดยเร็ว ภายใน 1–2 วัน",
  },
  3: {
    en: "One or more emergency warning signs were reported. Seek urgent medical care now: call 1669 in Thailand (or your local emergency number) or go to the nearest emergency department.",
    th: "พบสัญญาณเตือนฉุกเฉิน โปรดรับการรักษาเร่งด่วนทันที โทร 1669 (ประเทศไทย) หรือหมายเลขฉุกเฉินในพื้นที่ หรือไปห้องฉุกเฉินที่ใกล้ที่สุด",
  },
};

export interface TriageInput {
  symptoms: string[];
  redFlags: string[];
  description: string;
  durationId: string;
  severity: number; // 1–10
  context: string[];
}

export interface Factor {
  label: L;
  effect: "raises" | "info";
  level: Level;
}

export interface TriageResult {
  level: Level;
  factors: Factor[];
  detectedTextFlags: string[];
}

export const severityBand = (s: number): "mild" | "moderate" | "severe" => (s >= 7 ? "severe" : s >= 4 ? "moderate" : "mild");

/** Words in free text that may describe an emergency warning sign (EN + TH). Conservative on purpose. */
const TEXT_FLAG_PATTERNS: { flag: string; re: RegExp }[] = [
  { flag: "chest_pain", re: /chest (pain|pressure|tight)|เจ็บหน้าอก|แน่นหน้าอก/i },
  { flag: "breathing", re: /can'?t breathe|cannot breathe|struggling to breathe|hard to breathe|หายใจไม่ออก|หายใจลำบาก/i },
  { flag: "stroke", re: /slurred speech|face droop|one side.*(weak|numb)|พูดไม่ชัด|หน้าเบี้ยว|แขนขาอ่อนแรง/i },
  { flag: "fainting", re: /faint|passed out|seizure|ชัก|หมดสติ|เป็นลม/i },
  { flag: "bleeding", re: /coughing blood|vomiting blood|blood in (vomit|stool)|ไอเป็นเลือด|อาเจียนเป็นเลือด/i },
  { flag: "self_harm", re: /kill myself|suicid|self[- ]harm|hurt myself|end my life|ฆ่าตัวตาย|ทำร้ายตัวเอง|อยากตาย/i },
  { flag: "thunderclap", re: /worst headache|sudden severe headache|ปวดหัวรุนแรงที่สุด/i },
  { flag: "confusion", re: /confus|disoriented|สับสน/i },
];

export function detectTextFlags(text: string): string[] {
  return TEXT_FLAG_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.flag);
}

export function triage(input: TriageInput): TriageResult {
  const factors: Factor[] = [];
  const detectedTextFlags = detectTextFlags(input.description).filter((f) => !input.redFlags.includes(f));
  const allFlags = [...input.redFlags, ...detectedTextFlags];
  const days = DURATION_OPTIONS.find((d) => d.id === input.durationId)?.days ?? 1;
  const band = severityBand(input.severity);
  const careCtx = input.context.filter((c) => CONTEXT_OPTIONS.find((o) => o.id === c)?.raisesCare);
  const hasFever = input.symptoms.includes("fever");

  // Rule 1 — emergency warning signs always win.
  for (const f of allFlags) {
    const rf = RED_FLAGS.find((r) => r.id === f);
    if (rf)
      factors.push({
        label: {
          en: `Emergency warning sign: ${rf.label.en}${detectedTextFlags.includes(f) ? " (mentioned in your description)" : ""}`,
          th: `สัญญาณเตือนฉุกเฉิน: ${rf.label.th}${detectedTextFlags.includes(f) ? " (พบในคำอธิบายของคุณ)" : ""}`,
        },
        effect: "raises",
        level: 3,
      });
  }

  // Rule 2 — "seek medical advice" triggers.
  if (band === "severe")
    factors.push({ label: { en: `Severity rated ${input.severity}/10 (severe)`, th: `ระดับความรุนแรง ${input.severity}/10 (รุนแรง)` }, effect: "raises", level: 2 });
  if (days >= 10)
    factors.push({ label: { en: "Symptoms have lasted more than a week", th: "มีอาการนานเกิน 1 สัปดาห์" }, effect: "raises", level: 2 });
  if (hasFever && days >= 4)
    factors.push({ label: { en: "Fever lasting more than 3 days", th: "มีไข้นานเกิน 3 วัน" }, effect: "raises", level: 2 });
  if (careCtx.length && (hasFever || band !== "mild"))
    factors.push({
      label: {
        en: "A health context that calls for earlier professional advice, combined with fever or moderate+ symptoms",
        th: "มีปัจจัยด้านสุขภาพที่ควรปรึกษาแพทย์เร็วขึ้น ร่วมกับไข้หรืออาการปานกลางขึ้นไป",
      },
      effect: "raises",
      level: 2,
    });
  if (input.context.includes("worsening") && band !== "mild")
    factors.push({ label: { en: "Symptoms are getting worse", th: "อาการแย่ลง" }, effect: "raises", level: 2 });

  // Rule 3 — "caution" triggers.
  if (band === "moderate")
    factors.push({ label: { en: `Severity rated ${input.severity}/10 (moderate)`, th: `ระดับความรุนแรง ${input.severity}/10 (ปานกลาง)` }, effect: "raises", level: 1 });
  if (days >= 4 && days < 10)
    factors.push({ label: { en: "Symptoms have lasted 4–7 days", th: "มีอาการ 4–7 วัน" }, effect: "raises", level: 1 });
  if (hasFever && days < 4) factors.push({ label: { en: "Fever reported", th: "มีไข้" }, effect: "raises", level: 1 });
  if (input.symptoms.includes("vomiting") || input.symptoms.includes("diarrhea"))
    factors.push({ label: { en: "Vomiting or diarrhoea can lead to dehydration", th: "อาเจียนหรือท้องเสียอาจทำให้ขาดน้ำ" }, effect: "raises", level: 1 });
  if (input.symptoms.length >= 4)
    factors.push({ label: { en: `${input.symptoms.length} symptoms reported together`, th: `มีอาการร่วมกัน ${input.symptoms.length} อาการ` }, effect: "raises", level: 1 });
  if (careCtx.length && !(hasFever || band !== "mild"))
    factors.push({ label: { en: "Health context noted — lower threshold for getting advice", th: "มีปัจจัยด้านสุขภาพ — ควรขอคำแนะนำเร็วขึ้น" }, effect: "raises", level: 1 });

  // Rule 4 — individual symptoms that public guidance says should be checked (raise only).
  if (hasFever && input.symptoms.includes("stiff_neck"))
    factors.push({ label: { en: "Fever with a stiff neck (a recognised emergency warning sign)", th: "มีไข้ร่วมกับคอแข็ง (สัญญาณเตือนฉุกเฉิน)" }, effect: "raises", level: 3 });
  for (const id of input.symptoms) {
    const sym = SYMPTOMS.find((x) => x.id === id);
    if (sym?.concern)
      factors.push({
        label: {
          en: `${sym.label.en}: ${sym.concern === 2 ? "worth getting checked by a health professional" : "keep an eye on it"}`,
          th: `${sym.label.th}: ${sym.concern === 2 ? "ควรให้บุคลากรทางการแพทย์ตรวจ" : "ควรเฝ้าสังเกตอาการ"}`,
        },
        effect: "raises",
        level: sym.concern,
      });
  }

  // Informational factors (do not change the level).
  if (band === "mild") factors.push({ label: { en: `Severity rated ${input.severity}/10 (mild)`, th: `ระดับความรุนแรง ${input.severity}/10 (เล็กน้อย)` }, effect: "info", level: 0 });
  if (days < 4 && !hasFever) factors.push({ label: { en: "Short duration so far", th: "ระยะเวลาอาการยังสั้น" }, effect: "info", level: 0 });
  if (input.symptoms.length)
    factors.push({
      label: {
        en: `Symptoms: ${input.symptoms.map((s) => symptomLabel(s)?.en ?? s).join(", ")}`,
        th: `อาการ: ${input.symptoms.map((s) => symptomLabel(s)?.th ?? s).join(", ")}`,
      },
      effect: "info",
      level: 0,
    });

  const level = factors.reduce<Level>((m, f) => (f.effect === "raises" && f.level > m ? f.level : m), 0);
  factors.sort((a, b) => b.level - a.level);
  return { level, factors, detectedTextFlags };
}
