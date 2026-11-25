"use client";

import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Bot, CheckCircle2, ClipboardList, CloudSun, HeartHandshake, Info, Loader2, Printer, RotateCcw, Save, Search, ShieldCheck, Sparkles, Stethoscope, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MicButton, SpeakButton } from "@/components/Voice";
import { EmergencyBox, LevelIcon, LevelScale } from "@/components/health";
import { Badge, Button, Card, CardHeader, Chip, Field, inputCls, PageHeader } from "@/components/ui";
import type { AnalysisResult } from "@/lib/demoCases";
import { aqiCategory, envAdvice, heatCategory } from "@/lib/environment";
import { t, tr } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { CATEGORY_LABELS, CONTEXT_OPTIONS, DURATION_OPTIONS, RED_FLAGS, SYMPTOMS, type SymptomCategory } from "@/lib/symptoms";
import { detectTextFlags, LEVEL_GUIDANCE, LEVEL_KEYS, LEVEL_STYLE, type Level, type TriageResult } from "@/lib/triage";
import { useEnvironment } from "@/lib/useEnvironment";
import { cn, todayISO } from "@/lib/utils";

type ApiResult = { mode: "ai" | "demo"; model?: string; notice?: string; triage: TriageResult; finalLevel: Level; analysis: AnalysisResult & { caseTitle?: string }; ms: number };

const STEPS = [
  { en: "Symptoms", th: "อาการ" },
  { en: "Describe", th: "อธิบาย" },
  { en: "Details", th: "รายละเอียด" },
  { en: "Review", th: "ตรวจสอบ" },
];

