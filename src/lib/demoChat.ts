import type { L, Lang } from "./i18n";

interface DemoAnswer {
  keys: RegExp;
  answer: L;
}

const A: DemoAnswer[] = [
  {
    keys: /headache|head ache|migraine|ปวดหัว|ปวดศีรษะ/i,
    answer: {
      en: "**Common causes of headaches** include stress and muscle tension, not drinking enough water, missing meals, poor sleep, long screen time, and colds or flu. Most headaches are not a sign of anything serious.\n\n**Things that often help:** rest, water, regular meals, screen breaks and fresh air.\n\n**Get urgent help** for a sudden 'worst ever' headache, a headache with fever and stiff neck, weakness, confusion, slurred speech, or after a head injury.\n\nSource: WHO — Headache disorders; NHS — Headaches.",
      th: "**สาเหตุที่พบบ่อยของอาการปวดศีรษะ** ได้แก่ ความเครียดและกล้ามเนื้อตึง ดื่มน้ำน้อย อดอาหาร นอนไม่พอ ใช้หน้าจอนาน และหวัดหรือไข้หวัดใหญ่ ส่วนใหญ่ไม่ใช่สัญญาณของโรคร้ายแรง\n\n**สิ่งที่มักช่วยได้:** พักผ่อน ดื่มน้ำ กินอาหารตรงเวลา พักสายตา และรับอากาศบริสุทธิ์\n\n**รีบไปพบแพทย์ทันที** หากปวดศีรษะรุนแรงฉับพลัน ปวดร่วมกับไข้และคอแข็ง อ่อนแรง สับสน พูดไม่ชัด หรือหลังศีรษะกระแทก\n\nแหล่งที่มา: WHO, NHS",
    },
  },
  {
    keys: /sick|\bill\b|immun|catch a|risk of getting|ป่วย|ภูมิคุ้มกัน|ไม่สบาย/i,
    answer: {
      en: "**Ways to lower your chance of getting sick** (no method is 100%):\n\n1. Wash hands with soap for 20 seconds, especially before eating.\n2. Sleep 8–10 hours (teenagers).\n3. Eat plenty of vegetables and fruit and drink water.\n4. Be active about 60 minutes a day.\n5. Keep up to date with recommended vaccines — ask your doctor or nurse.\n6. Cover coughs and sneezes; open windows for fresh air.\n7. Remove standing water to reduce mosquitoes (dengue).\n\nSource: WHO and CDC public guidance.",
      th: "**วิธีลดโอกาสเจ็บป่วย** (ไม่มีวิธีใดได้ผล 100%):\n\n1. ล้างมือด้วยสบู่ 20 วินาที โดยเฉพาะก่อนกินอาหาร\n2. นอน 8–10 ชั่วโมง (วัยรุ่น)\n3. กินผักผลไม้และดื่มน้ำให้เพียงพอ\n4. ออกกำลังกายประมาณ 60 นาทีต่อวัน\n5. รับวัคซีนตามคำแนะนำ — ปรึกษาแพทย์หรือพยาบาล\n6. ปิดปากเวลาไอจาม เปิดหน้าต่างให้อากาศถ่ายเท\n7. กำจัดน้ำขังเพื่อลดยุง (ไข้เลือดออก)\n\nแหล่งที่มา: WHO, CDC",
    },
  },
  {
    keys: /habit|healthy|lifestyle|นิสัย|สุขภาพดี|ไลฟ์สไตล์/i,
    answer: {
      en: "**Healthy habits backed by public health guidance:**\n\n- **Sleep:** regular bedtime, screens off before bed.\n- **Move:** 60 minutes of activity a day for ages 5–17.\n- **Eat:** half your plate vegetables and fruit; fewer sugary drinks.\n- **Hydrate:** carry a water bottle, especially in hot weather.\n- **Hygiene:** handwashing and covering coughs.\n- **Mind:** take breaks, talk to people you trust.\n- **Environment:** check air quality and UV before outdoor sport.",
      th: "**นิสัยสุขภาพดีตามคำแนะนำด้านสาธารณสุข:**\n\n- **นอน:** เข้านอนเป็นเวลา ปิดหน้าจอก่อนนอน\n- **เคลื่อนไหว:** 60 นาทีต่อวันสำหรับอายุ 5–17 ปี\n- **กิน:** ผักผลไม้ครึ่งจาน ลดเครื่องดื่มหวาน\n- **ดื่มน้ำ:** พกขวดน้ำ โดยเฉพาะวันที่ร้อน\n- **สุขอนามัย:** ล้างมือและปิดปากเวลาไอ\n- **จิตใจ:** พักบ้าง และพูดคุยกับคนที่ไว้ใจ\n- **สิ่งแวดล้อม:** ตรวจคุณภาพอากาศและยูวีก่อนเล่นกีฬากลางแจ้ง",
    },
  },
  {
    keys: /when should|see a doctor|seek|medical advice|hospital|emergency|เมื่อไร|หาหมอ|พบแพทย์|โรงพยาบาล|ฉุกเฉิน/i,
    answer: {
      en: "**Call 1669 (Thailand) or your local emergency number now** for: chest pain, severe difficulty breathing, signs of stroke (face drooping, arm weakness, slurred speech), fainting or seizure, heavy bleeding, or blue/grey lips.\n\n**See a doctor or clinic soon** if: a fever lasts more than 3 days, symptoms last more than a week or keep getting worse, you can't keep fluids down, or you have a long-term condition and feel unwell.\n\n**A pharmacist** can help with minor illnesses and explain medicines.\n\nIf you are ever unsure, it is always okay to ask a health professional.",
      th: "**โทร 1669 หรือเบอร์ฉุกเฉินทันที** เมื่อ: เจ็บหน้าอก หายใจลำบากรุนแรง มีอาการโรคหลอดเลือดสมอง (หน้าเบี้ยว แขนอ่อนแรง พูดไม่ชัด) หมดสติหรือชัก เลือดออกมาก หรือริมฝีปากเขียวคล้ำ\n\n**ไปพบแพทย์หรือคลินิกโดยเร็ว** หาก: มีไข้เกิน 3 วัน อาการเกิน 1 สัปดาห์หรือแย่ลง ดื่มน้ำไม่ได้ หรือมีโรคประจำตัวแล้วรู้สึกไม่สบาย\n\n**เภสัชกร** ช่วยเรื่องการเจ็บป่วยเล็กน้อยและอธิบายเรื่องยาได้\n\nหากไม่แน่ใจ การปรึกษาบุคลากรทางการแพทย์เป็นสิ่งที่ดีเสมอ",
    },
  },
  {
    keys: /dengue|mosquito|ไข้เลือดออก|ยุง/i,
    answer: {
      en: "**Dengue** is a viral infection spread by *Aedes* mosquitoes, common in tropical regions including Thailand, especially in the rainy season.\n\n**Prevention:** empty or cover containers that hold water every week, use repellent, wear long sleeves, and use screens or nets.\n\n**Warning signs (WHO)** — get urgent care: severe stomach pain, persistent vomiting, bleeding gums or nose, blood in vomit, fast breathing, feeling very tired or restless — often appearing as the fever goes down.\n\nSource: WHO — Dengue and severe dengue fact sheet.",
      th: "**ไข้เลือดออก** เป็นการติดเชื้อไวรัสที่มียุงลายเป็นพาหะ พบบ่อยในเขตร้อนรวมถึงประเทศไทย โดยเฉพาะฤดูฝน\n\n**การป้องกัน:** เทหรือปิดภาชนะที่ขังน้ำทุกสัปดาห์ ใช้ยากันยุง สวมเสื้อแขนยาว และใช้มุ้งหรือมุ้งลวด\n\n**สัญญาณเตือน (WHO)** — ต้องรีบรักษา: ปวดท้องรุนแรง อาเจียนต่อเนื่อง เลือดออกตามไรฟันหรือจมูก อาเจียนเป็นเลือด หายใจเร็ว อ่อนเพลียมากหรือกระสับกระส่าย มักเกิดช่วงไข้ลด\n\nแหล่งที่มา: WHO",
    },
  },
  {
    keys: /pm2|pm 2|air|pollution|smog|haze|ฝุ่น|มลพิษ|อากาศ/i,
    answer: {
      en: "**PM2.5** are tiny particles that can travel deep into the lungs. On high-PM2.5 days:\n\n- Check the AQI (see the Environment page).\n- Reduce long or intense outdoor exercise when AQI is above 100, especially if you have asthma.\n- A well-fitted N95/KN95 mask filters fine particles better than cloth or surgical masks.\n- Keep windows closed during haze; an air purifier with a HEPA filter can help indoors.\n\nSource: WHO — Ambient air quality and health.",
      th: "**PM2.5** คือฝุ่นละเอียดที่เข้าสู่ปอดได้ลึก ในวันที่ฝุ่นสูง:\n\n- ตรวจค่า AQI (ดูหน้าสิ่งแวดล้อม)\n- ลดการออกกำลังกายกลางแจ้งที่นานหรือหนักเมื่อ AQI เกิน 100 โดยเฉพาะผู้ที่เป็นหอบหืด\n- หน้ากาก N95/KN95 ที่กระชับกรองฝุ่นได้ดีกว่าหน้ากากผ้าหรือหน้ากากอนามัย\n- ปิดหน้าต่างช่วงหมอกควัน เครื่องฟอกอากาศแบบ HEPA ช่วยได้ในอาคาร\n\nแหล่งที่มา: WHO",
    },
  },
  {
    keys: /sleep|tired|insomnia|นอน|เหนื่อย|อ่อนเพลีย/i,
    answer: {
      en: "**Better sleep tips:** keep the same bedtime and wake time, put screens away 30–60 minutes before bed, keep the room dark and cool, limit caffeine after lunch, and get daylight and exercise during the day. Teenagers generally need 8–10 hours.\n\nIf tiredness lasts weeks despite good sleep, or comes with other symptoms, it's worth talking to a doctor.",
      th: "**เคล็ดลับการนอนที่ดี:** เข้านอนและตื่นเวลาเดิม เลิกใช้หน้าจอ 30–60 นาทีก่อนนอน ห้องมืดและเย็น ลดคาเฟอีนหลังเที่ยง รับแสงแดดและออกกำลังกายในตอนกลางวัน วัยรุ่นควรนอน 8–10 ชั่วโมง\n\nหากอ่อนเพลียหลายสัปดาห์แม้นอนพอ หรือมีอาการอื่นร่วม ควรปรึกษาแพทย์",
    },
  },
  {
    keys: /stress|anxi|exam|worr|เครียด|กังวล|สอบ/i,
    answer: {
      en: "Feeling stressed, especially around exams, is very common. Things that help many people: breaking work into small steps, regular breaks, sleep, exercise, time outdoors, and talking to friends, family or a school counsellor.\n\nIf stress or low mood lasts more than two weeks or affects daily life, please talk to a professional. In Thailand the Mental Health Hotline **1323** is free and open 24 hours.",
      th: "ความเครียดโดยเฉพาะช่วงสอบเป็นเรื่องปกติมาก สิ่งที่ช่วยได้: แบ่งงานเป็นขั้นเล็ก ๆ พักเป็นระยะ นอนให้พอ ออกกำลังกาย ใช้เวลากลางแจ้ง และพูดคุยกับเพื่อน ครอบครัว หรือครูแนะแนว\n\nหากเครียดหรือหดหู่นานกว่า 2 สัปดาห์หรือกระทบชีวิตประจำวัน โปรดปรึกษาผู้เชี่ยวชาญ สายด่วนสุขภาพจิต **1323** ฟรี 24 ชั่วโมง",
    },
  },
];

