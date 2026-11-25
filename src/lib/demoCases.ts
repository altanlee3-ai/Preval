import type { L, Lang } from "./i18n";

export interface AnalysisResult {
  summary: string;
  possibleCauses: { name: string; explanation: string }[];
  warningSigns: string[];
  whenToSeekCare: string[];
  selfCare: string[];
  prevention: string[];
  limitations: string;
  sources: string[];
}

interface DemoCase {
  id: string;
  title: L;
  match: string[];
  summary: L;
  causes: { name: L; explanation: L }[];
  warning: L[];
  seek: L[];
  selfCare: L[];
  prevention: L[];
  sources: string[];
}

const COMMON_SEEK: L[] = [
  { en: "Symptoms last longer than expected or keep getting worse", th: "อาการนานกว่าที่ควรหรือแย่ลงเรื่อย ๆ" },
  { en: "You are worried, or you have a long-term health condition", th: "คุณกังวล หรือมีโรคประจำตัว" },
];

const COMMON_SELF: L[] = [
  { en: "Rest and drink enough fluids (water is best)", th: "พักผ่อนและดื่มน้ำให้เพียงพอ" },
  { en: "Ask a pharmacist before taking any medicine, and follow the label", th: "ปรึกษาเภสัชกรก่อนใช้ยาใด ๆ และปฏิบัติตามฉลาก" },
];