export default function AnalyzePage() {
  const { settings, addCheck, addRecord, toast } = useStore();
  const lang = settings.lang;
  const { data: env, place } = useEnvironment();

  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [durationId, setDurationId] = useState("");
  const [severity, setSeverity] = useState(4);
  const [context, setContext] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [savedToTracker, setSavedToTracker] = useState(false);

  const textFlags = useMemo(() => detectTextFlags(description), [description]);
  const anyEmergency = redFlags.length > 0 || textFlags.length > 0;

  const toggle = (arr: string[], set: (v: string[]) => void, id: string) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = SYMPTOMS.filter((s) => !q || s.label.en.toLowerCase().includes(q) || s.label.th.includes(q));
    return (Object.keys(CATEGORY_LABELS) as SymptomCategory[]).map((c) => ({ c, items: list.filter((s) => s.category === c) })).filter((g) => g.items.length);
  }, [query]);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0 && !symptoms.length && !redFlags.length) e.symptoms = lang === "th" ? "เลือกอย่างน้อย 1 อาการ หรือกด “ข้าม” เพื่ออธิบายด้วยคำพูด" : "Choose at least one symptom, or press “Skip” to describe it in words.";
    if (s === 1 && !symptoms.length && !redFlags.length && description.trim().length < 3) e.description = lang === "th" ? "โปรดอธิบายอาการของคุณ (อย่างน้อย 3 ตัวอักษร)" : "Please describe how you feel (at least 3 characters).";
    if (s === 2 && !durationId) e.duration = lang === "th" ? "โปรดเลือกระยะเวลา" : "Please choose how long you've had the symptoms.";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const next = () => validate(step) && setStep((s) => Math.min(3, s + 1));
  const skip = () => {
    setErrors({});
    setStep(1);
  };

  const submit = async () => {
    for (const s of [0, 1, 2]) {
      if (s === 0 && !symptoms.length && !redFlags.length) continue; // description path
      if (!validate(s)) return setStep(s);
    }
    if (!symptoms.length && !redFlags.length && !validate(1)) return setStep(1);
    setLoading(true);
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symptoms, redFlags, description, durationId, severity, context, lang }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Request failed");
      setResult(j);
      setSavedToTracker(false);
      addCheck({ level: j.finalLevel, symptoms, mode: j.mode });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Something went wrong", "warn");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setStep(0);
    setSymptoms([]);
    setRedFlags([]);
    setDescription("");
    setDurationId("");
    setSeverity(4);
    setContext([]);
    setErrors({});
  };

  const saveToTracker = () => {
    const date = todayISO();
    symptoms.forEach((s) => addRecord({ date, symptom: s, severity, notes: lang === "th" ? "จากการตรวจอาการ" : "From symptom check" }));
    setSavedToTracker(true);
    toast(lang === "th" ? `บันทึก ${symptoms.length} อาการแล้ว` : `Saved ${symptoms.length} symptom(s) to your tracker`);
  };

  if (result) return <Results r={result} lang={lang} onReset={reset} onSave={saveToTracker} saved={savedToTracker} canSave={symptoms.length > 0} env={env} placeName={tr(place.name, lang)} />;

  return (
    <div>
      <PageHeader
        icon={<Stethoscope className="size-5" />}
        title={lang === "th" ? "ตรวจอาการด้วย AI" : "AI Symptom Analyzer"}
        subtitle={lang === "th" ? "ทำความเข้าใจอาการและรู้ว่าเมื่อไรควรขอความช่วยเหลือ — ไม่ใช่การวินิจฉัย" : "Understand your symptoms and when to get help — not a diagnosis."}
      />

      {/* Stepper */}
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={cn("w-full text-left", i < step && "cursor-pointer")}
              aria-current={i === step ? "step" : undefined}
            >
              <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-gradient-to-r from-brand-500 to-teal-450" : "bg-slate-200 dark:bg-slate-700")} />
              <span className={cn("mt-1.5 block text-xs font-medium", i === step ? "text-brand-700 dark:text-brand-300" : "text-muted")}>
                {i + 1}. {tr(s, lang)}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {anyEmergency && (
        <div className="mb-5">
          <EmergencyBox lang={lang}>
            <p className="mt-1">
              {lang === "th" ? "คุณระบุสัญญาณเตือนฉุกเฉิน อย่ารอผลการวิเคราะห์ — ขอความช่วยเหลือทางการแพทย์ทันที" : "You've indicated an emergency warning sign. Don't wait for this analysis — get medical help now."}
            </p>
            {(redFlags.includes("self_harm") || textFlags.includes("self_harm")) && (
              <p className="mt-2 font-medium">{lang === "th" ? "สายด่วนสุขภาพจิต 1323 (ฟรี 24 ชั่วโมง) คุณไม่ได้อยู่คนเดียว" : "Mental Health Hotline 1323 (free, 24 h). You are not alone."}</p>
            )}
          </EmergencyBox>
        </div>
      )}

      <Card className="overflow-hidden">
          <div key={step} className="page-enter p-5 sm:p-6">
            {step === 0 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 dark:border-red-500/30 dark:bg-red-500/5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-200">
                    <TriangleAlert className="size-4" /> {lang === "th" ? "ก่อนอื่น: คุณมีอาการเหล่านี้หรือไม่?" : "First: do you have any of these right now?"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {RED_FLAGS.map((f) => (
                      <Chip key={f.id} tone="red" selected={redFlags.includes(f.id)} onClick={() => toggle(redFlags, setRedFlags, f.id)}>
                        {tr(f.label, lang)}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-semibold">{lang === "th" ? "เลือกอาการของคุณ" : "Select your symptoms"}</h2>
                    <div className="relative sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={lang === "th" ? "ค้นหาอาการ…" : "Search symptoms…"} className={cn(inputCls, "pl-9")} aria-label="Search symptoms" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {grouped.map(({ c, items }) => (
                      <div key={c}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{tr(CATEGORY_LABELS[c], lang)}</p>
                        <div className="flex flex-wrap gap-2">
                          {items.map((s) => (
                            <Chip key={s.id} selected={symptoms.includes(s.id)} onClick={() => toggle(symptoms, setSymptoms, s.id)}>
                              {symptoms.includes(s.id) && <CheckCircle2 className="size-3.5" />}
                              {tr(s.label, lang)}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                    {!grouped.length && <p className="text-sm text-muted">{lang === "th" ? "ไม่พบอาการ ลองอธิบายในขั้นถัดไป" : "No match — you can describe it in the next step."}</p>}
                  </div>
                  {errors.symptoms && <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{errors.symptoms}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <Field
                  label={lang === "th" ? "อธิบายความรู้สึกของคุณด้วยคำพูดของคุณเอง" : "Describe how you feel in your own words"}
                  hint={lang === "th" ? "ไม่บังคับหากเลือกอาการแล้ว ไม่ต้องใส่ชื่อหรือข้อมูลส่วนตัว" : "Optional if you selected symptoms. Please don't include your name or personal details."}
                  error={errors.description}
                  htmlFor="desc"
                >
                  <textarea
                    id="desc"
                    rows={6}
                    maxLength={1000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputCls}
                    placeholder={lang === "th" ? "เช่น เจ็บคอตั้งแต่เมื่อวาน มีน้ำมูก รู้สึกเพลียเล็กน้อย…" : "e.g. My throat has been sore since yesterday, runny nose, a bit tired…"}
                  />
                </Field>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <MicButton lang={lang} onText={(x) => setDescription((v) => ((v ? v + " " : "") + x).slice(0, 1000))} className="size-9" />
                  </span>
                  <p className="text-xs text-muted">{description.length}/1000</p>
                </div>
                {textFlags.length > 0 && (
                  <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-200">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    {lang === "th" ? "คำอธิบายของคุณอาจมีสัญญาณเตือนฉุกเฉิน — ระบบจะจัดเป็นระดับเร่งด่วนเพื่อความปลอดภัย" : "Your description may mention an emergency warning sign — for safety it will be treated as urgent."}
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-7">
                <Field label={t("duration", lang)} error={errors.duration}>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {DURATION_OPTIONS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        aria-pressed={durationId === d.id}
                        onClick={() => setDurationId(d.id)}
                        className={cn("rounded-xl border px-3 py-3 text-sm font-medium transition", durationId === d.id ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200" : "border-soft hover:border-brand-300")}
                      >
                        {tr(d.label, lang)}
                      </button>
                    ))}
                  </div>
                </Field>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="sev" className="text-sm font-medium">
                      {t("severity", lang)}
                    </label>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums", severity >= 7 ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" : severity >= 4 ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300")}>
                      {severity}/10 · {t(severity >= 7 ? "severe" : severity >= 4 ? "moderate" : "mild", lang)}
                    </span>
                  </div>
                  <input id="sev" type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="mt-3 w-full" />
                  <div className="mt-1 flex justify-between text-xs text-muted">
                    <span>{lang === "th" ? "1 แทบไม่รู้สึก" : "1 barely noticeable"}</span>
                    <span>{lang === "th" ? "10 แย่ที่สุด" : "10 worst imaginable"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">{lang === "th" ? "ข้อมูลเพิ่มเติม (ไม่บังคับ)" : "Relevant context (optional)"}</p>
                  <p className="mb-3 text-xs text-muted">{lang === "th" ? "ใช้เพื่อปรับคำแนะนำให้ระมัดระวังมากขึ้นเท่านั้น และไม่ถูกบันทึก" : "Only used to make guidance more cautious. Not stored."}</p>
                  <div className="flex flex-wrap gap-2">
                    {CONTEXT_OPTIONS.map((c) => (
                      <Chip key={c.id} selected={context.includes(c.id)} onClick={() => toggle(context, setContext, c.id)}>
                        {tr(c.label, lang)}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-semibold">{lang === "th" ? "ตรวจสอบข้อมูลของคุณ" : "Review your information"}</h2>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Review label={lang === "th" ? "อาการ" : "Symptoms"} onEdit={() => setStep(0)} value={symptoms.map((s) => tr(SYMPTOMS.find((x) => x.id === s)!.label, lang)).join(", ") || "—"} />
                  <Review label={lang === "th" ? "สัญญาณเตือน" : "Warning signs"} onEdit={() => setStep(0)} value={redFlags.map((s) => tr(RED_FLAGS.find((x) => x.id === s)!.label, lang)).join(", ") || (lang === "th" ? "ไม่มี" : "None")} />
                  <Review label={lang === "th" ? "คำอธิบาย" : "Description"} onEdit={() => setStep(1)} value={description || "—"} />
                  <Review label={t("duration", lang)} onEdit={() => setStep(2)} value={tr(DURATION_OPTIONS.find((d) => d.id === durationId)?.label ?? { en: "—", th: "—" }, lang)} />
                  <Review label={t("severity", lang)} onEdit={() => setStep(2)} value={`${severity}/10`} />
                  <Review label={lang === "th" ? "ข้อมูลเพิ่มเติม" : "Context"} onEdit={() => setStep(2)} value={context.map((c) => tr(CONTEXT_OPTIONS.find((x) => x.id === c)!.label, lang)).join(", ") || "—"} />
                </dl>
                <p className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-900 dark:bg-brand-500/10 dark:text-brand-100">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                  {lang === "th"
                    ? "ข้อมูลจะถูกส่งไปวิเคราะห์โดยไม่ระบุตัวตน (ไม่มีชื่อหรือบัญชี) ระดับความกังวลคำนวณด้วยกฎที่โปร่งใสก่อนเสมอ AI ไม่สามารถลดระดับได้"
                    : "Sent for analysis without identity (no name or account). The concern level is always calculated first by transparent safety rules — AI can never lower it."}
                </p>
              </div>
            )}
          </div>

        <div className="flex items-center justify-between gap-2 border-t border-soft p-4 sm:px-6">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="size-4" /> {t("back", lang)}
          </Button>
          <div className="flex gap-2">
            {step === 0 && (
              <Button variant="outline" onClick={skip}>
                {lang === "th" ? "ข้าม" : "Skip"}
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={next}>
                {t("next", lang)} <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={submit} disabled={loading} className="min-w-36">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {loading ? (lang === "th" ? "กำลังวิเคราะห์…" : "Analyzing…") : t("analyze", lang)}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Review({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="surface-2 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <dt className="text-xs font-medium text-muted">{label}</dt>
        <button onClick={onEdit} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
          Edit
        </button>
      </div>
      <dd className="mt-1 break-words text-sm">{value}</dd>
    </div>
  );
}

function Results({ r, lang, onReset, onSave, saved, canSave, env, placeName }: { r: ApiResult; lang: "en" | "th"; onReset: () => void; onSave: () => void; saved: boolean; canSave: boolean; env: ReturnType<typeof useEnvironment>["data"]; placeName: string }) {
  const level = r.finalLevel;
  const s = LEVEL_STYLE[level];
  const a = r.analysis;
  const raising = r.triage.factors.filter((f) => f.effect === "raises");
  const info = r.triage.factors.filter((f) => f.effect === "info");

  return (
    <div className="space-y-5">
      <PageHeader
        icon={<ClipboardList className="size-5" />}
        title={lang === "th" ? "ผลการวิเคราะห์" : "Your symptom overview"}
        subtitle={lang === "th" ? "ข้อมูลเพื่อการศึกษา ไม่ใช่การวินิจฉัย" : "Educational information — not a diagnosis."}
        action={
          <div className="no-print flex flex-wrap gap-2">
            {canSave && (
              <Button variant="outline" onClick={onSave} disabled={saved}>
                {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />} {saved ? (lang === "th" ? "บันทึกแล้ว" : "Saved") : lang === "th" ? "บันทึกลงตัวติดตาม" : "Save to tracker"}
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" /> {lang === "th" ? "พิมพ์" : "Print"}
            </Button>
            <Button onClick={onReset}>
              <RotateCcw className="size-4" /> {t("start_over", lang)}
            </Button>
          </div>
        }
      />

      {/* Mode banner */}
      {r.mode === "ai" ? (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          <Bot className="size-4" /> {lang === "th" ? "วิเคราะห์โดย AI จริง" : "Live AI analysis"} ({r.model}) · {(r.ms / 1000).toFixed(1)}s
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="flex items-center gap-2 font-semibold">
            <Info className="size-4" /> {t("demo_mode", lang)} — {lang === "th" ? "ตัวอย่างที่เขียนไว้ล่วงหน้า ไม่ใช่ AI จริง" : "pre-written example, not live AI"}
          </p>
          <p className="mt-1">
            {r.notice ?? (lang === "th" ? "ยังไม่ได้ตั้งค่าคีย์ AI จึงแสดงกรณีตัวอย่างที่ใกล้เคียงที่สุด:" : "No AI key is configured, so the closest pre-written example case is shown:")} <strong>{a.caseTitle}</strong>.{" "}
            {lang === "th" ? "ระดับความกังวลยังคงคำนวณจากข้อมูลจริงของคุณด้วยกฎความปลอดภัย" : "The concern level is still calculated from your actual answers using the safety rules."}
          </p>
        </div>
      )}

      {level === 3 && <EmergencyBox lang={lang}><p className="mt-1">{tr(LEVEL_GUIDANCE[3], lang)}</p></EmergencyBox>}

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Level */}
        <Card className={cn("p-5 ring-1 lg:col-span-3", s.ring)}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{lang === "th" ? "ระดับความเร่งด่วนของอาการ" : "Symptom urgency level"}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className={cn("grid size-14 place-items-center rounded-2xl", s.bg)}>
              <LevelIcon level={level} className={cn("size-7", s.text)} />
            </div>
            <div>
              <p className={cn("text-2xl font-bold tracking-tight", s.text)}>{t(LEVEL_KEYS[level], lang)}</p>
              <p className="text-xs text-muted">{lang === "th" ? "หมวดหมู่ตามกฎ ไม่ใช่ความน่าจะเป็น" : "A rule-based category — not a probability or prediction"}</p>
            </div>
          </div>
          <div className="mt-5">
            <LevelScale level={level} lang={lang} />
          </div>
          <p className="mt-5 text-sm leading-relaxed">{tr(LEVEL_GUIDANCE[level], lang)}</p>
        </Card>

        {/* Factors */}
        <Card className="p-5 lg:col-span-2">
          <p className="text-sm font-semibold">{lang === "th" ? "อะไรมีผลต่อผลลัพธ์นี้" : "What influenced this result"}</p>
          <ul className="mt-3 space-y-2">
            {raising.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", LEVEL_STYLE[f.level].dot)} />
                <span>
                  {tr(f.label, lang)} <span className="text-xs text-muted">→ {t(LEVEL_KEYS[f.level], lang)}</span>
                </span>
              </li>
            ))}
            {info.map((f, i) => (
              <li key={`i${i}`} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                {tr(f.label, lang)}
              </li>
            ))}
          </ul>
          <details className="mt-4 text-xs text-muted">
            <summary className="cursor-pointer font-medium text-brand-600 dark:text-brand-400">{lang === "th" ? "กฎทำงานอย่างไร" : "How the rules work"}</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>{lang === "th" ? "สัญญาณเตือนฉุกเฉินใด ๆ → เร่งด่วน" : "Any emergency warning sign → Urgent"}</li>
              <li>{lang === "th" ? "รุนแรง (7+), เกิน 1 สัปดาห์, ไข้เกิน 3 วัน, กลุ่มเสี่ยง + ไข้ → ควรปรึกษาแพทย์" : "Severe (7+), >1 week, fever >3 days, higher-risk context with fever/moderate symptoms → Seek advice"}</li>
              <li>{lang === "th" ? "ปานกลาง, 4–7 วัน, มีไข้, อาเจียน/ท้องเสีย, หลายอาการ → ควรระวัง" : "Moderate, 4–7 days, any fever, vomiting/diarrhoea, 4+ symptoms → Caution"}</li>
              <li>{lang === "th" ? "ผลสุดท้ายคือระดับสูงสุดที่พบ AI ปรับขึ้นได้แต่ไม่สามารถลดลง" : "The highest triggered level wins. AI may raise it, never lower it."}</li>
            </ul>
          </details>
        </Card>
      </div>

      {/* Analysis */}
      <Card>
        <CardHeader icon={<BookOpen className="size-5" />} title={lang === "th" ? "ภาพรวม" : "Overview"} action={r.mode === "ai" ? <Badge tone="green">AI</Badge> : <Badge tone="amber">{t("demo_mode", lang)}</Badge>} />
        <div className="space-y-6 px-5 pb-6">
          <p className="leading-relaxed">{a.summary}</p>
          <SpeakButton text={a.summary} lang={lang} />
          <div>
            <h3 className="mb-2 text-sm font-semibold">{lang === "th" ? "สาเหตุทั่วไปที่เป็นไปได้ (ไม่ใช่การวินิจฉัย)" : "Possible general causes (not a diagnosis)"}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {a.possibleCauses.map((c, i) => (
                <div key={i} className="surface-2 rounded-xl p-3.5">
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="mt-1 text-sm text-muted">{c.explanation}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ListBox tone="red" icon={<TriangleAlert className="size-4" />} title={lang === "th" ? "สัญญาณเตือนที่ต้องรีบรักษา" : "Warning signs — get urgent help"} items={a.warningSigns} />
            <ListBox tone="orange" icon={<Stethoscope className="size-4" />} title={lang === "th" ? "เมื่อไรควรพบบุคลากรทางการแพทย์" : "When to see a health professional"} items={a.whenToSeekCare} />
            <ListBox tone="blue" icon={<HeartHandshake className="size-4" />} title={lang === "th" ? "การดูแลตนเองทั่วไป" : "General self-care"} items={a.selfCare} />
            <ListBox tone="teal" icon={<ShieldCheck className="size-4" />} title={lang === "th" ? "การป้องกัน" : "Prevention"} items={a.prevention} />
          </div>
          <div className="rounded-xl border border-soft p-4 text-sm">
            <p className="font-semibold">{lang === "th" ? "ข้อจำกัดและความไม่แน่นอน" : "Limitations & uncertainty"}</p>
            <p className="mt-1 text-muted">{a.limitations}</p>
            <p className="mt-2 text-muted">
              {lang === "th" ? "ไม่มีการวินิจฉัย การสั่งยา หรือขนาดยา หากกังวลโปรดปรึกษาบุคลากรทางการแพทย์" : "No diagnosis, prescription or dosage is given. If you're worried, please talk to a healthcare professional."}
            </p>
            {!!a.sources?.length && (
              <p className="mt-2 text-xs text-muted">
                {t("source", lang)}: {a.sources.join(" · ")}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Environment — separate */}
      <Card>
        <CardHeader
          icon={<CloudSun className="size-5" />}
          title={lang === "th" ? "ปัจจัยด้านสิ่งแวดล้อม (แยกจากระดับอาการ)" : "Environmental factors (separate from your symptom level)"}
          subtitle={placeName}
        />
        <div className="px-5 pb-5">
          {env ? (
            <>
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <Badge tone={env.source === "live" ? "green" : "amber"}>{env.source === "live" ? t("live_data", lang) : t("simulated", lang)}</Badge>
                <Badge>AQI {env.current.aqi ?? "—"} · {tr(aqiCategory(env.current.aqi).label, lang)}</Badge>
                <Badge>{lang === "th" ? "รู้สึกเหมือน" : "Feels like"} {Math.round(env.current.apparent)}°C · {tr(heatCategory(env.current.apparent).label, lang)}</Badge>
              </div>
              <ul className="space-y-1.5 text-sm">
                {envAdvice(env).map((x, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-500" />
                    {tr(x.text, lang)}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                {lang === "th"
                  ? "ข้อมูลสิ่งแวดล้อมเป็นข้อมูลระดับชุมชน ไม่ได้นำมาคำนวณระดับความเร่งด่วนของอาการ"
                  : "Environmental conditions are community-level information. They are shown for awareness and are not used to calculate your symptom urgency."}{" "}
                <Link href="/environment" className="text-brand-600 underline-offset-2 hover:underline dark:text-brand-400">
                  {t("view_all", lang)}
                </Link>
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">{t("loading", lang)}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function ListBox({ title, items, icon, tone }: { title: string; items: string[]; icon: React.ReactNode; tone: "red" | "orange" | "blue" | "teal" }) {
  const tones = {
    red: "border-red-200 dark:border-red-500/30 [&_h4]:text-red-700 dark:[&_h4]:text-red-300",
    orange: "border-orange-200 dark:border-orange-500/30 [&_h4]:text-orange-700 dark:[&_h4]:text-orange-300",
    blue: "border-brand-200 dark:border-brand-500/30 [&_h4]:text-brand-700 dark:[&_h4]:text-brand-300",
    teal: "border-teal-200 dark:border-teal-500/30 [&_h4]:text-teal-700 dark:[&_h4]:text-teal-300",
  };
  if (!items?.length) return null;
  return (
    <div className={cn("rounded-xl border p-4", tones[tone])}>
      <h4 className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </h4>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-40" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
