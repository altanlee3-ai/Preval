"use client";

import { Pause, Play, Wind } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button, Card, CardHeader, Segmented } from "./ui";

type Phase = { key: "in" | "hold" | "out" | "rest"; secs: number };
const PATTERNS: Record<string, { name: { en: string; th: string }; phases: Phase[] }> = {
  calm: { name: { en: "Calm (4-2-6)", th: "ผ่อนคลาย (4-2-6)" }, phases: [{ key: "in", secs: 4 }, { key: "hold", secs: 2 }, { key: "out", secs: 6 }] },
  box: { name: { en: "Box (4-4-4-4)", th: "กล่อง (4-4-4-4)" }, phases: [{ key: "in", secs: 4 }, { key: "hold", secs: 4 }, { key: "out", secs: 4 }, { key: "rest", secs: 4 }] },
};
const WORDS = {
  in: { en: "Breathe in", th: "หายใจเข้า" },
  hold: { en: "Hold", th: "กลั้นไว้" },
  out: { en: "Breathe out", th: "หายใจออก" },
  rest: { en: "Pause", th: "พัก" },
};

/** Guided slow-breathing exercise. Slow breathing is a widely recommended way to ease stress (e.g. NHS). */
export function BreathingCard() {
  const { settings } = useStore();
  const lang = settings.lang;
  const th = lang === "th";
  const [pattern, setPattern] = useState<"calm" | "box">("calm");
  const [running, setRunning] = useState(false);
  const [st, setSt] = useState({ idx: 0, left: 0, rounds: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const phases = PATTERNS[pattern].phases;
  const { idx, left, rounds } = st;
  const phase = phases[idx];

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setSt((p) => {
        if (p.left > 1) return { ...p, left: p.left - 1 };
        const n = (p.idx + 1) % phases.length;
        return { idx: n, left: phases[n].secs, rounds: n === 0 ? p.rounds + 1 : p.rounds };
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running, phases]);

  const start = () => {
    setSt({ idx: 0, left: phases[0].secs, rounds: 0 });
    setRunning(true);
  };
  const big = running && (phase.key === "in" || phase.key === "hold");

  return (
    <Card>
      <CardHeader
        icon={<Wind className="size-5" />}
        title={th ? "มุมสงบ: ฝึกหายใจ" : "Calm corner: breathing exercise"}
        subtitle={th ? "หายใจช้า ๆ 1–3 นาทีช่วยให้รู้สึกสงบลงเมื่อเครียด" : "1–3 minutes of slow breathing can help you feel calmer when stressed"}
      />
      <div className="flex flex-col items-center gap-5 px-5 pb-6 sm:flex-row sm:justify-around">
        <div className="relative grid size-52 place-items-center">
          <div
            className={cn("absolute inset-0 m-auto rounded-full bg-gradient-to-br from-teal-400/40 to-brand-500/40 ease-in-out", big ? "size-52" : "size-28")}
            style={{ transitionProperty: "width, height", transitionDuration: running ? `${phase.secs}s` : "0.6s" }}
            aria-hidden
          />
          <div className="relative text-center" aria-live="polite">
            <p className="text-lg font-semibold">{running ? WORDS[phase.key][lang] : th ? "พร้อมไหม?" : "Ready?"}</p>
            {running && <p className="text-3xl font-bold tabular-nums">{left}</p>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Segmented label="breathing pattern" value={pattern} onChange={(v) => { setRunning(false); setPattern(v); }} options={(["calm", "box"] as const).map((k) => ({ value: k, label: PATTERNS[k].name[lang] }))} />
          <Button onClick={() => (running ? setRunning(false) : start())}>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />} {running ? (th ? "หยุด" : "Stop") : th ? "เริ่ม" : "Start"}
          </Button>
          <p className="text-sm text-muted">{th ? `ครบ ${rounds} รอบ` : `${rounds} round${rounds === 1 ? "" : "s"} done`}</p>
          <p className="max-w-xs text-xs text-muted">
            {th ? "หากรู้สึกเวียนหัว ให้หยุดและหายใจตามปกติ หากรู้สึกแย่มาก โทร 1323 (24 ชม.)" : "If you feel dizzy, stop and breathe normally. If you're struggling, call 1323 (24 h)."}
          </p>
        </div>
      </div>
    </Card>
  );
}
