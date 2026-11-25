"use client";

import { Accessibility, Bot, Database, Download, Info, KeyRound, Languages, Lock, MapPin, Palette, Settings, ShieldCheck, Trash2, Bell, FlaskConical, Presentation } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CardHeader, Dialog, inputCls, PageHeader, Segmented, Switch } from "@/components/ui";
import { PLACES } from "@/lib/environment";
import { t, tr } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { refreshAiStatus, useAiStatus } from "@/lib/useAiStatus";
import { cn, todayISO } from "@/lib/utils";

const REMINDER_NAMES: Record<string, { en: string; th: string }> = {
  water: { en: "Drink water regularly", th: "ดื่มน้ำสม่ำเสมอ" },
  hands: { en: "Wash hands before meals", th: "ล้างมือก่อนกินอาหาร" },
  move: { en: "60 minutes of activity", th: "เคลื่อนไหว 60 นาที" },
  sleep: { en: "Screens off before bed", th: "ปิดหน้าจอก่อนนอน" },
};

export default function SettingsPage() {
  const { settings, updateSettings, records, checks, reminders, setReminders, survey, usability, deleteAllData, exportData, loadPresentationDemo, clearAllDemo, grantConsent, declineConsent, toast } = useStore();
  const lang = settings.lang;
  const ai = useAiStatus();
  const [testing, setTesting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const th = lang === "th";

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prevo-data-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={<Settings className="size-5" />} title={t("nav_settings", lang)} subtitle={th ? "ควบคุมรูปลักษณ์ ภาษา และข้อมูลของคุณ" : "Control how the app looks, its language, and your data."} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<Palette className="size-5" />} title={th ? "รูปลักษณ์และภาษา" : "Appearance & language"} />
          <div className="space-y-5 px-5 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">{t("theme", lang)}</span>
              <Segmented label="theme" value={settings.theme} onChange={(v) => updateSettings({ theme: v })} options={[{ value: "light", label: t("light", lang) }, { value: "dark", label: t("dark", lang) }, { value: "system", label: t("system", lang) }]} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Languages className="size-4" /> {t("language", lang)}
              </span>
              <Segmented label="lang" value={settings.lang} onChange={(v) => updateSettings({ lang: v })} options={[{ value: "en", label: "English" }, { value: "th", label: "ภาษาไทย" }]} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="nick" className="text-sm font-medium">
                {th ? "ชื่อเล่นสำหรับคำทักทาย (ไม่บังคับ)" : "Nickname for the greeting (optional)"}
              </label>
              <input id="nick" maxLength={24} value={settings.nickname} onChange={(e) => updateSettings({ nickname: e.target.value })} className={inputCls} placeholder={th ? "ไม่ต้องใส่ชื่อจริง" : "No real name needed"} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="area" className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4" /> {th ? "พื้นที่สำหรับข้อมูลสิ่งแวดล้อม" : "Area for environmental data"}
              </label>
              <select id="area" value={settings.locationId.startsWith("geo:") ? "geo" : settings.locationId} onChange={(e) => e.target.value !== "geo" && updateSettings({ locationId: e.target.value })} className={inputCls}>
                {settings.locationId.startsWith("geo:") && <option value="geo">{th ? "พื้นที่ของฉัน (โดยประมาณ)" : "My area (approx.)"}</option>}
                {PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {tr(p.name, lang)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">{th ? "ใช้เฉพาะพื้นที่กว้าง ๆ (ระดับเมือง) เท่านั้น" : "Only a broad, city-level area is used."}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Accessibility className="size-5" />} title={th ? "การเข้าถึง" : "Accessibility"} />
          <div className="space-y-3 px-5 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">{th ? "ขนาดตัวอักษร" : "Text size"}</span>
              <Segmented label="font" value={settings.fontScale} onChange={(v) => updateSettings({ fontScale: v })} options={[{ value: 1, label: "A" }, { value: 1.125, label: <span className="text-base">A</span> }, { value: 1.25, label: <span className="text-lg">A</span> }]} />
            </div>
            <Switch checked={settings.highContrast} onChange={(v) => updateSettings({ highContrast: v })} label={th ? "คอนทราสต์สูง" : "High contrast"} description={th ? "ทำให้ข้อความรองและเส้นขอบชัดขึ้น" : "Stronger secondary text and borders"} />
            <Switch checked={settings.reduceMotion} onChange={(v) => updateSettings({ reduceMotion: v })} label={th ? "ลดภาพเคลื่อนไหว" : "Reduce motion"} description={th ? "ปิดแอนิเมชันส่วนใหญ่" : "Turns off most animations"} />
          </div>
          <div className="border-t border-soft">
            <CardHeader icon={<Bell className="size-5" />} title={t("reminders", lang)} subtitle={th ? "แสดงบนหน้าหลัก (ไม่มีการแจ้งเตือนแบบพุช)" : "Shown on the Home dashboard (no push notifications)"} />
            <div className="px-5 pb-5">
              {reminders.map((r) => (
                <Switch key={r.id} checked={r.enabled} onChange={(v) => setReminders((rs) => rs.map((x) => (x.id === r.id ? { ...x, enabled: v } : x)))} label={REMINDER_NAMES[r.key]?.[lang] ?? r.text} />
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader icon={<Lock className="size-5" />} title={th ? "ความเป็นส่วนตัวและข้อมูล" : "Privacy & your data"} subtitle={th ? "ออกแบบโดยคำนึงถึงความเป็นส่วนตัวเป็นอันดับแรก" : "Privacy-first by design"} />
          <div className="grid gap-5 px-5 pb-5 md:grid-cols-2">
            <div className="space-y-3">
              <div className="surface-2 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{th ? "การบันทึกข้อมูลสุขภาพในอุปกรณ์" : "Saving health data on this device"}</span>
                  <Badge tone={settings.consent === "granted" ? "green" : settings.consent === "declined" ? "neutral" : "amber"}>
                    {settings.consent === "granted" ? (th ? "อนุญาต" : "Allowed") : settings.consent === "declined" ? (th ? "เฉพาะเซสชัน" : "Session only") : th ? "ยังไม่ได้เลือก" : "Not chosen"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {settings.consent === "granted"
                    ? th
                      ? "บันทึกอาการถูกเก็บไว้ในเบราว์เซอร์นี้ (localStorage) เท่านั้น"
                      : "Symptom records are kept only in this browser (localStorage)."
                    : th
                      ? "บันทึกจะอยู่ในหน่วยความจำและหายไปเมื่อปิดแท็บ"
                      : "Records stay in memory and disappear when you close the tab."}
                </p>
                <div className="mt-3">
                  {settings.consent === "granted" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        declineConsent();
                        toast(th ? "หยุดบันทึกแล้ว ข้อมูลที่เก็บไว้ถูกลบ" : "Stopped saving — stored health data removed");
                      }}
                    >
                      {th ? "เพิกถอนความยินยอม" : "Withdraw consent"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        grantConsent();
                        toast(th ? "อนุญาตให้บันทึกแล้ว" : "Local saving turned on");
                      }}
                    >
                      {t("allow", lang)}
                    </Button>
                  )}
                </div>
              </div>
              <ul className="space-y-1.5 text-sm">
                {(th
                  ? ["ไม่มีบัญชี ไม่มีชื่อจริง ไม่มีอีเมล", "ไม่มีคุกกี้ติดตามหรือโฆษณา", "ส่งเฉพาะคำตอบที่ไม่ระบุตัวตนไปยัง AI เมื่อคุณกดวิเคราะห์", "ตำแหน่งถูกปัดเป็นระดับพื้นที่กว้าง"]
                  : ["No account, real name or email", "No tracking cookies or ads", "Only anonymous answers are sent to the AI, and only when you press Analyze", "Location is rounded to a broad area"]
                ).map((x) => (
                  <li key={x} className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-500" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { n: records.length, l: th ? "บันทึก" : "records" },
                  { n: checks.length, l: th ? "การตรวจ" : "checks" },
                  { n: survey.length + usability.length, l: th ? "ข้อมูลวิจัย" : "research" },
                ].map((x) => (
                  <div key={x.l} className="surface-2 rounded-xl p-3">
                    <p className="text-xl font-bold tabular-nums">{x.n}</p>
                    <p className="text-xs text-muted">{x.l}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" onClick={download}>
                <Download className="size-4" /> {th ? "ส่งออกข้อมูลของฉัน (JSON)" : "Export my data (JSON)"}
              </Button>
              <Button variant="danger" className="w-full" onClick={() => setConfirm(true)}>
                <Trash2 className="size-4" /> {th ? "ลบข้อมูลทั้งหมด" : "Delete all my data"}
              </Button>
            </div>
          </div>
        </Card>

        <Card id="demo" className="scroll-mt-24">
          <CardHeader
            icon={<Presentation className="size-5" />}
            title={th ? "โหมดนำเสนอ" : "Presentation demo"}
            subtitle={th ? "เติมข้อมูลตัวอย่างในคลิกเดียวสำหรับการนำเสนอ STEAM" : "Fill the app with example data in one click, for your STEAM presentation"}
          />
          <div className="space-y-3 px-5 pb-5">
            <p className="text-sm text-muted">
              {th
                ? "เพิ่มบันทึกอาการ 2 สัปดาห์ เช็คอินสุขภาพ 14 วัน ประวัติการตรวจ และผลแบบสำรวจตัวอย่าง ข้อมูลทั้งหมดมีป้าย \"ตัวอย่าง\" และลบได้โดยไม่กระทบข้อมูลจริงของคุณ"
                : "Adds two weeks of symptom records, 14 days of wellness check-ins, past symptom checks and sample survey results. Everything is labelled \"Demo\" and can be removed without touching your own data."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  loadPresentationDemo();
                  toast(th ? "โหลดข้อมูลตัวอย่างแล้ว" : "Presentation demo data loaded");
                }}
              >
                <Presentation className="size-4" /> {th ? "โหลดข้อมูลตัวอย่าง" : "Load presentation demo"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  clearAllDemo();
                  toast(th ? "ลบข้อมูลตัวอย่างแล้ว" : "Demo data removed");
                }}
              >
                <Trash2 className="size-4" /> {th ? "ลบข้อมูลตัวอย่าง" : "Clear demo data"}
              </Button>
            </div>
          </div>
        </Card>

        <Card id="ai" className="scroll-mt-24">
          <CardHeader icon={<Bot className="size-5" />} title={th ? "การตั้งค่า AI" : "AI configuration"} />
          <div className="space-y-3 px-5 pb-5 text-sm">
            <div className="flex items-center justify-between">
              <span>{th ? "สถานะ" : "Status"}</span>
              {ai ? ai.ai ? <Badge tone="green">{t("live_ai", lang)} · {ai.model}</Badge> : <Badge tone="amber">{t("demo_mode", lang)}</Badge> : <Badge>…</Badge>}
            </div>
            <p className="text-muted">
              {th
                ? "แอปทำงานได้ครบโดยไม่ต้องมีคีย์ AI ในโหมดสาธิต ผลลัพธ์จะเป็นตัวอย่างที่เขียนไว้ล่วงหน้าและติดป้ายชัดเจน"
                : "The app works fully without an AI key. In demonstration mode, results are pre-written examples and clearly labelled."}
            </p>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/5">
              <p className="font-semibold">{th ? "เปิดใช้ AI จริงฟรีด้วย Google Gemini" : "Turn on live AI for free with Google Gemini"}</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                <li>
                  {th ? "ไปที่ " : "Go to "}
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="font-medium text-brand-600 underline dark:text-brand-400">
                    aistudio.google.com/apikey
                  </a>{" "}
                  {th ? "และลงชื่อเข้าใช้ด้วยบัญชี Google (ไม่ต้องใช้บัตรเครดิต)" : "and sign in with a Google account (no credit card needed)."}
                </li>
                <li>{th ? "กด \"Create API key\" แล้วคัดลอกคีย์" : "Press \"Create API key\" and copy the key."}</li>
                <li>{th ? "เปิดไฟล์ .env.local ในโฟลเดอร์แอป (หรือสร้างใหม่ด้วย Notepad บันทึกแบบ \"All Files\") แล้วเพิ่มบรรทัดนี้:" : "Open .env.local in the app folder (or create it in Notepad, saving as \"All Files\") and add this line:"}</li>
              </ol>
              <pre className="surface mt-2 overflow-x-auto rounded-xl p-3 text-xs">
                <KeyRound className="mr-1 inline size-3" />
                GEMINI_API_KEY=your-key-here
              </pre>
              <p className="mt-2">{th ? "4. ปิดหน้าต่าง Prevo แล้วเปิด Start Prevo.bat ใหม่ ป้าย \"AI จริง\" จะขึ้นด้านบน" : "4. Close the Prevo window and run Start Prevo.bat again. The \"Live AI\" badge will appear at the top."}</p>
              <p className="mt-2 text-xs text-muted">
                {th
                  ? "รุ่นฟรีมีขีดจำกัดจำนวนครั้งต่อนาทีและต่อวัน หากเกินจะแสดงตัวอย่างสาธิตแทน Google อาจใช้ข้อมูลที่ส่งในรุ่นฟรีเพื่อปรับปรุงบริการ แอปนี้ส่งเฉพาะคำตอบที่ไม่ระบุตัวตน"
                  : "The free tier has per-minute and daily limits; if you hit one, the app shows a labelled demo answer instead. Google may use free-tier requests to improve its products. This app only sends anonymous answers."}
              </p>
            </div>
            <p className="text-xs text-muted">
              {th
                ? "ตัวเลือกอื่น: ANTHROPIC_API_KEY (Claude) หรือ OPENAI_API_KEY (OpenAI) ถ้ามีหลายคีย์ ใช้ AI_PROVIDER=gemini เพื่อเลือก"
                : "Other options: ANTHROPIC_API_KEY (Claude) or OPENAI_API_KEY (OpenAI). If you have more than one key, set AI_PROVIDER=gemini (or anthropic / openai) to choose."}
            </p>
            <div className="surface-2 space-y-2 rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{th ? "ตรวจสอบคีย์" : "Key check"}</p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={testing}
                  onClick={async () => {
                    setTesting(true);
                    await refreshAiStatus(true);
                    setTesting(false);
                  }}
                >
                  {testing ? (th ? "กำลังทดสอบ…" : "Testing…") : th ? "ทดสอบการเชื่อมต่อ AI" : "Test AI connection"}
                </Button>
              </div>
              <ul className="space-y-1 text-xs">
                <li>
                  {th ? "คีย์ที่พบ: " : "Keys found: "}
                  <span className="font-mono">{ai?.keysFound?.length ? ai.keysFound.join(", ") : th ? "ไม่พบ" : "none"}</span>
                </li>
                <li>
                  {th ? "ไฟล์ที่พบ: " : "Key files found: "}
                  <span className="font-mono">{ai?.files?.length ? ai.files.join(", ") : th ? "ไม่พบ .env.local" : "no .env.local"}</span>
                </li>
                {ai?.folder && (
                  <li>
                    {th ? "โฟลเดอร์แอป (ต้องวาง .env.local ที่นี่): " : "App folder (.env.local must be here): "}
                    <span className="break-all font-mono">{ai.folder}</span>
                  </li>
                )}
                {ai?.version && (
                  <li>
                    {th ? "เวอร์ชันแอป: " : "App version: "}
                    <span className="font-mono">{ai.version}</span>
                  </li>
                )}
                {ai?.problems?.map((p) => (
                  <li key={p} className="text-amber-700 dark:text-amber-300">⚠ {p}</li>
                ))}
              </ul>
              {ai?.test && (
                <p className={cn("rounded-xl p-2.5 text-sm font-medium", ai.test.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200" : "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-200")}>
                  {ai.test.ok ? "✓ " : "✗ "}
                  {ai.test.message}
                </p>
              )}
              <p className="text-xs text-muted">{th ? "แก้ไข .env.local แล้วกดทดสอบได้เลย ไม่ต้องรีสตาร์ท" : "You can edit .env.local and press Test again; no restart needed."}</p>
            </div>
            <p className="text-xs text-muted">{th ? "คีย์ถูกใช้เฉพาะฝั่งเซิร์ฟเวอร์ ไม่ถูกส่งไปยังเบราว์เซอร์" : "The key is only used on the server and never sent to the browser."}</p>
          </div>
        </Card>

        <Card id="about" className="scroll-mt-24">
          <CardHeader icon={<Info className="size-5" />} title={th ? "เกี่ยวกับและข้อจำกัด" : "About & limitations"} />
          <div className="space-y-3 px-5 pb-5 text-sm">
            <p>
              {th
                ? "Prevo เป็นต้นแบบเพื่อการศึกษาสำหรับโครงงาน STEAM ระดับมัธยมศึกษาปีที่ 4 ไม่ใช่อุปกรณ์ทางการแพทย์ และไม่ให้การวินิจฉัย การสั่งยา หรือขนาดยา"
                : "Prevo is an educational prototype for a Year 10 STEAM project. It is not a medical device and does not provide diagnoses, prescriptions or dosages."}
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{th ? "ระดับความกังวลใช้กฎที่โปร่งใสและระมัดระวัง ยังไม่ผ่านการตรวจสอบทางคลินิก" : "Concern levels use transparent, conservative rules that have not been clinically validated."}</li>
              <li>{th ? "AI อาจผิดพลาดได้ ตรวจสอบข้อมูลสำคัญกับผู้เชี่ยวชาญเสมอ" : "AI can make mistakes; always confirm important information with a professional."}</li>
              <li>{th ? "ข้อมูลจำลองติดป้ายว่า “ข้อมูลจำลอง” หรือ “ตัวอย่าง” เสมอ" : "Simulated data is always labelled “Simulated” or “Demo”."}</li>
              <li>{th ? "ข้อมูลชีวภาพ (ไบโอมาร์กเกอร์) และไมโครไบโอมเป็นแนวคิดการวิจัยในอนาคต ไม่ได้ใช้ในต้นแบบนี้" : "Biomarkers and microbiome data are treated as future research concepts and are not used in this prototype."}</li>
            </ul>
            <p className="text-xs text-muted">
              {th ? "แหล่งข้อมูล" : "Data"}: Open-Meteo (CC BY 4.0), WHO Global Health Observatory. {th ? "เนื้อหา" : "Content"}: WHO, CDC, NHS, {th ? "กรมควบคุมโรค" : "Thai DDC"}.
            </p>
            <p className={cn("flex items-center gap-2 text-xs")}>
              <FlaskConical className="size-3.5" /> <a className="text-brand-600 hover:underline dark:text-brand-400" href="/research">{th ? "ดูหน้าการวิจัยและการประเมินผล" : "See the Research & Evaluation page"}</a>
            </p>
          </div>
        </Card>
      </div>

      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={th ? "ลบข้อมูลทั้งหมด?" : "Delete all data?"}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              {t("cancel", lang)}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteAllData();
                setConfirm(false);
                toast(th ? "ลบข้อมูลทั้งหมดแล้ว" : "All data deleted");
              }}
            >
              <Database className="size-4" /> {th ? "ลบทั้งหมด" : "Delete everything"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          {th ? "บันทึกอาการ ประวัติการตรวจ การแจ้งเตือน ข้อมูลแบบสำรวจ และการตั้งค่าจะถูกลบออกจากอุปกรณ์นี้ ไม่สามารถย้อนกลับได้" : "Symptom records, check history, reminders, survey data and settings will be removed from this device. This can't be undone."}
        </p>
      </Dialog>
    </div>
  );
}
