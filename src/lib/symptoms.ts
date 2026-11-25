import type { L } from "./i18n";

export type SymptomCategory = "general" | "respiratory" | "head" | "digestive" | "skin" | "muscle" | "heart" | "urinary" | "mental";

export interface Symptom {
  id: string;
  label: L;
  category: SymptomCategory;
  /** Symptoms that public guidance says are worth getting checked: 1 = caution, 2 = get advice. Only ever raises the level. */
  concern?: 1 | 2;
}

export const CATEGORY_LABELS: Record<SymptomCategory, L> = {
  general: { en: "General", th: "ทั่วไป" },
  respiratory: { en: "Nose, throat & chest", th: "จมูก คอ และหน้าอก" },
  head: { en: "Head, eyes, ears & mouth", th: "ศีรษะ ตา หู และปาก" },
  digestive: { en: "Stomach & digestion", th: "ท้องและการย่อย" },
  skin: { en: "Skin", th: "ผิวหนัง" },
  muscle: { en: "Muscles & joints", th: "กล้ามเนื้อและข้อ" },
  heart: { en: "Heart & circulation", th: "หัวใจและการไหลเวียน" },
  urinary: { en: "Bladder & periods", th: "ทางเดินปัสสาวะและประจำเดือน" },
  mental: { en: "Sleep, mood & focus", th: "การนอน อารมณ์ และสมาธิ" },
};

