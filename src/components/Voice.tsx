"use client";

import { Mic, MicOff, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* Minimal typings for the Web Speech API (not in TypeScript's DOM lib everywhere). */
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Speak-to-type button. Hidden in browsers without speech recognition. Speech is processed by the browser's own speech service. */
export function MicButton({ lang, onText, className }: { lang: "en" | "th"; onText: (text: string) => void; className?: string }) {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const rec = useRef<Recognition | null>(null);
  useEffect(() => setSupported(!!getRecognition()), []);
  useEffect(() => () => rec.current?.stop(), []);
  if (!supported) return null;

  const toggle = () => {
    if (on) return rec.current?.stop();
    const Ctor = getRecognition();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = lang === "th" ? "th-TH" : "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript;
      if (text.trim()) onText(text.trim());
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    setOn(true);
    r.start();
  };

  const label = on ? (lang === "th" ? "หยุดฟัง" : "Stop listening") : lang === "th" ? "พูดแทนการพิมพ์" : "Speak instead of typing";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={`${label}${lang === "th" ? " (ใช้บริการเสียงของเบราว์เซอร์)" : " (uses your browser's speech service)"}`}
      aria-pressed={on}
      className={cn("grid size-11 shrink-0 place-items-center rounded-xl border transition", on ? "animate-pulse border-red-400 bg-red-50 text-red-600 dark:bg-red-500/15" : "border-soft surface hover:border-brand-400", className)}
    >
      {on ? <MicOff className="size-4" /> : <Mic className="size-4" />}
    </button>
  );
}

const plain = (md: string) => md.replace(/[*_#>`]/g, "").replace(/^\s*[-•]\s+/gm, "").replace(/\n{2,}/g, ". ");

/** Reads text aloud with the device's built-in voices. */
export function SpeakButton({ text, lang }: { text: string; lang: "en" | "th" }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => setSupported(typeof window !== "undefined" && "speechSynthesis" in window), []);
  useEffect(() => () => {
    if (speaking) window.speechSynthesis.cancel();
  }, [speaking]);
  if (!supported) return null;
  const toggle = () => {
    const s = window.speechSynthesis;
    if (speaking) {
      s.cancel();
      setSpeaking(false);
      return;
    }
    s.cancel();
    const u = new SpeechSynthesisUtterance(plain(text));
    u.lang = lang === "th" ? "th-TH" : "en-GB";
    const voice = s.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang === "th" ? "th" : "en"));
    if (voice) u.voice = voice;
    u.rate = 0.98;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    s.speak(u);
  };
  return (
    <button type="button" onClick={toggle} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10">
      {speaking ? <Square className="size-3" /> : <Volume2 className="size-3.5" />}
      {speaking ? (lang === "th" ? "หยุด" : "Stop") : lang === "th" ? "ฟังเสียง" : "Listen"}
    </button>
  );
}
