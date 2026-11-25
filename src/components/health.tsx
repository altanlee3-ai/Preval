"use client";

import { AlertTriangle, CheckCircle2, Info, Radio, ShieldAlert, Siren } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { t, type Lang } from "@/lib/i18n";
import { LEVEL_KEYS, LEVEL_STYLE, type Level } from "@/lib/triage";
import { cn, formatDateTime } from "@/lib/utils";
import { Badge } from "./ui";

export function LevelIcon({ level, className }: { level: Level; className?: string }) {
  const I = [CheckCircle2, Info, AlertTriangle, Siren][level];
  return <I className={className} />;
}

export function LevelBadge({ level, lang }: { level: Level; lang: Lang }) {
  const s = LEVEL_STYLE[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", s.bg, s.text, s.ring)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {t(LEVEL_KEYS[level], lang)}
    </span>
  );
}

/** Four-step scale visual: makes it clear these are categories, not probabilities. */
export function LevelScale({ level, lang }: { level: Level; lang: Lang }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {([0, 1, 2, 3] as Level[]).map((l) => (
          <motion.div
            key={l}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: l * 0.08 }}
            className={cn("h-2.5 origin-left rounded-full", l <= level ? LEVEL_STYLE[l].dot : "bg-slate-200 dark:bg-slate-700")}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1.5 text-[11px] leading-tight text-muted">
        {([0, 1, 2, 3] as Level[]).map((l) => (
          <span key={l} className={cn(l === level && cn("font-semibold", LEVEL_STYLE[l].text))}>
            {t(LEVEL_KEYS[l], lang)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DataSourceTag({ live, source, time, lang }: { live: boolean; source: ReactNode; time?: string; lang: Lang }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      {live ? (
        <Badge tone="green">
          <Radio className="size-3" /> {t("live_data", lang)}
        </Badge>
      ) : (
        <Badge tone="amber">
          <ShieldAlert className="size-3" /> {t("simulated", lang)}
        </Badge>
      )}
      <span>
        {t("source", lang)}: {source}
      </span>
      {time && (
        <span>
          · {t("last_updated", lang)}: {formatDateTime(time, lang)}
        </span>
      )}
    </div>
  );
}

export function Gauge({ value, max, color, label, sub, size = 132 }: { value: number | null; max: number; color: string; label: ReactNode; sub?: ReactNode; size?: number }) {
  const r = (size - 16) / 2;
  const c = Math.PI * r; // half circle
  const pct = value == null ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`} aria-hidden>
        <path d={`M8 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2 + 6}`} fill="none" stroke="var(--surface-2)" strokeWidth="12" strokeLinecap="round" />
        <motion.path
          d={`M8 ${size / 2 + 6} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2 + 6}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="-mt-9 text-center">
        <div className="text-2xl font-bold tabular-nums">{value == null ? "—" : Math.round(value)}</div>
        <div className="text-xs font-medium" style={{ color }}>
          {label}
        </div>
        {sub && <div className="mt-0.5 text-[11px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

export function EmergencyBox({ lang, children }: { lang: Lang; children?: ReactNode }) {
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
      <Siren className="mt-0.5 size-6 shrink-0 animate-pulse-soft text-red-600" />
      <div className="text-sm">
        <p className="font-semibold">{t("emergency_line", lang)}</p>
        {children}
      </div>
    </div>
  );
}

export function SeverityPill({ v }: { v: number }) {
  const c = v >= 7 ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" : v >= 4 ? "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  return <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", c)}>{v}/10</span>;
}