export const SYMPTOMS: Symptom[] = [
  { id: "fever", label: { en: "Fever", th: "มีไข้" }, category: "general" },
  { id: "fatigue", label: { en: "Tiredness / fatigue", th: "อ่อนเพลีย" }, category: "general" },
  { id: "chills", label: { en: "Chills", th: "หนาวสั่น" }, category: "general" },
  { id: "dizziness", label: { en: "Dizziness", th: "เวียนศีรษะ" }, category: "general" },
  { id: "loss_appetite", label: { en: "Loss of appetite", th: "เบื่ออาหาร" }, category: "general" },
  { id: "cough", label: { en: "Cough", th: "ไอ" }, category: "respiratory" },
  { id: "sore_throat", label: { en: "Sore throat", th: "เจ็บคอ" }, category: "respiratory" },
  { id: "runny_nose", label: { en: "Runny or blocked nose", th: "น้ำมูกไหล/คัดจมูก" }, category: "respiratory" },
  { id: "sneezing", label: { en: "Sneezing", th: "จาม" }, category: "respiratory" },
  { id: "short_breath_mild", label: { en: "Mild breathlessness on exertion", th: "หายใจเหนื่อยเล็กน้อยเมื่อออกแรง" }, category: "respiratory" },
  { id: "headache", label: { en: "Headache", th: "ปวดศีรษะ" }, category: "head" },
  { id: "eye_irritation", label: { en: "Itchy or watery eyes", th: "คันตา/น้ำตาไหล" }, category: "head" },
  { id: "earache", label: { en: "Earache", th: "ปวดหู" }, category: "head" },
  { id: "nausea", label: { en: "Nausea", th: "คลื่นไส้" }, category: "digestive" },
  { id: "vomiting", label: { en: "Vomiting", th: "อาเจียน" }, category: "digestive" },
  { id: "diarrhea", label: { en: "Diarrhoea", th: "ท้องเสีย" }, category: "digestive" },
  { id: "stomach_pain", label: { en: "Stomach ache", th: "ปวดท้อง" }, category: "digestive" },
  { id: "rash", label: { en: "Rash", th: "ผื่น" }, category: "skin" },
  { id: "itching", label: { en: "Itchy skin", th: "คันผิวหนัง" }, category: "skin" },
  { id: "body_aches", label: { en: "Body aches", th: "ปวดเมื่อยตามตัว" }, category: "muscle" },
  { id: "joint_pain", label: { en: "Joint pain", th: "ปวดข้อ" }, category: "muscle" },
  { id: "back_pain", label: { en: "Back pain", th: "ปวดหลัง" }, category: "muscle" },
  { id: "poor_sleep", label: { en: "Poor sleep", th: "นอนไม่หลับ" }, category: "mental" },
  { id: "stress", label: { en: "Feeling stressed or anxious", th: "เครียดหรือวิตกกังวล" }, category: "mental" },
  { id: "low_mood", label: { en: "Low mood", th: "อารมณ์หดหู่" }, category: "mental" },
  // General
  { id: "night_sweats", label: { en: "Night sweats", th: "เหงื่อออกตอนกลางคืน" }, category: "general", concern: 1 },
  { id: "weight_loss", label: { en: "Weight loss without trying", th: "น้ำหนักลดโดยไม่ได้ตั้งใจ" }, category: "general", concern: 2 },
  { id: "thirst", label: { en: "Very thirsty all the time", th: "กระหายน้ำมากตลอดเวลา" }, category: "general", concern: 1 },
  { id: "swollen_glands", label: { en: "Swollen glands in neck", th: "ต่อมที่คอบวม" }, category: "general" },
  { id: "lightheaded", label: { en: "Light-headed when standing up", th: "หน้ามืดเมื่อลุกขึ้นยืน" }, category: "general" },
  { id: "overheated", label: { en: "Feeling overheated / heavy sweating", th: "รู้สึกร้อนจัด/เหงื่อออกมาก" }, category: "general", concern: 1 },
  // Nose, throat & chest
  { id: "wheezing", label: { en: "Wheezing", th: "หายใจมีเสียงหวีด" }, category: "respiratory", concern: 1 },
  { id: "phlegm", label: { en: "Phlegm or mucus", th: "มีเสมหะ" }, category: "respiratory" },
  { id: "hoarse_voice", label: { en: "Hoarse voice", th: "เสียงแหบ" }, category: "respiratory" },
  { id: "nosebleed", label: { en: "Nosebleed", th: "เลือดกำเดาไหล" }, category: "respiratory" },
  { id: "loss_smell", label: { en: "Loss of smell or taste", th: "ไม่ได้กลิ่นหรือไม่รู้รส" }, category: "respiratory" },
  { id: "sinus_pain", label: { en: "Face or sinus pain", th: "ปวดใบหน้า/ไซนัส" }, category: "respiratory" },
  // Head, eyes, ears & mouth
  { id: "light_sensitive_headache", label: { en: "Headache with sensitivity to light", th: "ปวดศีรษะร่วมกับแพ้แสง" }, category: "head" },
  { id: "blurred_vision", label: { en: "Blurred vision", th: "ตาพร่ามัว" }, category: "head", concern: 2 },
  { id: "red_eye", label: { en: "Red or sore eye", th: "ตาแดงหรือเจ็บตา" }, category: "head" },
  { id: "eye_strain", label: { en: "Eye strain from screens", th: "ปวดตาจากการใช้หน้าจอ" }, category: "head" },
  { id: "ear_ringing", label: { en: "Ringing in the ears", th: "มีเสียงในหู" }, category: "head" },
  { id: "toothache", label: { en: "Toothache", th: "ปวดฟัน" }, category: "head" },
  { id: "mouth_ulcers", label: { en: "Mouth ulcers", th: "แผลในปาก" }, category: "head" },
  { id: "stiff_neck", label: { en: "Stiff neck (hard to bend forward)", th: "คอแข็ง (ก้มคอลำบาก)" }, category: "head", concern: 2 },
  // Stomach & digestion
  { id: "heartburn", label: { en: "Heartburn or indigestion", th: "แสบร้อนกลางอก/อาหารไม่ย่อย" }, category: "digestive" },
  { id: "constipation", label: { en: "Constipation", th: "ท้องผูก" }, category: "digestive" },
  { id: "bloating", label: { en: "Bloating or gas", th: "ท้องอืด" }, category: "digestive" },
  // Skin
  { id: "acne", label: { en: "Acne / spots", th: "สิว" }, category: "skin" },
  { id: "hives", label: { en: "Hives (raised itchy welts)", th: "ลมพิษ" }, category: "skin", concern: 1 },
  { id: "dry_skin", label: { en: "Dry or cracked skin", th: "ผิวแห้งหรือแตก" }, category: "skin" },
  { id: "insect_bites", label: { en: "Mosquito or insect bites", th: "ยุงหรือแมลงกัด" }, category: "skin" },
  { id: "sunburn", label: { en: "Sunburn", th: "ผิวไหม้จากแดด" }, category: "skin" },
  { id: "bruising", label: { en: "Bruising easily", th: "ช้ำง่าย" }, category: "skin", concern: 1 },
  { id: "jaundice", label: { en: "Yellow skin or eyes", th: "ตัวเหลืองหรือตาเหลือง" }, category: "skin", concern: 2 },
  { id: "infected_wound", label: { en: "Cut that is red, hot or swollen", th: "แผลบวม แดง ร้อน" }, category: "skin", concern: 1 },
  { id: "hair_loss", label: { en: "Hair loss", th: "ผมร่วง" }, category: "skin" },
  // Muscles & joints
  { id: "neck_pain", label: { en: "Neck or shoulder pain", th: "ปวดคอหรือไหล่" }, category: "muscle" },
  { id: "muscle_cramps", label: { en: "Muscle cramps", th: "ตะคริว" }, category: "muscle" },
  { id: "swollen_joint", label: { en: "Swollen joint", th: "ข้อบวม" }, category: "muscle", concern: 1 },
  { id: "sprain", label: { en: "Sprain or twisted ankle", th: "ข้อเคล็ด/ข้อเท้าพลิก" }, category: "muscle" },
  { id: "tingling", label: { en: "Tingling or pins and needles", th: "เหน็บชาหรือรู้สึกซ่า ๆ" }, category: "muscle" },
  // Heart & circulation
  { id: "palpitations", label: { en: "Fast or pounding heartbeat", th: "ใจสั่น/หัวใจเต้นเร็ว" }, category: "heart", concern: 1 },
  { id: "swollen_ankles", label: { en: "Swollen ankles or feet", th: "ข้อเท้าหรือเท้าบวม" }, category: "heart", concern: 1 },
  { id: "cold_hands", label: { en: "Cold hands or feet", th: "มือเท้าเย็น" }, category: "heart" },
  // Bladder & periods
  { id: "painful_urination", label: { en: "Pain or burning when peeing", th: "ปัสสาวะแสบขัด" }, category: "urinary", concern: 1 },
  { id: "frequent_urination", label: { en: "Peeing much more often", th: "ปัสสาวะบ่อยกว่าปกติมาก" }, category: "urinary", concern: 1 },
  { id: "dark_urine", label: { en: "Dark yellow urine", th: "ปัสสาวะสีเข้ม" }, category: "urinary" },
  { id: "blood_urine", label: { en: "Blood in urine", th: "ปัสสาวะมีเลือดปน" }, category: "urinary", concern: 2 },
  { id: "period_pain", label: { en: "Period pain", th: "ปวดประจำเดือน" }, category: "urinary" },
  { id: "irregular_periods", label: { en: "Irregular periods", th: "ประจำเดือนมาไม่สม่ำเสมอ" }, category: "urinary" },
  // Sleep, mood & focus
  { id: "oversleeping", label: { en: "Sleeping much more than usual", th: "นอนมากกว่าปกติมาก" }, category: "mental" },
  { id: "poor_focus", label: { en: "Trouble concentrating", th: "ไม่มีสมาธิ" }, category: "mental" },
  { id: "irritability", label: { en: "Irritable or short-tempered", th: "หงุดหงิดง่าย" }, category: "mental" },
  { id: "lonely", label: { en: "Feeling lonely or isolated", th: "รู้สึกเหงาหรือโดดเดี่ยว" }, category: "mental" },
  { id: "low_motivation", label: { en: "No energy or motivation", th: "ไม่มีแรงหรือแรงจูงใจ" }, category: "mental" },
];

