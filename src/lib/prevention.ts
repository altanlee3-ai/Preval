import type { L } from "./i18n";

export interface Topic {
  id: string;
  icon: "hands" | "sleep" | "food" | "activity" | "vaccine" | "shield" | "leaf" | "stethoscope";
  color: string;
  title: L;
  summary: L;
  points: L[];
  myth?: { q: L; a: L };
  sources: { name: string; url: string }[];
}

export const TOPICS: Topic[] = [
  {
    id: "hands",
    icon: "hands",
    color: "from-sky-500 to-blue-600",
    title: { en: "Hand hygiene", th: "การล้างมือ" },
    summary: { en: "One of the simplest, most effective ways to reduce the spread of many infections.", th: "หนึ่งในวิธีที่ง่ายและได้ผลที่สุดในการลดการแพร่กระจายของการติดเชื้อหลายชนิด" },
    points: [
      { en: "Wash with soap and water for at least 20 seconds (about two 'Happy Birthday' songs).", th: "ล้างด้วยสบู่และน้ำอย่างน้อย 20 วินาที (ประมาณร้องเพลงแฮปปี้เบิร์ทเดย์ 2 รอบ)" },
      { en: "Key times: before eating or preparing food, after the toilet, after coughing/sneezing, after touching animals.", th: "ช่วงสำคัญ: ก่อนกินหรือเตรียมอาหาร หลังเข้าห้องน้ำ หลังไอจาม หลังสัมผัสสัตว์" },
      { en: "Alcohol-based sanitiser (60%+ alcohol) works when soap isn't available and hands aren't visibly dirty.", th: "เจลแอลกอฮอล์ (60% ขึ้นไป) ใช้ได้เมื่อไม่มีสบู่และมือไม่สกปรกจนเห็นได้" },
      { en: "Don't forget thumbs, fingertips and between fingers.", th: "อย่าลืมนิ้วโป้ง ปลายนิ้ว และซอกนิ้ว" },
    ],
    myth: { q: { en: "Hot water kills more germs?", th: "น้ำร้อนฆ่าเชื้อได้มากกว่า?" }, a: { en: "Not at temperatures safe for skin. Soap, scrubbing and time matter most.", th: "ไม่จริงในอุณหภูมิที่ปลอดภัยต่อผิว สบู่ การถู และเวลาสำคัญที่สุด" } },
    sources: [
      { name: "WHO — Hand hygiene", url: "https://www.who.int/campaigns/world-hand-hygiene-day" },
      { name: "CDC — Clean Hands", url: "https://www.cdc.gov/clean-hands/" },
    ],
  },
  {
    id: "sleep",
    icon: "sleep",
    color: "from-indigo-500 to-violet-600",
    title: { en: "Sleep", th: "การนอนหลับ" },
    summary: { en: "Good sleep supports immunity, mood, memory and concentration.", th: "การนอนที่ดีช่วยภูมิคุ้มกัน อารมณ์ ความจำ และสมาธิ" },
    points: [
      { en: "Teenagers (13–18) generally need 8–10 hours; adults 7+ hours.", th: "วัยรุ่น (13–18 ปี) ควรนอน 8–10 ชั่วโมง ผู้ใหญ่ 7 ชั่วโมงขึ้นไป" },
      { en: "Keep a regular schedule, even at weekends.", th: "เข้านอนและตื่นเป็นเวลา แม้ในวันหยุด" },
      { en: "Put screens away 30–60 minutes before bed; keep the room dark and cool.", th: "เลิกใช้หน้าจอ 30–60 นาทีก่อนนอน ห้องมืดและเย็น" },
      { en: "Limit caffeine in the afternoon and evening.", th: "ลดคาเฟอีนช่วงบ่ายและเย็น" },
    ],
    sources: [
      { name: "American Academy of Sleep Medicine — consensus statement", url: "https://aasm.org/resources/pdf/pediatricsleepdurationconsensus.pdf" },
      { name: "CDC — About Sleep", url: "https://www.cdc.gov/sleep/about/" },
    ],
  },
  {
    id: "nutrition",
    icon: "food",
    color: "from-emerald-500 to-teal-600",
    title: { en: "Nutrition", th: "โภชนาการ" },
    summary: { en: "A varied, balanced diet helps the body grow, repair and fight infection.", th: "อาหารหลากหลายและสมดุลช่วยให้ร่างกายเติบโต ซ่อมแซม และต่อสู้กับการติดเชื้อ" },
    points: [
      { en: "Fill half your plate with vegetables and fruit (WHO: at least 400 g a day).", th: "ผักและผลไม้ครึ่งจาน (WHO: อย่างน้อย 400 กรัมต่อวัน)" },
      { en: "Choose whole grains, beans, fish, eggs or lean meat.", th: "เลือกธัญพืชไม่ขัดสี ถั่ว ปลา ไข่ หรือเนื้อไม่ติดมัน" },
      { en: "Limit sugary drinks, very salty snacks and highly processed food.", th: "ลดเครื่องดื่มหวาน ขนมเค็มจัด และอาหารแปรรูปสูง" },
      { en: "Drink water regularly — more in hot weather and during sport.", th: "ดื่มน้ำสม่ำเสมอ มากขึ้นเมื่ออากาศร้อนและเล่นกีฬา" },
    ],
    sources: [{ name: "WHO — Healthy diet fact sheet", url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet" }],
  },
  {
    id: "activity",
    icon: "activity",
    color: "from-orange-500 to-rose-500",
    title: { en: "Physical activity", th: "การออกกำลังกาย" },
    summary: { en: "Regular movement lowers the risk of many long-term diseases and improves mood.", th: "การเคลื่อนไหวสม่ำเสมอช่วยลดความเสี่ยงโรคเรื้อรังหลายชนิดและทำให้อารมณ์ดีขึ้น" },
    points: [
      { en: "Ages 5–17: an average of 60 minutes of moderate-to-vigorous activity per day (WHO).", th: "อายุ 5–17 ปี: เฉลี่ย 60 นาทีต่อวัน ระดับปานกลางถึงหนัก (WHO)" },
      { en: "Adults: 150–300 minutes of moderate activity per week.", th: "ผู้ใหญ่: 150–300 นาทีต่อสัปดาห์ระดับปานกลาง" },
      { en: "Include muscle- and bone-strengthening activities 3 days a week.", th: "เพิ่มกิจกรรมเสริมกล้ามเนื้อและกระดูก 3 วันต่อสัปดาห์" },
      { en: "Break up long sitting time; check air quality and heat before outdoor exercise.", th: "ลุกขยับเมื่อนั่งนาน ตรวจคุณภาพอากาศและความร้อนก่อนออกกำลังกลางแจ้ง" },
    ],
    sources: [{ name: "WHO — Physical activity guidelines (2020)", url: "https://www.who.int/publications/i/item/9789240015128" }],
  },
  {
    id: "vaccines",
    icon: "vaccine",
    color: "from-cyan-500 to-sky-600",
    title: { en: "Vaccination awareness", th: "ความรู้เรื่องวัคซีน" },
    summary: { en: "Vaccines train the immune system to recognise specific germs and are one of public health's biggest successes.", th: "วัคซีนช่วยฝึกภูมิคุ้มกันให้รู้จักเชื้อโรคเฉพาะ และเป็นความสำเร็จสำคัญของสาธารณสุข" },
    points: [
      { en: "Follow your national immunisation schedule — check your vaccination record.", th: "รับวัคซีนตามแผนของประเทศ และตรวจสอบสมุดวัคซีนของคุณ" },
      { en: "Ask a healthcare worker about yearly flu vaccination and HPV vaccination.", th: "สอบถามบุคลากรทางการแพทย์เรื่องวัคซีนไข้หวัดใหญ่ประจำปีและวัคซีน HPV" },
      { en: "Vaccines protect you and the people around you (community protection).", th: "วัคซีนปกป้องทั้งตัวคุณและคนรอบข้าง" },
      { en: "This app doesn't give personal vaccine advice — talk to a doctor or nurse.", th: "แอปนี้ไม่ให้คำแนะนำวัคซีนเฉพาะบุคคล ปรึกษาแพทย์หรือพยาบาล" },
    ],
    myth: { q: { en: "Vaccines cause the illness they protect against?", th: "วัคซีนทำให้ป่วยเป็นโรคนั้น?" }, a: { en: "Most vaccines contain no live germ that can cause disease. Mild, short-lived side effects like a sore arm are common.", th: "วัคซีนส่วนใหญ่ไม่มีเชื้อมีชีวิตที่ก่อโรค ผลข้างเคียงเล็กน้อย เช่น ปวดแขน พบได้บ่อยและหายเร็ว" } },
    sources: [{ name: "WHO — Vaccines and immunization", url: "https://www.who.int/health-topics/vaccines-and-immunization" }],
  },
  {
    id: "infection",
    icon: "shield",
    color: "from-blue-600 to-indigo-600",
    title: { en: "Infection prevention", th: "การป้องกันการติดเชื้อ" },
    summary: { en: "Simple layers of protection reduce how infections spread at home and school.", th: "การป้องกันหลายชั้นง่าย ๆ ช่วยลดการแพร่เชื้อที่บ้านและโรงเรียน" },
    points: [
      { en: "Cover coughs and sneezes with a tissue or your elbow.", th: "ปิดปากเวลาไอจามด้วยกระดาษทิชชูหรือข้อพับแขน" },
      { en: "Stay home when you have a fever or feel unwell, if you can.", th: "หยุดพักอยู่บ้านเมื่อมีไข้หรือไม่สบาย หากทำได้" },
      { en: "Open windows to improve ventilation indoors.", th: "เปิดหน้าต่างเพื่อให้อากาศถ่ายเท" },
      { en: "Remove standing water weekly to reduce mosquito breeding (dengue prevention).", th: "กำจัดน้ำขังทุกสัปดาห์เพื่อลดแหล่งเพาะพันธุ์ยุง (ป้องกันไข้เลือดออก)" },
      { en: "Don't share cups, towels or utensils when someone is ill.", th: "ไม่ใช้แก้ว ผ้าเช็ดตัว หรือช้อนร่วมกันเมื่อมีคนป่วย" },
    ],
    sources: [
      { name: "WHO — Infection prevention and control", url: "https://www.who.int/health-topics/infection-prevention-and-control" },
      { name: "WHO — Dengue and severe dengue", url: "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue" },
    ],
  },
  {
    id: "environment",
    icon: "leaf",
    color: "from-teal-500 to-emerald-600",
    title: { en: "Environmental health", th: "สุขภาพสิ่งแวดล้อม" },
    summary: { en: "Air pollution, heat and UV are everyday environmental risks you can plan around.", th: "มลพิษทางอากาศ ความร้อน และรังสียูวี เป็นความเสี่ยงประจำวันที่วางแผนรับมือได้" },
    points: [
      { en: "Check the AQI on high-PM2.5 days; limit long outdoor exertion when it's unhealthy.", th: "ตรวจค่า AQI ในวันที่ฝุ่น PM2.5 สูง ลดการออกแรงกลางแจ้งนาน ๆ เมื่ออยู่ในระดับมีผลต่อสุขภาพ" },
      { en: "A well-fitted N95/KN95 mask filters fine particles better than cloth masks.", th: "หน้ากาก N95/KN95 ที่กระชับกรองฝุ่นละเอียดได้ดีกว่าหน้ากากผ้า" },
      { en: "In hot weather: water, shade, light clothing, and rest in the hottest hours.", th: "อากาศร้อน: ดื่มน้ำ อยู่ในร่ม สวมเสื้อผ้าบาง และพักช่วงร้อนจัด" },
      { en: "Use sun protection when the UV index is 3 or higher.", th: "ป้องกันแดดเมื่อดัชนียูวีตั้งแต่ 3 ขึ้นไป" },
    ],
    sources: [
      { name: "WHO — Ambient air quality and health", url: "https://www.who.int/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health" },
      { name: "WHO — Heat and health", url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health" },
    ],
  },
  {
    id: "care",
    icon: "stethoscope",
    color: "from-rose-500 to-red-600",
    title: { en: "When to seek care", th: "เมื่อไรควรพบแพทย์" },
    summary: { en: "Knowing emergency warning signs — and when a check-up is wise — helps you act early.", th: "การรู้สัญญาณเตือนฉุกเฉินและเวลาที่ควรตรวจ ช่วยให้ดำเนินการได้เร็ว" },
    points: [
      { en: "Call 1669 (Thailand) for chest pain, severe breathing difficulty, stroke signs, fainting or heavy bleeding.", th: "โทร 1669 เมื่อเจ็บหน้าอก หายใจลำบากรุนแรง มีอาการโรคหลอดเลือดสมอง หมดสติ หรือเลือดออกมาก" },
      { en: "Stroke — BE FAST: Balance, Eyes, Face, Arms, Speech, Time to call.", th: "โรคหลอดเลือดสมอง — BE FAST: การทรงตัว ตา ใบหน้า แขน การพูด รีบโทร" },
      { en: "See a doctor for symptoms that last, keep coming back, or worry you.", th: "พบแพทย์เมื่ออาการเป็นนาน เป็นซ้ำ หรือทำให้คุณกังวล" },
      { en: "Pharmacists can give advice on minor illnesses and medicines.", th: "เภสัชกรให้คำแนะนำเรื่องการเจ็บป่วยเล็กน้อยและยาได้" },
      { en: "Mental health support: 1323 (Thailand, 24 h).", th: "สายด่วนสุขภาพจิต: 1323 (24 ชม.)" },
    ],
    sources: [
      { name: "NHS — When to go to A&E", url: "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-go-to-ae/" },
      { name: "Thailand National Institute for Emergency Medicine (1669)", url: "https://www.niems.go.th/" },
    ],
  },
];

export const DAILY_TIPS: L[] = [
  { en: "Wash your hands for 20 seconds before meals.", th: "ล้างมือ 20 วินาทีก่อนรับประทานอาหาร" },
  { en: "Aim for 8–10 hours of sleep tonight.", th: "ตั้งเป้านอน 8–10 ชั่วโมงคืนนี้" },
  { en: "Check the air quality before outdoor exercise.", th: "ตรวจคุณภาพอากาศก่อนออกกำลังกายกลางแจ้ง" },
  { en: "Empty containers that collect rainwater to stop mosquitoes breeding.", th: "เทน้ำในภาชนะที่ขังน้ำฝนเพื่อป้องกันยุงลาย" },
  { en: "Half your plate: vegetables and fruit.", th: "ครึ่งจาน: ผักและผลไม้" },
  { en: "Take a 5-minute movement break every hour of study.", th: "ลุกขยับ 5 นาทีทุกชั่วโมงที่นั่งเรียน" },
  { en: "Cover your cough with your elbow.", th: "ไอใส่ข้อพับแขน" },
  { en: "Carry a water bottle on hot days.", th: "พกขวดน้ำในวันที่อากาศร้อน" },
];
