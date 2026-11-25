"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "./i18n";
import type { Level } from "./triage";
import { storage, uid } from "./utils";

export type ThemePref = "light" | "dark" | "system";
export type Consent = "unset" | "granted" | "declined";

export interface Settings {
  theme: ThemePref;
  lang: Lang;
  fontScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  locationId: string;
  nickname: string;
  consent: Consent;
  onboarded: boolean;
  quizDone?: boolean;
}

export interface SymptomRecord {
  id: string;
  date: string; // YYYY-MM-DD
  symptom: string; // symptom id or custom text
  severity: number; // 1–10
  notes: string;
  demo?: boolean;
  createdAt: string;
}

export interface SavedCheck {
  id: string;
  createdAt: string;
  level: Level;
  symptoms: string[];
  mode: "ai" | "demo";
  demo?: boolean;
}

export interface Reminder {
  id: string;
  key: string; // builtin key or "custom"
  text: string;
  enabled: boolean;
  doneDates: string[];
}

export interface SurveyResponse {
  id: string;
  createdAt: string;
  role: string;
  sus: number[]; // 10 answers 1–5
  usefulness: number; // 1–5
  trust: number; // 1–5
  comments: string;
  demo?: boolean;
}

export interface UsabilityResult {
  id: string;
  createdAt: string;
  task: string;
  seconds: number;
  success: boolean;
  demo?: boolean;
}

export interface WellnessEntry {
  date: string; // YYYY-MM-DD, one per day
  sleepHours: number;
  water: number; // glasses
  activityMin: number;
  mood: number; // 1–5
  demo?: boolean;
}

interface HealthData {
  records: SymptomRecord[];
  checks: SavedCheck[];
  reminders: Reminder[];
  wellness: WellnessEntry[];
}

interface ResearchData {
  survey: SurveyResponse[];
  usability: UsabilityResult[];
}

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  lang: "en",
  fontScale: 1,
  highContrast: false,
  reduceMotion: false,
  locationId: "bangkok",
  nickname: "",
  consent: "unset",
  onboarded: false,
};

const DEFAULT_REMINDERS: Reminder[] = [
  { id: "r-water", key: "water", text: "", enabled: true, doneDates: [] },
  { id: "r-hands", key: "hands", text: "", enabled: true, doneDates: [] },
  { id: "r-move", key: "move", text: "", enabled: true, doneDates: [] },
  { id: "r-sleep", key: "sleep", text: "", enabled: true, doneDates: [] },
];

const K = { settings: "pa.settings", health: "pa.health", research: "pa.research" };

interface Store {
  ready: boolean;
  settings: Settings;
  updateSettings: (p: Partial<Settings>) => void;
  resolvedTheme: "light" | "dark";
  records: SymptomRecord[];
  addRecord: (r: Omit<SymptomRecord, "id" | "createdAt">) => void;
  updateRecord: (id: string, r: Partial<SymptomRecord>) => void;
  deleteRecord: (id: string) => void;
  loadDemoRecords: () => void;
  wellness: WellnessEntry[];
  saveWellness: (w: WellnessEntry) => void;
  loadPresentationDemo: () => void;
  clearAllDemo: () => void;
  clearDemoRecords: () => void;
  checks: SavedCheck[];
  addCheck: (c: Omit<SavedCheck, "id" | "createdAt">) => void;
  reminders: Reminder[];
  setReminders: (fn: (r: Reminder[]) => Reminder[]) => void;
  survey: SurveyResponse[];
  addSurvey: (s: Omit<SurveyResponse, "id" | "createdAt">) => void;
  usability: UsabilityResult[];
  addUsability: (u: Omit<UsabilityResult, "id" | "createdAt">) => void;
  clearResearch: () => void;
  loadDemoResearch: () => void;
  consentOpen: boolean;
  setConsentOpen: (v: boolean) => void;
  grantConsent: () => void;
  declineConsent: () => void;
  deleteAllData: () => void;
  exportData: () => string;
  toast: (msg: string, tone?: "ok" | "warn") => void;
  toasts: { id: string; msg: string; tone: "ok" | "warn" }[];
}