export const DEMO_CASES: DemoCase[] = [
  {
    id: "resp",
    title: { en: "Cold-like respiratory symptoms", th: "อาการทางเดินหายใจคล้ายหวัด" },
    match: ["cough", "sore_throat", "runny_nose", "sneezing", "fever", "fatigue", "headache", "phlegm", "hoarse_voice", "loss_smell", "sinus_pain", "swollen_glands", "wheezing"],
    summary: {
      en: "Cough, sore throat and a runny nose together are a very common pattern, often linked to everyday viral infections of the nose and throat. Allergies can look similar, especially without fever.",
      th: "ไอ เจ็บคอ และน้ำมูกไหลร่วมกันเป็นรูปแบบที่พบบ่อยมาก มักเกี่ยวข้องกับการติดเชื้อไวรัสทั่วไปในจมูกและลำคอ ภูมิแพ้อาจมีอาการคล้ายกันโดยเฉพาะเมื่อไม่มีไข้",
    },
    causes: [
      { name: { en: "Common cold (viral upper respiratory infection)", th: "หวัดธรรมดา (ติดเชื้อไวรัสทางเดินหายใจส่วนบน)" }, explanation: { en: "Usually mild and improves within 7–10 days.", th: "มักไม่รุนแรงและดีขึ้นภายใน 7–10 วัน" } },
      { name: { en: "Influenza (flu)", th: "ไข้หวัดใหญ่" }, explanation: { en: "Tends to start suddenly with fever, aches and tiredness.", th: "มักเริ่มฉับพลันด้วยไข้ ปวดเมื่อย และอ่อนเพลีย" } },
      { name: { en: "Allergic rhinitis (hay fever)", th: "โรคจมูกอักเสบจากภูมิแพ้" }, explanation: { en: "Sneezing and itchy eyes without fever; may follow dust, pollen or smoke.", th: "จามและคันตาโดยไม่มีไข้ อาจเกิดหลังสัมผัสฝุ่น เกสร หรือควัน" } },
    ],
    warning: [
      { en: "Difficulty breathing or chest pain", th: "หายใจลำบากหรือเจ็บหน้าอก" },
      { en: "Lips or face turning blue or grey", th: "ริมฝีปากหรือใบหน้าเขียวคล้ำ" },
      { en: "High fever that does not come down, or confusion", th: "ไข้สูงไม่ลด หรือสับสน" },
    ],
    seek: [{ en: "Fever for more than 3 days, or a cough lasting over 3 weeks", th: "มีไข้นานเกิน 3 วัน หรือไอนานเกิน 3 สัปดาห์" }, ...COMMON_SEEK],
    selfCare: [...COMMON_SELF, { en: "Warm drinks and honey may soothe a sore throat (not for babies under 1)", th: "เครื่องดื่มอุ่นและน้ำผึ้งอาจช่วยบรรเทาอาการเจ็บคอ (ห้ามให้เด็กอายุต่ำกว่า 1 ปี)" }],
    prevention: [
      { en: "Wash hands with soap for at least 20 seconds", th: "ล้างมือด้วยสบู่อย่างน้อย 20 วินาที" },
      { en: "Cover coughs and sneezes; consider a mask when unwell around others", th: "ปิดปากเวลาไอจาม และสวมหน้ากากเมื่อไม่สบายและอยู่กับผู้อื่น" },
      { en: "Ask about the yearly flu vaccine", th: "สอบถามเรื่องวัคซีนไข้หวัดใหญ่ประจำปี" },
    ],
    sources: ["WHO — Influenza (seasonal) fact sheet", "CDC — Common Colds: Protect Yourself and Others", "NHS — Common cold"],
  },
  {
    id: "head",
    title: { en: "Headache and tiredness", th: "ปวดศีรษะและอ่อนเพลีย" },
    match: ["headache", "dizziness", "fatigue", "poor_sleep", "stress", "eye_irritation"],
    summary: {
      en: "Headaches are extremely common. Most are not caused by serious illness and are often linked to stress, lack of sleep, not drinking enough water, screen use or skipped meals.",
      th: "อาการปวดศีรษะพบได้บ่อยมาก ส่วนใหญ่ไม่ได้เกิดจากโรคร้ายแรง และมักเกี่ยวข้องกับความเครียด การนอนไม่พอ ดื่มน้ำน้อย การใช้หน้าจอ หรือการอดอาหาร",
    },
    causes: [
      { name: { en: "Tension-type headache", th: "ปวดศีรษะจากความตึงเครียด" }, explanation: { en: "A tight band-like feeling, often with stress or poor posture.", th: "รู้สึกบีบรัดรอบศีรษะ มักเกิดร่วมกับความเครียดหรือท่าทางไม่ดี" } },
      { name: { en: "Dehydration or missed meals", th: "ขาดน้ำหรืออดอาหาร" }, explanation: { en: "Common in hot weather or busy days.", th: "พบบ่อยในอากาศร้อนหรือวันที่ยุ่ง" } },
      { name: { en: "Lack of sleep or eye strain", th: "นอนไม่พอหรือตาล้า" }, explanation: { en: "Long screen time and late nights can trigger headaches.", th: "การใช้หน้าจอนานและนอนดึกอาจกระตุ้นอาการปวดศีรษะ" } },
    ],
    warning: [
      { en: "Sudden, very severe headache ('worst ever')", th: "ปวดศีรษะรุนแรงฉับพลัน (รุนแรงที่สุด)" },
      { en: "Headache with stiff neck, fever and rash", th: "ปวดศีรษะร่วมกับคอแข็ง มีไข้ และผื่น" },
      { en: "Weakness, confusion, slurred speech or vision loss", th: "อ่อนแรง สับสน พูดไม่ชัด หรือมองไม่เห็น" },
      { en: "Headache after a head injury", th: "ปวดศีรษะหลังได้รับบาดเจ็บที่ศีรษะ" },
    ],
    seek: [{ en: "Headaches that keep coming back or wake you up", th: "ปวดศีรษะบ่อย ๆ หรือปวดจนตื่นนอน" }, ...COMMON_SEEK],
    selfCare: [...COMMON_SELF, { en: "Take regular screen breaks (20-20-20 rule)", th: "พักสายตาจากหน้าจอเป็นระยะ (กฎ 20-20-20)" }],
    prevention: [
      { en: "Aim for 8–10 hours of sleep (teenagers)", th: "นอนหลับ 8–10 ชั่วโมง (วัยรุ่น)" },
      { en: "Drink water regularly through the day", th: "ดื่มน้ำสม่ำเสมอตลอดวัน" },
      { en: "Regular meals and physical activity help", th: "กินอาหารตรงเวลาและออกกำลังกายสม่ำเสมอ" },
    ],
    sources: ["WHO — Headache disorders fact sheet", "NHS — Headaches"],
  },
  {
    id: "gut",
    title: { en: "Stomach upset", th: "ท้องไส้ปั่นป่วน" },
    match: ["nausea", "vomiting", "diarrhea", "stomach_pain", "loss_appetite", "fever", "heartburn", "constipation", "bloating"],
    summary: {
      en: "Nausea, vomiting and diarrhoea together often come from a short-lived stomach infection or something eaten. The main risk is losing too much fluid (dehydration).",
      th: "คลื่นไส้ อาเจียน และท้องเสียร่วมกันมักเกิดจากการติดเชื้อในทางเดินอาหารระยะสั้นหรืออาหารที่รับประทาน ความเสี่ยงหลักคือการขาดน้ำ",
    },
    causes: [
      { name: { en: "Viral gastroenteritis ('stomach bug')", th: "กระเพาะและลำไส้อักเสบจากไวรัส" }, explanation: { en: "Spreads easily; usually settles in a few days.", th: "ติดต่อได้ง่าย มักหายภายในไม่กี่วัน" } },
      { name: { en: "Food-borne illness", th: "อาหารเป็นพิษ" }, explanation: { en: "From contaminated food or water.", th: "จากอาหารหรือน้ำที่ปนเปื้อน" } },
      { name: { en: "Indigestion", th: "อาหารไม่ย่อย" }, explanation: { en: "Discomfort after large, spicy or fatty meals.", th: "ไม่สบายท้องหลังมื้อใหญ่ เผ็ด หรือมัน" } },
    ],
    warning: [
      { en: "Cannot keep any fluids down, or no urine for 8+ hours", th: "ดื่มน้ำไม่ได้เลย หรือไม่ปัสสาวะเกิน 8 ชั่วโมง" },
      { en: "Blood in vomit or stool, or black stools", th: "อาเจียนหรืออุจจาระมีเลือด หรืออุจจาระสีดำ" },
      { en: "Severe or constant stomach pain", th: "ปวดท้องรุนแรงหรือต่อเนื่อง" },
    ],
    seek: [{ en: "Diarrhoea for more than 7 days or vomiting for more than 2 days", th: "ท้องเสียนานเกิน 7 วัน หรืออาเจียนนานเกิน 2 วัน" }, ...COMMON_SEEK],
    selfCare: [{ en: "Sip fluids often; oral rehydration solution (ORS) helps replace salts", th: "จิบน้ำบ่อย ๆ ผงเกลือแร่ (ORS) ช่วยทดแทนเกลือแร่" }, ...COMMON_SELF.slice(1)],
    prevention: [
      { en: "Wash hands before eating and after using the toilet", th: "ล้างมือก่อนรับประทานอาหารและหลังเข้าห้องน้ำ" },
      { en: "Eat freshly cooked food; drink safe water", th: "รับประทานอาหารปรุงสุกใหม่ ดื่มน้ำสะอาด" },
      { en: "WHO 'Five Keys to Safer Food'", th: "หลัก 5 ประการเพื่ออาหารปลอดภัยขององค์การอนามัยโลก" },
    ],
    sources: ["WHO — Diarrhoeal disease fact sheet", "WHO — Five Keys to Safer Food"],
  },
  {
    id: "skin",
    title: { en: "Rash or itchy skin", th: "ผื่นหรือคันผิวหนัง" },
    match: ["rash", "itching", "eye_irritation", "sneezing", "hives", "insect_bites", "sunburn", "dry_skin", "acne"],
    summary: {
      en: "Itchy skin and rashes are often caused by irritation, allergy, heat or insect bites. A rash together with fever needs more attention.",
      th: "อาการคันและผื่นมักเกิดจากการระคายเคือง ภูมิแพ้ ความร้อน หรือแมลงกัด ผื่นที่มาพร้อมไข้ควรได้รับความสนใจมากขึ้น",
    },
    causes: [
      { name: { en: "Contact or allergic dermatitis", th: "ผิวหนังอักเสบจากการสัมผัสหรือภูมิแพ้" }, explanation: { en: "Reaction to soaps, plants, metals or new products.", th: "ปฏิกิริยาต่อสบู่ พืช โลหะ หรือผลิตภัณฑ์ใหม่" } },
      { name: { en: "Heat rash", th: "ผดร้อน" }, explanation: { en: "Small itchy spots in hot, humid weather.", th: "ตุ่มเล็ก ๆ คันในอากาศร้อนชื้น" } },
      { name: { en: "Insect bites", th: "แมลงกัด" }, explanation: { en: "Itchy bumps, often on exposed skin.", th: "ตุ่มคัน มักอยู่บนผิวที่ไม่ได้ปกปิด" } },
    ],
    warning: [
      { en: "Swelling of lips, tongue or throat, or trouble breathing (possible severe allergy)", th: "ริมฝีปาก ลิ้น หรือคอบวม หรือหายใจลำบาก (อาจแพ้รุนแรง)" },
      { en: "A rash that does not fade when a glass is pressed on it, with fever", th: "ผื่นที่กดด้วยแก้วแล้วไม่จาง ร่วมกับไข้" },
    ],
    seek: [{ en: "Rash with fever, or spreading quickly, or blistering", th: "ผื่นร่วมกับไข้ ลามเร็ว หรือเป็นตุ่มพอง" }, ...COMMON_SEEK],
    selfCare: [{ en: "Avoid scratching; keep skin cool; stop any new product", th: "หลีกเลี่ยงการเกา ทำให้ผิวเย็น และหยุดใช้ผลิตภัณฑ์ใหม่" }, COMMON_SELF[1]],
    prevention: [
      { en: "Use insect repellent and cover skin, especially at dawn and dusk", th: "ใช้ยากันยุงและสวมเสื้อผ้าปกปิด โดยเฉพาะช่วงเช้าและเย็น" },
      { en: "Wear loose cotton clothes in hot weather", th: "สวมเสื้อผ้าฝ้ายหลวม ๆ ในอากาศร้อน" },
    ],
    sources: ["NHS — Rashes in adults", "WHO — Vector-borne diseases"],
  },
  {
    id: "fever_aches",
    title: { en: "Fever with body aches", th: "ไข้ร่วมกับปวดเมื่อยตามตัว" },
    match: ["fever", "body_aches", "joint_pain", "chills", "fatigue", "headache", "rash"],
    summary: {
      en: "Fever with aches is how the body commonly responds to infections. In tropical areas such as Thailand, dengue is one of several infections to be aware of, particularly in the rainy season. Only a test can confirm the cause.",
      th: "ไข้ร่วมกับอาการปวดเมื่อยเป็นการตอบสนองทั่วไปของร่างกายต่อการติดเชื้อ ในพื้นที่เขตร้อนอย่างประเทศไทย ไข้เลือดออกเป็นหนึ่งในโรคที่ควรระวัง โดยเฉพาะในฤดูฝน มีเพียงการตรวจเท่านั้นที่ยืนยันสาเหตุได้",
    },
    causes: [
      { name: { en: "Influenza or other viral infections", th: "ไข้หวัดใหญ่หรือการติดเชื้อไวรัสอื่น ๆ" }, explanation: { en: "Common causes of fever and muscle aches.", th: "สาเหตุที่พบบ่อยของไข้และปวดกล้ามเนื้อ" } },
      { name: { en: "Dengue (in areas where it occurs)", th: "ไข้เลือดออก (ในพื้นที่ที่มีการระบาด)" }, explanation: { en: "Spread by mosquitoes; high fever, headache, eye and joint pain. Needs medical assessment.", th: "ติดต่อผ่านยุง มีไข้สูง ปวดศีรษะ ปวดตาและข้อ ควรได้รับการประเมินจากแพทย์" } },
    ],
    warning: [
      { en: "Severe stomach pain, persistent vomiting, bleeding gums or nose (WHO dengue warning signs)", th: "ปวดท้องรุนแรง อาเจียนต่อเนื่อง เลือดออกตามไรฟันหรือจมูก (สัญญาณเตือนไข้เลือดออกตาม WHO)" },
      { en: "Feeling very drowsy, restless or confused", th: "ง่วงซึมมาก กระสับกระส่าย หรือสับสน" },
      { en: "Fever with stiff neck or a non-fading rash", th: "ไข้ร่วมกับคอแข็งหรือผื่นที่กดไม่จาง" },
    ],
    seek: [{ en: "High fever (especially if it lasts more than 2–3 days) in a dengue area", th: "ไข้สูง (โดยเฉพาะเกิน 2–3 วัน) ในพื้นที่ที่มีไข้เลือดออก" }, ...COMMON_SEEK],
    selfCare: [
      { en: "Rest and drink plenty of fluids", th: "พักผ่อนและดื่มน้ำมาก ๆ" },
      { en: "Speak to a pharmacist or doctor before taking pain relievers — some are not advised if dengue is possible", th: "ปรึกษาเภสัชกรหรือแพทย์ก่อนใช้ยาแก้ปวด เพราะยาบางชนิดไม่แนะนำหากอาจเป็นไข้เลือดออก" },
    ],
    prevention: [
      { en: "Remove standing water around the home weekly", th: "กำจัดน้ำขังรอบบ้านทุกสัปดาห์" },
      { en: "Use repellent, screens and long sleeves", th: "ใช้ยากันยุง มุ้งลวด และเสื้อแขนยาว" },
      { en: "Stay up to date with recommended vaccines", th: "รับวัคซีนตามคำแนะนำให้ครบ" },
    ],
    sources: ["WHO — Dengue and severe dengue fact sheet", "WHO — Influenza (seasonal) fact sheet"],
  },
  {
    id: "mind",
    title: { en: "Stress, low mood or poor sleep", th: "ความเครียด อารมณ์หดหู่ หรือนอนไม่หลับ" },
    match: ["stress", "low_mood", "poor_sleep", "fatigue", "headache", "loss_appetite", "poor_focus", "irritability", "lonely", "low_motivation", "oversleeping"],
    summary: {
      en: "Stress, low mood and sleep problems often go together and are very common, especially around exams or big changes. They are real health issues and support helps.",
      th: "ความเครียด อารมณ์หดหู่ และปัญหาการนอนมักเกิดร่วมกันและพบได้บ่อย โดยเฉพาะช่วงสอบหรือมีการเปลี่ยนแปลงครั้งใหญ่ เป็นปัญหาสุขภาพจริงและการได้รับการสนับสนุนช่วยได้",
    },
    causes: [
      { name: { en: "Stress and pressure", th: "ความเครียดและแรงกดดัน" }, explanation: { en: "School, relationships or worries can affect sleep and energy.", th: "การเรียน ความสัมพันธ์ หรือความกังวลอาจส่งผลต่อการนอนและพลังงาน" } },
      { name: { en: "Irregular sleep habits", th: "พฤติกรรมการนอนไม่สม่ำเสมอ" }, explanation: { en: "Late screen use and caffeine can disrupt sleep.", th: "การใช้หน้าจอดึกและคาเฟอีนอาจรบกวนการนอน" } },
    ],
    warning: [{ en: "Thoughts of harming yourself — call 1323 (Thailand mental health hotline, 24 h) or 1669 now", th: "มีความคิดทำร้ายตัวเอง — โทร 1323 (สายด่วนสุขภาพจิต 24 ชม.) หรือ 1669 ทันที" }],
    seek: [{ en: "Low mood most days for more than 2 weeks, or it affects daily life", th: "อารมณ์หดหู่เกือบทุกวันนานกว่า 2 สัปดาห์ หรือกระทบชีวิตประจำวัน" }, ...COMMON_SEEK],
    selfCare: [
      { en: "Talk to someone you trust — a friend, family member or school counsellor", th: "พูดคุยกับคนที่ไว้ใจ เช่น เพื่อน ครอบครัว หรือครูแนะแนว" },
      { en: "Keep a regular sleep time and limit screens before bed", th: "เข้านอนเป็นเวลาและลดการใช้หน้าจอก่อนนอน" },
    ],
    prevention: [
      { en: "Regular physical activity supports mood and sleep", th: "การออกกำลังกายสม่ำเสมอช่วยเรื่องอารมณ์และการนอน" },
      { en: "Plan breaks and time outdoors", th: "วางแผนพักและใช้เวลากลางแจ้ง" },
    ],
    sources: ["WHO — Mental health of adolescents fact sheet", "Thailand Department of Mental Health — Hotline 1323"],
  },
  {
    id: "heat",
    title: { en: "Heat and dehydration", th: "ความร้อนและการขาดน้ำ" },
    match: ["overheated", "thirst", "dark_urine", "dizziness", "lightheaded", "muscle_cramps", "headache", "fatigue", "nausea"],
    summary: {
      en: "Feeling hot, thirsty, dizzy or crampy, with dark urine, often happens when the body loses more water and salt than it takes in, which is common in hot, humid weather like Thailand's.",
      th: "รู้สึกร้อน กระหายน้ำ เวียนศีรษะ หรือเป็นตะคริว ร่วมกับปัสสาวะสีเข้ม มักเกิดเมื่อร่างกายเสียน้ำและเกลือแร่มากกว่าที่ได้รับ ซึ่งพบบ่อยในอากาศร้อนชื้นอย่างประเทศไทย",
    },
    causes: [
      { name: { en: "Mild dehydration", th: "ขาดน้ำเล็กน้อย" }, explanation: { en: "Not drinking enough, especially during sport or hot days.", th: "ดื่มน้ำไม่พอ โดยเฉพาะเวลาเล่นกีฬาหรือวันที่อากาศร้อน" } },
      { name: { en: "Heat exhaustion", th: "อาการเพลียแดด" }, explanation: { en: "Heavy sweating, weakness and dizziness after time in the heat. Usually improves within 30 minutes of cooling down.", th: "เหงื่อออกมาก อ่อนแรง เวียนศีรษะ หลังอยู่ในที่ร้อน มักดีขึ้นใน 30 นาทีหลังทำให้ร่างกายเย็นลง" } },
    ],
    warning: [
      { en: "Confusion, fainting or a seizure (possible heatstroke, call 1669)", th: "สับสน หมดสติ หรือชัก (อาจเป็นโรคลมแดด โทร 1669)" },
      { en: "Hot skin that has stopped sweating, or temperature above 40 °C", th: "ผิวร้อนแต่ไม่มีเหงื่อ หรืออุณหภูมิเกิน 40 °C" },
      { en: "Not improving after 30 minutes of rest in a cool place with fluids", th: "ไม่ดีขึ้นหลังพักในที่เย็นและดื่มน้ำ 30 นาที" },
    ],
    seek: COMMON_SEEK,
    selfCare: [
      { en: "Move to a cool, shaded place and loosen tight clothing", th: "ย้ายไปที่เย็นและร่ม คลายเสื้อผ้าให้หลวม" },
      { en: "Sip water or an oral rehydration drink", th: "จิบน้ำหรือเกลือแร่ (ORS)" },
      { en: "Cool the skin with a damp cloth or fan", th: "เช็ดตัวด้วยผ้าชุบน้ำหรือใช้พัดลม" },
    ],
    prevention: [
      { en: "Check the heat index on the Environment page before outdoor sport", th: "ดูดัชนีความร้อนในหน้าสิ่งแวดล้อมก่อนเล่นกีฬากลางแจ้ง" },
      { en: "Drink regularly before you feel thirsty; pale urine is a good sign", th: "ดื่มน้ำสม่ำเสมอก่อนรู้สึกกระหาย ปัสสาวะสีอ่อนคือสัญญาณที่ดี" },
      { en: "Avoid hard exercise in the hottest hours (about 11:00–15:00)", th: "หลีกเลี่ยงการออกกำลังกายหนักช่วงร้อนที่สุด (ประมาณ 11:00–15:00 น.)" },
    ],
    sources: ["WHO — Heat and health fact sheet", "CDC — Heat-related illness", "NHS — Heat exhaustion and heatstroke"],
  },
  {
    id: "urinary",
    title: { en: "Bladder and urine symptoms", th: "อาการทางเดินปัสสาวะ" },
    match: ["painful_urination", "frequent_urination", "blood_urine", "dark_urine", "stomach_pain", "back_pain", "fever"],
    summary: {
      en: "Burning when peeing and needing to go more often are common signs of irritation or infection of the bladder. These are usually easy to treat, but they should be checked by a health professional, who can do a simple urine test.",
      th: "ปัสสาวะแสบขัดและปัสสาวะบ่อยเป็นสัญญาณที่พบบ่อยของการระคายเคืองหรือติดเชื้อในกระเพาะปัสสาวะ มักรักษาได้ไม่ยาก แต่ควรให้บุคลากรทางการแพทย์ตรวจ ซึ่งอาจตรวจปัสสาวะง่าย ๆ",
    },
    causes: [
      { name: { en: "Urinary tract infection (UTI)", th: "การติดเชื้อทางเดินปัสสาวะ" }, explanation: { en: "Common, especially in girls and women. Usually needs assessment by a professional.", th: "พบบ่อย โดยเฉพาะในเพศหญิง มักต้องได้รับการประเมินจากผู้เชี่ยวชาญ" } },
      { name: { en: "Not drinking enough", th: "ดื่มน้ำน้อย" }, explanation: { en: "Concentrated urine can sting and look dark.", th: "ปัสสาวะเข้มข้นอาจแสบและมีสีเข้ม" } },
    ],
    warning: [
      { en: "Fever with pain in the side or back (possible kidney infection)", th: "มีไข้ร่วมกับปวดสีข้างหรือหลัง (อาจติดเชื้อที่ไต)" },
      { en: "Visible blood in urine", th: "เห็นเลือดในปัสสาวะ" },
      { en: "Unable to pee at all", th: "ปัสสาวะไม่ออกเลย" },
    ],
    seek: [{ en: "Any burning when peeing that lasts more than a day or two", th: "ปัสสาวะแสบขัดนานเกิน 1–2 วัน" }, ...COMMON_SEEK],
    selfCare: [{ en: "Drink water regularly through the day", th: "ดื่มน้ำสม่ำเสมอตลอดวัน" }, COMMON_SELF[1]],
    prevention: [
      { en: "Drink enough water and don't hold in pee for long", th: "ดื่มน้ำให้พอและไม่กลั้นปัสสาวะนาน" },
      { en: "Wipe from front to back after using the toilet", th: "ทำความสะอาดจากหน้าไปหลังหลังเข้าห้องน้ำ" },
    ],
    sources: ["NHS — Urinary tract infections (UTIs)", "CDC — Urinary Tract Infection basics"],
  },
  {
    id: "screen",
    title: { en: "Screen time, posture and eye strain", th: "การใช้หน้าจอ ท่าทาง และปวดตา" },
    match: ["eye_strain", "light_sensitive_headache", "neck_pain", "headache", "poor_focus", "poor_sleep", "red_eye", "back_pain"],
    summary: {
      en: "Tired eyes, headaches and a sore neck often go together after long periods on phones, laptops or homework, especially with poor posture or late-night screens.",
      th: "ตาล้า ปวดศีรษะ และปวดคอ มักเกิดร่วมกันหลังใช้โทรศัพท์ แล็ปท็อป หรือทำการบ้านนาน ๆ โดยเฉพาะเมื่อนั่งผิดท่าหรือใช้หน้าจอดึก",
    },
    causes: [
      { name: { en: "Digital eye strain", th: "อาการตาล้าจากหน้าจอ" }, explanation: { en: "We blink less when focusing on screens, so eyes get dry and tired.", th: "เรากะพริบตาน้อยลงเวลาจ้องหน้าจอ ทำให้ตาแห้งและล้า" } },
      { name: { en: "Tension-type headache", th: "ปวดศีรษะจากความตึงเครียด" }, explanation: { en: "A tight, band-like headache linked to posture, stress and poor sleep.", th: "ปวดตึงรอบศีรษะ เกี่ยวข้องกับท่าทาง ความเครียด และการนอนไม่พอ" } },
      { name: { en: "Migraine", th: "ไมเกรน" }, explanation: { en: "Throbbing headache, often with sensitivity to light or feeling sick.", th: "ปวดตุบ ๆ มักไวต่อแสงหรือคลื่นไส้" } },
    ],
    warning: [
      { en: "Sudden, very severe headache, or headache with a stiff neck and fever", th: "ปวดศีรษะรุนแรงฉับพลัน หรือปวดศีรษะร่วมกับคอแข็งและมีไข้" },
      { en: "Sudden loss of vision or double vision", th: "มองไม่เห็นฉับพลันหรือเห็นภาพซ้อน" },
    ],
    seek: [{ en: "Blurred vision that doesn't clear (an eye test may help)", th: "ตาพร่ามัวไม่หาย (ควรตรวจสายตา)" }, ...COMMON_SEEK],
    selfCare: [
      { en: "Follow the 20-20-20 rule: every 20 minutes, look 20 feet (6 m) away for 20 seconds", th: "กฎ 20-20-20: ทุก 20 นาที มองไกล 6 เมตร นาน 20 วินาที" },
      { en: "Sit upright with the screen at eye level", th: "นั่งหลังตรง วางหน้าจอระดับสายตา" },
      COMMON_SELF[1],
    ],
    prevention: [
      { en: "Stop screens about an hour before bed", th: "เลิกใช้หน้าจอประมาณ 1 ชั่วโมงก่อนนอน" },
      { en: "Take movement breaks every 30–60 minutes", th: "ลุกขยับร่างกายทุก 30–60 นาที" },
    ],
    sources: ["American Academy of Ophthalmology — Computers, digital devices and eye strain", "NHS — Tension headaches", "WHO — Guidelines on physical activity and sedentary behaviour"],
  },
  {
    id: "injury",
    title: { en: "Minor muscle and joint injury", th: "การบาดเจ็บกล้ามเนื้อและข้อเล็กน้อย" },
    match: ["sprain", "swollen_joint", "joint_pain", "muscle_cramps", "back_pain", "neck_pain", "body_aches"],
    summary: {
      en: "Pain and swelling after sport or a twist are often due to a strain or sprain, which usually heals with rest over a few weeks.",
      th: "ปวดและบวมหลังเล่นกีฬาหรือบิดพลิก มักเกิดจากกล้ามเนื้อหรือเอ็นยึดข้ออักเสบ ซึ่งมักหายได้เองเมื่อพักภายในไม่กี่สัปดาห์",
    },
    causes: [
      { name: { en: "Sprain or strain", th: "ข้อเคล็ดหรือกล้ามเนื้อยึด" }, explanation: { en: "Stretched or torn ligaments or muscles.", th: "เอ็นหรือกล้ามเนื้อถูกยืดหรือฉีกขาด" } },
      { name: { en: "Overuse", th: "ใช้งานมากเกินไป" }, explanation: { en: "Doing more training than the body is used to.", th: "ฝึกซ้อมหนักกว่าที่ร่างกายเคยชิน" } },
    ],
    warning: [
      { en: "You can't put any weight on it, or it looks out of shape", th: "ลงน้ำหนักไม่ได้เลย หรือรูปร่างผิดปกติ" },
      { en: "Numbness, or the skin turns cold or blue", th: "ชา หรือผิวเย็นหรือเขียวคล้ำ" },
      { en: "A hot, red, swollen joint with fever", th: "ข้อบวม แดง ร้อน ร่วมกับมีไข้" },
    ],
    seek: [{ en: "Pain or swelling not improving after a few days", th: "ปวดหรือบวมไม่ดีขึ้นหลังผ่านไปไม่กี่วัน" }, ...COMMON_SEEK],
    selfCare: [
      { en: "Rest, ice wrapped in a cloth for up to 20 minutes, gentle support, and raise the limb", th: "พัก ประคบเย็น (ห่อผ้า) ไม่เกิน 20 นาที พันประคอง และยกส่วนที่บาดเจ็บให้สูง" },
      COMMON_SELF[1],
    ],
    prevention: [
      { en: "Warm up before sport and build up training gradually", th: "อบอุ่นร่างกายก่อนเล่นกีฬาและเพิ่มการฝึกทีละน้อย" },
      { en: "Wear suitable shoes and protective gear", th: "สวมรองเท้าและอุปกรณ์ป้องกันที่เหมาะสม" },
    ],
    sources: ["NHS — Sprains and strains", "WHO — Physical activity fact sheet"],
  },
];

