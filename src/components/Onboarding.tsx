"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, HeartPulse, Languages, Lock, Phone, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, Segmented } from "./ui";

/** First-visit welcome: explains purpose, safety limits, language and privacy choice. */
export function Onboarding() {
  const { ready, settings, updateSettings } = useStore();
  const [step, setStep] = useState(0);
  const [understood, setUnderstood] = useState(false);
  const lang = settings.lang;
  const th = lang === "th";
  if (!ready || settings.onboarded) return null;

  const finish = (consent: "granted" | "declined") => updateSettings({ onboarded: true, consent });

  const steps = [
    {
      icon: HeartPulse,
      body: (
        <>
          <h2 className="text-2xl font-bold tracking-tight">{th ? "ยินดีต้อนรับสู่ PreventAI" : "Welcome to PreventAI"}</h2>
          <p className="mt-2 text-muted">
            {th
              ? "แอปเพื่อการศึกษาที่ช่วยให้คุณเข้าใจอาการ ติดตามสุขภาพ และเรียนรู้วิธีป้องกันโรค"
              : "An educational app that helps you understand symptoms, keep track of how you feel, and learn simple ways to prevent illness."}
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {(th
              ? ["ตรวจอาการด้วย AI พร้อมระดับความกังวลที่อธิบายได้", "บันทึกอาการและสุขภาพประจำวันพร้อมกราฟ", "คุณภาพอากาศ ความร้อน และแนวโน้มโรค", "ความรู้การป้องกันจาก WHO, CDC และ NHS"]
              : ["AI symptom check with an explainable concern level", "Symptom and daily wellness tracking with charts", "Air quality, heat and disease trends", "Prevention tips from WHO, CDC and NHS"]
            ).map((x) => (
              <li key={x} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-500" /> {x}
              </li>
            ))}
          </ul>
        </>
      ),
      canNext: true,
    },
    {
      icon: ShieldAlert,
      body: (
        <>
          <h2 className="text-2xl font-bold tracking-tight">{th ? "ข้อควรรู้ด้านความปลอดภัย" : "Important safety information"}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
              {th ? "PreventAI ไม่ใช่แพทย์ ไม่วินิจฉัยโรค และไม่สั่งยาหรือบอกขนาดยา" : "PreventAI is not a doctor. It does not diagnose, prescribe, or give medicine doses."}
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
              {th ? "AI อาจผิดพลาดได้ โปรดตรวจสอบข้อมูลสำคัญกับบุคลากรทางการแพทย์" : "AI can make mistakes. Check anything important with a health professional."}
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
              {th ? "ข้อมูลจำลองจะมีป้ายกำกับเสมอ" : "Simulated or demo data is always labelled."}
            </li>
          </ul>
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-100">
            <p className="flex items-center gap-2 font-semibold">
              <Phone className="size-4" /> {th ? "ในกรณีฉุกเฉิน" : "In an emergency"}
            </p>
            <p className="mt-1">{th ? "โทร 1669 (ประเทศไทย) ทันที · สายด่วนสุขภาพจิต 1323 (24 ชม.)" : "Call 1669 (Thailand) right away · Mental health hotline 1323 (24 h)"}</p>
          </div>
          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="size-5 accent-brand-600" />
            {th ? "ฉันเข้าใจว่าแอปนี้ใช้เพื่อการศึกษาเท่านั้น" : "I understand this app is for education only"}
          </label>
        </>
      ),
      canNext: understood,
    },
    {
      icon: Languages,
      body: (
        <>
          <h2 className="text-2xl font-bold tracking-tight">{th ? "เลือกภาษาและธีม" : "Choose language & look"}</h2>
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">{th ? "ภาษา" : "Language"}</span>
              <Segmented label="ob-lang" value={settings.lang} onChange={(v) => updateSettings({ lang: v })} options={[{ value: "en", label: "English" }, { value: "th", label: "ภาษาไทย" }]} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">{th ? "ธีม" : "Theme"}</span>
              <Segmented
                label="ob-theme"
                value={settings.theme}
                onChange={(v) => updateSettings({ theme: v })}
                options={[
                  { value: "light", label: th ? "สว่าง" : "Light" },
                  { value: "dark", label: th ? "มืด" : "Dark" },
                  { value: "system", label: th ? "ตามระบบ" : "System" },
                ]}
              />
            </div>
          </div>
        </>
      ),
      canNext: true,
    },
    {
      icon: Lock,
      body: (
        <>
          <h2 className="text-2xl font-bold tracking-tight">{th ? "ความเป็นส่วนตัวของคุณ" : "Your privacy"}</h2>
          <p className="mt-2 text-sm text-muted">
            {th
              ? "ไม่ต้องมีบัญชีหรือชื่อจริง บันทึกสุขภาพจะเก็บไว้ในเบราว์เซอร์นี้เท่านั้น และลบได้ทุกเมื่อในการตั้งค่า"
              : "No account or real name needed. Health records are kept only in this browser, and you can delete them any time in Settings."}
          </p>
          <div className="mt-6 grid gap-3">
            <button onClick={() => finish("granted")} className="rounded-2xl border-2 border-brand-500 bg-brand-50 p-4 text-left transition hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20">
              <p className="font-semibold text-brand-700 dark:text-brand-200">{th ? "บันทึกในอุปกรณ์นี้ (แนะนำ)" : "Save on this device (recommended)"}</p>
              <p className="mt-0.5 text-sm text-muted">{th ? "บันทึกของคุณจะยังอยู่เมื่อกลับมาใช้" : "Your records are still here when you come back."}</p>
            </button>
            <button onClick={() => finish("declined")} className="rounded-2xl border border-soft p-4 text-left transition hover:bg-black/[.03] dark:hover:bg-white/5">
              <p className="font-semibold">{th ? "ไม่บันทึก (เฉพาะครั้งนี้)" : "Don't save (this visit only)"}</p>
              <p className="mt-0.5 text-sm text-muted">{th ? "ข้อมูลจะหายเมื่อปิดแท็บ" : "Everything disappears when you close the tab."}</p>
            </button>
          </div>
        </>
      ),
      canNext: false,
    },
  ];

  const S = steps[step];
  const Icon = S.icon;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-0 backdrop-blur-md sm:p-6">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="surface relative flex h-full w-full flex-col overflow-hidden border border-soft shadow-2xl sm:h-auto sm:max-w-lg sm:rounded-3xl"
      >
        <div className="hero-gradient flex items-center justify-between px-6 pt-6">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-450 text-white shadow-lg shadow-brand-500/30">
            <Icon className="size-6" />
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-brand-600" : "w-1.5 bg-slate-300 dark:bg-slate-600")} />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
              {S.body}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between border-t border-soft px-6 py-4">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            {th ? "ย้อนกลับ" : "Back"}
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!S.canNext}>
              {step === 0 ? (
                <>
                  <Sparkles className="size-4" /> {th ? "เริ่มต้น" : "Get started"}
                </>
              ) : (
                <>
                  {th ? "ถัดไป" : "Next"} <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          ) : (
            <span className="text-xs text-muted">{th ? "เลือกหนึ่งตัวเลือก" : "Pick one option"}</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