const Ctx = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [health, setHealth] = useState<HealthData>({ records: [], checks: [], reminders: DEFAULT_REMINDERS, wellness: [] });
  const [research, setResearch] = useState<ResearchData>({ survey: [], usability: [] });
  const [consentOpen, setConsentOpen] = useState(false);
  const [systemDark, setSystemDark] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; msg: string; tone: "ok" | "warn" }[]>([]);
  const askedThisSession = useRef(false);

  // Load
  useEffect(() => {
    const s = { ...DEFAULT_SETTINGS, ...storage.get<Partial<Settings>>(K.settings, {}) };
    setSettings(s);
    if (s.consent === "granted") {
      const h = storage.get<Partial<HealthData>>(K.health, {});
      setHealth({ records: h.records ?? [], checks: h.checks ?? [], reminders: h.reminders?.length ? h.reminders : DEFAULT_REMINDERS, wellness: h.wellness ?? [] });
    }
    setResearch({ survey: [], usability: [], ...storage.get<Partial<ResearchData>>(K.research, {}) });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", on);
    setReady(true);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Persist
  useEffect(() => {
    if (ready) storage.set(K.settings, settings);
  }, [settings, ready]);
  useEffect(() => {
    if (!ready) return;
    if (settings.consent === "granted") storage.set(K.health, health);
  }, [health, settings.consent, ready]);
  useEffect(() => {
    if (ready) storage.set(K.research, research);
  }, [research, ready]);

  const resolvedTheme: "light" | "dark" = settings.theme === "system" ? (systemDark ? "dark" : "light") : settings.theme;

  // Apply theme + accessibility classes
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", resolvedTheme === "dark");
    el.classList.toggle("high-contrast", settings.highContrast);
    el.classList.toggle("reduce-motion", settings.reduceMotion);
    el.style.setProperty("--font-scale", String(settings.fontScale));
    el.lang = settings.lang;
  }, [resolvedTheme, settings.highContrast, settings.reduceMotion, settings.fontScale, settings.lang]);

  const toast = useCallback((msg: string, tone: "ok" | "warn" = "ok") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const updateSettings = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), []);

  const maybeAskConsent = useCallback(() => {
    if (settings.consent === "unset" && !askedThisSession.current) {
      askedThisSession.current = true;
      setConsentOpen(true);
    }
  }, [settings.consent]);

  const addRecord: Store["addRecord"] = useCallback(
    (r) => {
      setHealth((h) => ({ ...h, records: [...h.records, { ...r, id: uid(), createdAt: new Date().toISOString() }] }));
      maybeAskConsent();
    },
    [maybeAskConsent],
  );
  const updateRecord: Store["updateRecord"] = useCallback((id, r) => setHealth((h) => ({ ...h, records: h.records.map((x) => (x.id === id ? { ...x, ...r } : x)) })), []);
  const deleteRecord = useCallback((id: string) => setHealth((h) => ({ ...h, records: h.records.filter((x) => x.id !== id) })), []);

  const loadDemoRecords = useCallback(() => {
    const now = new Date().toISOString();
    const demo: SymptomRecord[] = [
      ...[6, 5, 4, 3, 2, 1, 0].map((d, i) => ({ id: uid(), date: daysAgo(d + 7), symptom: "headache", severity: [3, 5, 4, 6, 3, 2, 2][i], notes: i === 3 ? "Exam week, little sleep" : "", demo: true, createdAt: now })),
      ...[6, 5, 4, 3, 2].map((d, i) => ({ id: uid(), date: daysAgo(d), symptom: "cough", severity: [4, 6, 5, 3, 2][i], notes: i === 1 ? "Worse at night" : "", demo: true, createdAt: now })),
      ...[6, 5, 4].map((d, i) => ({ id: uid(), date: daysAgo(d), symptom: "sore_throat", severity: [5, 4, 2][i], notes: "", demo: true, createdAt: now })),
      ...[5, 4].map((d, i) => ({ id: uid(), date: daysAgo(d), symptom: "fever", severity: [5, 3][i], notes: i === 0 ? "37.9 °C" : "", demo: true, createdAt: now })),
      ...[3, 1].map((d, i) => ({ id: uid(), date: daysAgo(d), symptom: "fatigue", severity: [4, 2][i], notes: "", demo: true, createdAt: now })),
    ];
    setHealth((h) => ({ ...h, records: [...h.records.filter((r) => !r.demo), ...demo] }));
  }, []);
  const clearDemoRecords = useCallback(() => setHealth((h) => ({ ...h, records: h.records.filter((r) => !r.demo) })), []);

  const saveWellness = useCallback(
    (w: WellnessEntry) => {
      setHealth((h) => ({ ...h, wellness: [...h.wellness.filter((x) => x.date !== w.date), { ...w, demo: false }].sort((a, b) => a.date.localeCompare(b.date)).slice(-120) }));
      maybeAskConsent();
    },
    [maybeAskConsent],
  );

  const addCheck: Store["addCheck"] = useCallback(
    (c) => {
      // Check history is kept in memory; it is only persisted if the user has already consented.
      setHealth((h) => ({ ...h, checks: [...h.checks, { ...c, id: uid(), createdAt: new Date().toISOString() }].slice(-50) }));
    },
    [],
  );

  const setReminders = useCallback((fn: (r: Reminder[]) => Reminder[]) => setHealth((h) => ({ ...h, reminders: fn(h.reminders) })), []);

  const addSurvey: Store["addSurvey"] = useCallback((s) => setResearch((r) => ({ ...r, survey: [...r.survey, { ...s, id: uid(), createdAt: new Date().toISOString() }] })), []);
  const addUsability: Store["addUsability"] = useCallback(
    (u) => setResearch((r) => ({ ...r, usability: [...r.usability, { ...u, id: uid(), createdAt: new Date().toISOString() }] })),
    [],
  );
  const clearResearch = useCallback(() => setResearch({ survey: [], usability: [] }), []);
  const loadDemoResearch = useCallback(() => {
    const now = new Date().toISOString();
    const roles = ["Student", "Student", "Teacher", "Parent", "Student", "Student"];
    const sus = [
      [5, 2, 4, 1, 4, 2, 5, 1, 4, 2],
      [4, 1, 5, 2, 4, 1, 4, 2, 5, 1],
      [4, 2, 4, 2, 3, 2, 4, 2, 4, 3],
      [5, 1, 5, 1, 5, 1, 5, 1, 4, 2],
      [3, 2, 4, 2, 4, 3, 4, 2, 3, 2],
      [4, 2, 5, 1, 4, 2, 5, 1, 4, 1],
    ];
    const survey: SurveyResponse[] = sus.map((a, i) => ({
      id: uid(),
      createdAt: now,
      role: roles[i],
      sus: a,
      usefulness: [5, 4, 4, 5, 3, 4][i],
      trust: [4, 4, 3, 4, 3, 4][i],
      comments: ["Clear and easy", "Liked the charts", "Good safety warnings", "Thai language helps", "Wanted more symptoms", "Simple to use"][i],
      demo: true,
    }));
    const tasks = ["symptom_check", "log_record", "find_prevention", "change_language", "delete_data"];
    const usability: UsabilityResult[] = tasks.flatMap((task, ti) =>
      [0, 1, 2].map((j) => ({ id: uid(), createdAt: now, task, seconds: [48, 22, 15, 9, 18][ti] + j * 7 - 5, success: !(ti === 4 && j === 2), demo: true })),
    );
    setResearch((r) => ({ survey: [...r.survey.filter((x) => !x.demo), ...survey], usability: [...r.usability.filter((x) => !x.demo), ...usability] }));
  }, []);

  const loadPresentationDemo = useCallback(() => {
    loadDemoRecords();
    loadDemoResearch();
    const now = Date.now();
    const wellness: WellnessEntry[] = Array.from({ length: 14 }, (_, i) => ({
      date: daysAgo(13 - i),
      sleepHours: [7.5, 6, 6.5, 5.5, 8, 8.5, 9, 6.5, 5.5, 6, 7, 8.5, 8.5, 8][i],
      water: [6, 5, 5, 4, 7, 8, 8, 5, 4, 5, 6, 8, 8, 7][i],
      activityMin: [40, 30, 35, 20, 60, 75, 80, 30, 20, 25, 45, 65, 70, 60][i],
      mood: [3, 3, 3, 2, 4, 4, 5, 3, 2, 3, 3, 4, 5, 4][i],
      demo: true,
    }));
    const checks: SavedCheck[] = [
      { id: uid(), createdAt: new Date(now - 6 * 86400_000).toISOString(), level: 1, symptoms: ["cough", "sore_throat", "fever"], mode: "demo", demo: true },
      { id: uid(), createdAt: new Date(now - 3 * 86400_000).toISOString(), level: 0, symptoms: ["cough"], mode: "demo", demo: true },
    ];
    setHealth((h) => ({
      ...h,
      wellness: [...h.wellness.filter((w) => !w.demo), ...wellness.filter((d) => !h.wellness.some((w) => !w.demo && w.date === d.date))].sort((a, b) => a.date.localeCompare(b.date)),
      checks: [...h.checks.filter((c) => !c.demo), ...checks].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    }));
  }, [loadDemoRecords, loadDemoResearch]);

  const clearAllDemo = useCallback(() => {
    setHealth((h) => ({ ...h, records: h.records.filter((r) => !r.demo), wellness: h.wellness.filter((w) => !w.demo), checks: h.checks.filter((c) => !c.demo) }));
    setResearch((r) => ({ survey: r.survey.filter((x) => !x.demo), usability: r.usability.filter((x) => !x.demo) }));
  }, []);

  const grantConsent = useCallback(() => {
    setSettings((s) => ({ ...s, consent: "granted" }));
    setConsentOpen(false);
  }, []);
  const declineConsent = useCallback(() => {
    setSettings((s) => ({ ...s, consent: "declined" }));
    storage.remove(K.health);
    setConsentOpen(false);
  }, []);

  const deleteAllData = useCallback(() => {
    storage.remove(K.health);
    storage.remove(K.research);
    storage.remove(K.settings);
    try {
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    setHealth({ records: [], checks: [], reminders: DEFAULT_REMINDERS, wellness: [] });
    setResearch({ survey: [], usability: [] });
    setSettings((s) => ({ ...DEFAULT_SETTINGS, theme: s.theme, lang: s.lang, onboarded: true }));
    askedThisSession.current = false;
  }, []);

  const exportData = useCallback(
    () => JSON.stringify({ exportedAt: new Date().toISOString(), app: "Preval prototype", settings: { ...settings }, ...health, ...research }, null, 2),
    [settings, health, research],
  );

  const value = useMemo<Store>(
    () => ({
      ready,
      settings,
      updateSettings,
      resolvedTheme,
      records: health.records,
      addRecord,
      updateRecord,
      deleteRecord,
      loadDemoRecords,
      clearDemoRecords,
      wellness: health.wellness,
      saveWellness,
      loadPresentationDemo,
      clearAllDemo,
      checks: health.checks,
      addCheck,
      reminders: health.reminders,
      setReminders,
      survey: research.survey,
      addSurvey,
      usability: research.usability,
      addUsability,
      clearResearch,
      loadDemoResearch,
      consentOpen,
      setConsentOpen,
      grantConsent,
      declineConsent,
      deleteAllData,
      exportData,
      toast,
      toasts,
    }),
    [ready, settings, updateSettings, resolvedTheme, health, research, addRecord, updateRecord, deleteRecord, loadDemoRecords, clearDemoRecords, saveWellness, loadPresentationDemo, clearAllDemo, addCheck, setReminders, addSurvey, addUsability, clearResearch, loadDemoResearch, consentOpen, grantConsent, declineConsent, deleteAllData, exportData, toast, toasts],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useT() {
  const { settings } = useStore();
  return settings.lang;
}