const GENERIC: DemoCase = {
  id: "generic",
  title: { en: "General symptoms", th: "อาการทั่วไป" },
  match: [],
  summary: {
    en: "The symptoms you entered can have many everyday causes. This demonstration can only show general guidance — a healthcare professional can look at the full picture.",
    th: "อาการที่คุณระบุอาจมีสาเหตุทั่วไปได้หลายอย่าง โหมดสาธิตนี้แสดงได้เพียงคำแนะนำทั่วไป บุคลากรทางการแพทย์จะประเมินภาพรวมได้ดีกว่า",
  },
  causes: [{ name: { en: "Many possible everyday causes", th: "อาจมีสาเหตุทั่วไปหลายอย่าง" }, explanation: { en: "Such as minor infections, strain, stress or lifestyle factors.", th: "เช่น การติดเชื้อเล็กน้อย การใช้งานกล้ามเนื้อมาก ความเครียด หรือพฤติกรรม" } }],
  warning: [
    { en: "Chest pain, difficulty breathing, fainting or confusion", th: "เจ็บหน้าอก หายใจลำบาก หมดสติ หรือสับสน" },
    { en: "Severe pain that is getting worse", th: "ปวดรุนแรงและแย่ลง" },
  ],
  seek: COMMON_SEEK,
  selfCare: COMMON_SELF,
  prevention: [
    { en: "Sleep, balanced meals, activity and hand hygiene support overall health", th: "การนอน อาหารสมดุล การเคลื่อนไหว และการล้างมือช่วยสุขภาพโดยรวม" },
  ],
  sources: ["WHO — Health topics", "NHS — Health A to Z"],
};