const FALLBACK: L = {
  en: "In **demonstration mode** I can only answer a set of common questions, such as:\n\n- What are common causes of headaches?\n- How can I reduce my risk of getting sick?\n- What are some healthy habits?\n- When should someone seek medical advice?\n- How do I protect myself from dengue or PM2.5?\n\nTo get answers to any question, the app owner can add an AI key (see the README). For personal medical concerns, please talk to a pharmacist, nurse or doctor.",
  th: "ใน **โหมดสาธิต** ฉันตอบได้เฉพาะคำถามทั่วไปบางข้อ เช่น:\n\n- สาเหตุที่พบบ่อยของอาการปวดศีรษะคืออะไร?\n- ฉันจะลดความเสี่ยงการเจ็บป่วยได้อย่างไร?\n- นิสัยสุขภาพดีมีอะไรบ้าง?\n- เมื่อไรควรไปพบแพทย์?\n- ป้องกันไข้เลือดออกหรือฝุ่น PM2.5 อย่างไร?\n\nหากต้องการตอบได้ทุกคำถาม เจ้าของแอปสามารถเพิ่มคีย์ AI (ดู README) สำหรับปัญหาสุขภาพส่วนตัว โปรดปรึกษาเภสัชกร พยาบาล หรือแพทย์",
};

export function demoChatAnswer(q: string, lang: Lang) {
  const hit = A.find((a) => a.keys.test(q));
  return (hit ?? { answer: FALLBACK }).answer[lang];
}
