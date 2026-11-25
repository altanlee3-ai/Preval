import type { L } from "./i18n";

/** Basic first-aid steps, simplified from public guidance (Thai Red Cross, NHS, St John Ambulance). No medicine doses. */
export interface FirstAid {
  id: string;
  title: L;
  steps: L[];
  call: L;
}

export const FIRST_AID: FirstAid[] = [
  {
    id: "cut",
    title: { en: "Small cut or scrape", th: "แผลถลอกหรือแผลบาดเล็ก ๆ" },
    steps: [
      { en: "Wash your hands, then rinse the wound under clean running water.", th: "ล้างมือ แล้วล้างแผลด้วยน้ำสะอาดที่ไหลผ่าน" },
      { en: "Press gently with a clean cloth or gauze until the bleeding stops.", th: "กดเบา ๆ ด้วยผ้าสะอาดหรือผ้าก๊อซจนเลือดหยุด" },
      { en: "Cover with a clean plaster or dressing and keep it dry.", th: "ปิดด้วยพลาสเตอร์หรือผ้าปิดแผลที่สะอาด และรักษาให้แห้ง" },
    ],
    call: { en: "Bleeding that won't stop after 10 minutes of pressure, a deep or gaping wound, or signs of infection (red, hot, swollen, pus).", th: "เลือดไม่หยุดหลังกด 10 นาที แผลลึกหรือแผลเปิดกว้าง หรือมีอาการติดเชื้อ (บวม แดง ร้อน มีหนอง)" },
  },
  {
    id: "burn",
    title: { en: "Burn or scald", th: "แผลไฟไหม้หรือน้ำร้อนลวก" },
    steps: [
      { en: "Cool the burn under cool or lukewarm running water for 20 minutes.", th: "ให้น้ำเย็นหรือน้ำอุณหภูมิห้องไหลผ่านแผล 20 นาที" },
      { en: "Remove rings or tight items nearby, unless they are stuck to the skin.", th: "ถอดแหวนหรือของรัดบริเวณใกล้แผล ยกเว้นที่ติดกับผิว" },
      { en: "Cover loosely with cling film or a clean, non-fluffy cloth. Don't use ice, butter or toothpaste.", th: "ปิดหลวม ๆ ด้วยแผ่นฟิล์มถนอมอาหารหรือผ้าสะอาดที่ไม่มีขน ห้ามใช้น้ำแข็ง เนย หรือยาสีฟัน" },
    ],
    call: { en: "Large, deep or blistered burns, or burns on the face, hands, feet or genitals. Chemical or electrical burns: call 1669.", th: "แผลใหญ่ ลึก หรือพุพอง หรือที่ใบหน้า มือ เท้า อวัยวะเพศ แผลจากสารเคมีหรือไฟฟ้า: โทร 1669" },
  },
  {
    id: "nosebleed",
    title: { en: "Nosebleed", th: "เลือดกำเดาไหล" },
    steps: [
      { en: "Sit down and lean forward (not back).", th: "นั่งลงและโน้มตัวไปข้างหน้า (ไม่เงยหน้า)" },
      { en: "Pinch the soft part of the nose just above the nostrils for 10–15 minutes.", th: "บีบส่วนนิ่มของจมูกเหนือรูจมูกไว้ 10–15 นาที" },
      { en: "Breathe through your mouth and spit out any blood.", th: "หายใจทางปาก และบ้วนเลือดออก" },
    ],
    call: { en: "Bleeding for more than 30 minutes, after a hard blow to the head, or with trouble breathing.", th: "เลือดไหลนานเกิน 30 นาที หลังศีรษะถูกกระแทกแรง หรือหายใจลำบาก" },
  },
  {
    id: "heat",
    title: { en: "Heat exhaustion", th: "อาการเพลียแดด" },
    steps: [
      { en: "Move to a cool, shaded place and lie down with feet slightly raised.", th: "ย้ายไปที่เย็นและร่ม นอนลงยกเท้าสูงเล็กน้อย" },
      { en: "Sip water or an oral rehydration drink.", th: "จิบน้ำหรือเกลือแร่ (ORS)" },
      { en: "Cool the skin with a wet cloth and a fan.", th: "เช็ดตัวด้วยผ้าเปียกและใช้พัดลม" },
    ],
    call: { en: "Call 1669 if they are confused, faint, have a seizure, stop sweating, or don't improve within 30 minutes (possible heatstroke).", th: "โทร 1669 หากสับสน หมดสติ ชัก เหงื่อไม่ออก หรือไม่ดีขึ้นใน 30 นาที (อาจเป็นโรคลมแดด)" },
  },
  {
    id: "sprain",
    title: { en: "Sprain or twisted ankle", th: "ข้อเคล็ดหรือข้อเท้าพลิก" },
    steps: [
      { en: "Rest and stop the activity.", th: "พักและหยุดกิจกรรม" },
      { en: "Put ice wrapped in a cloth on it for up to 20 minutes every 2–3 hours.", th: "ประคบเย็น (ห่อผ้า) ไม่เกิน 20 นาที ทุก 2–3 ชั่วโมง" },
      { en: "Support it with a bandage and keep it raised.", th: "พันผ้ายืดประคองและยกให้สูง" },
    ],
    call: { en: "You can't put weight on it, it looks out of shape, or it feels numb.", th: "ลงน้ำหนักไม่ได้ รูปร่างผิดปกติ หรือรู้สึกชา" },
  },
  {
    id: "bite",
    title: { en: "Insect bite or sting", th: "แมลงกัดต่อย" },
    steps: [
      { en: "Remove a sting by scraping sideways with a card (don't squeeze).", th: "เอาเหล็กในออกโดยใช้บัตรขูดด้านข้าง (ห้ามบีบ)" },
      { en: "Wash with soap and water, then apply a cold pack.", th: "ล้างด้วยสบู่และน้ำ แล้วประคบเย็น" },
      { en: "Try not to scratch. A pharmacist can suggest something for itching.", th: "พยายามอย่าเกา เภสัชกรแนะนำยาบรรเทาอาการคันได้" },
    ],
    call: { en: "Call 1669 for swelling of the face, lips or throat, or difficulty breathing (possible severe allergy).", th: "โทร 1669 หากหน้า ปาก หรือคอบวม หรือหายใจลำบาก (อาจแพ้รุนแรง)" },
  },
  {
    id: "choking",
    title: { en: "Choking", th: "สำลักติดคอ" },
    steps: [
      { en: "If they can cough, encourage them to keep coughing.", th: "ถ้ายังไอได้ ให้ไอต่อไปแรง ๆ" },
      { en: "If they can't cough, speak or breathe: give up to 5 firm back blows between the shoulder blades.", th: "ถ้าไอ พูด หรือหายใจไม่ได้: ตบหลังแรง ๆ ระหว่างสะบัก สูงสุด 5 ครั้ง" },
      { en: "Then up to 5 abdominal thrusts (only if you have been trained), and repeat.", th: "ตามด้วยการกดท้อง สูงสุด 5 ครั้ง (เฉพาะผู้ที่ได้รับการฝึก) แล้วทำซ้ำ" },
    ],
    call: { en: "Call 1669 straight away if the blockage doesn't clear, or if they become unresponsive.", th: "โทร 1669 ทันทีหากยังไม่หลุด หรือหมดสติ" },
  },
];