export function pickDemoCase(symptoms: string[]) {
  let best = GENERIC;
  let bestScore = 0;
  for (const c of DEMO_CASES) {
    const score = symptoms.filter((s) => c.match.includes(s)).length / Math.max(1, Math.sqrt(c.match.length));
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best;
}

export function demoAnalysis(symptoms: string[], lang: Lang): AnalysisResult & { caseTitle: string } {
  const c = pickDemoCase(symptoms);
  const p = (x: L) => x[lang];
  return {
    caseTitle: p(c.title),
    summary: p(c.summary),
    possibleCauses: c.causes.map((x) => ({ name: p(x.name), explanation: p(x.explanation) })),
    warningSigns: c.warning.map(p),
    whenToSeekCare: c.seek.map(p),
    selfCare: c.selfCare.map(p),
    prevention: c.prevention.map(p),
    limitations:
      lang === "th"
        ? "นี่คือตัวอย่างสาธิตที่เขียนไว้ล่วงหน้า ไม่ใช่การวิเคราะห์ด้วย AI จริง และไม่ใช่การวินิจฉัย เลือกจากอาการที่คุณระบุเท่านั้น ไม่ได้พิจารณาประวัติสุขภาพหรือการตรวจร่างกาย"
        : "This is a pre-written demonstration example, not live AI analysis and not a diagnosis. It was selected only by matching the symptoms you ticked; it cannot consider your history, an examination or tests.",
    sources: c.sources,
  };
}