/**
 * Recognised emergency warning signs. Based on widely published public guidance
 * (e.g. WHO, NHS, CDC, American Heart Association / Stroke "BE FAST").
 * Any one of these → "Urgent medical attention", regardless of anything else.
 */
export const RED_FLAGS: { id: string; label: L; why: L }[] = [
  {
    id: "chest_pain",
    label: { en: "Chest pain, pressure or tightness", th: "เจ็บ แน่น หรือบีบรัดหน้าอก" },
    why: { en: "Can be a sign of a heart problem that needs emergency care.", th: "อาจเป็นสัญญาณของปัญหาหัวใจที่ต้องรักษาฉุกเฉิน" },
  },
  {
    id: "breathing",
    label: { en: "Severe difficulty breathing", th: "หายใจลำบากรุนแรง" },
    why: { en: "Struggling to breathe needs urgent assessment.", th: "การหายใจลำบากต้องได้รับการประเมินอย่างเร่งด่วน" },
  },
  {
    id: "stroke",
    label: { en: "Face drooping, arm weakness or slurred speech", th: "หน้าเบี้ยว แขนอ่อนแรง หรือพูดไม่ชัด" },
    why: { en: "Possible stroke signs (BE FAST). Every minute matters.", th: "อาจเป็นสัญญาณโรคหลอดเลือดสมอง ทุกนาทีมีความสำคัญ" },
  },
  {
    id: "confusion",
    label: { en: "New confusion or hard to wake up", th: "สับสนเฉียบพลันหรือปลุกไม่ค่อยตื่น" },
    why: { en: "Sudden changes in alertness need urgent care.", th: "การเปลี่ยนแปลงความรู้สึกตัวอย่างฉับพลันต้องรักษาเร่งด่วน" },
  },
  {
    id: "thunderclap",
    label: { en: "Sudden, severe 'worst ever' headache", th: "ปวดศีรษะรุนแรงฉับพลันที่สุดในชีวิต" },
    why: { en: "A sudden severe headache can signal bleeding in the brain.", th: "อาจเป็นสัญญาณของเลือดออกในสมอง" },
  },
  {
    id: "stiff_neck",
    label: { en: "Fever with stiff neck or a rash that doesn't fade when pressed", th: "ไข้ร่วมกับคอแข็ง หรือผื่นที่กดแล้วไม่จาง" },
    why: { en: "Can be signs of serious infection such as meningitis.", th: "อาจเป็นสัญญาณของการติดเชื้อรุนแรง เช่น เยื่อหุ้มสมองอักเสบ" },
  },
  {
    id: "fainting",
    label: { en: "Fainting or seizure", th: "หมดสติหรือชัก" },
    why: { en: "Loss of consciousness needs urgent assessment.", th: "การหมดสติต้องได้รับการประเมินเร่งด่วน" },
  },
  {
    id: "bleeding",
    label: { en: "Heavy bleeding or vomiting / coughing blood", th: "เลือดออกมาก หรืออาเจียน/ไอเป็นเลือด" },
    why: { en: "Significant bleeding needs emergency care.", th: "เลือดออกมากต้องได้รับการรักษาฉุกเฉิน" },
  },
  {
    id: "blue_lips",
    label: { en: "Blue or grey lips, face or skin", th: "ริมฝีปาก หน้า หรือผิวเขียวคล้ำ" },
    why: { en: "May mean low oxygen levels.", th: "อาจหมายถึงออกซิเจนในเลือดต่ำ" },
  },
  {
    id: "dehydration",
    label: { en: "Unable to keep fluids down / no urine for 8+ hours", th: "ดื่มน้ำไม่ได้/ไม่ปัสสาวะเกิน 8 ชั่วโมง" },
    why: { en: "Signs of severe dehydration.", th: "สัญญาณของภาวะขาดน้ำรุนแรง" },
  },
  {
    id: "dengue_warning",
    label: { en: "Severe stomach pain, persistent vomiting or bleeding gums after a fever", th: "ปวดท้องรุนแรง อาเจียนต่อเนื่อง หรือเลือดออกตามไรฟันหลังมีไข้" },
    why: { en: "WHO lists these as dengue warning signs that need urgent care.", th: "WHO ระบุว่าเป็นสัญญาณเตือนของไข้เลือดออกที่ต้องรักษาด่วน" },
  },
  {
    id: "self_harm",
    label: { en: "Thoughts of harming yourself", th: "มีความคิดทำร้ายตัวเอง" },
    why: {
      en: "You deserve support right now. In Thailand call the Mental Health Hotline 1323 (24 h), or 1669 in an emergency.",
      th: "คุณควรได้รับความช่วยเหลือทันที โทรสายด่วนสุขภาพจิต 1323 (24 ชม.) หรือ 1669 กรณีฉุกเฉิน",
    },
  },
];

export const CONTEXT_OPTIONS: { id: string; label: L; raisesCare: boolean }[] = [
  { id: "chronic", label: { en: "Long-term condition (e.g. asthma, diabetes, heart disease)", th: "มีโรคประจำตัว (เช่น หอบหืด เบาหวาน โรคหัวใจ)" }, raisesCare: true },
  { id: "pregnant", label: { en: "Pregnant", th: "ตั้งครรภ์" }, raisesCare: true },
  { id: "immune", label: { en: "Weakened immune system", th: "ภูมิคุ้มกันต่ำ" }, raisesCare: true },
  { id: "older", label: { en: "Aged 65 or over", th: "อายุ 65 ปีขึ้นไป" }, raisesCare: true },
  { id: "young_child", label: { en: "Checking for a child under 5", th: "ตรวจให้เด็กอายุต่ำกว่า 5 ปี" }, raisesCare: true },
  { id: "travel", label: { en: "Recent travel", th: "เพิ่งเดินทางมา" }, raisesCare: false },
  { id: "sick_contact", label: { en: "Close contact with someone ill", th: "สัมผัสใกล้ชิดผู้ป่วย" }, raisesCare: false },
  { id: "worsening", label: { en: "Symptoms are getting worse", th: "อาการแย่ลง" }, raisesCare: true },
];

export const DURATION_OPTIONS: { id: string; label: L; days: number }[] = [
  { id: "lt1", label: { en: "Less than a day", th: "น้อยกว่า 1 วัน" }, days: 0.5 },
  { id: "1to3", label: { en: "1–3 days", th: "1–3 วัน" }, days: 2 },
  { id: "4to7", label: { en: "4–7 days", th: "4–7 วัน" }, days: 5 },
  { id: "1to2w", label: { en: "1–2 weeks", th: "1–2 สัปดาห์" }, days: 10 },
  { id: "gt2w", label: { en: "More than 2 weeks", th: "มากกว่า 2 สัปดาห์" }, days: 21 },
];

export const symptomLabel = (id: string) => SYMPTOMS.find((s) => s.id === id)?.label;
