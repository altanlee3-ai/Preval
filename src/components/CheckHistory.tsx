"use client";

import { ArrowRight, History, Stethoscope } from "lucide-react";
import Link from "next/link";
import { LevelBadge } from "./health";
import { Badge, Card, CardHeader, LinkButton } from "./ui";
import { tr } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { symptomLabel } from "@/lib/symptoms";
import { formatDateTime } from "@/lib/utils";

/** List of past symptom checks (date, concern level, symptoms, AI or demo mode). */
export function CheckHistory({ limit = 8 }: { limit?: number }) {
  const { settings, checks } = useStore();
  const lang = settings.lang;
  const th = lang === "th";
  const list = [...checks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);

  return (
    <Card>
      <CardHeader
        icon={<History className="size-5" />}
        title={th ? "ประวัติการตรวจอาการ" : "Symptom check history"}
        subtitle={th ? "ผลการตรวจล่าสุดของคุณ ใช้ดูแนวโน้ม ไม่ใช่การวินิจฉัย" : "Your recent checks, for spotting patterns. Not a diagnosis."}
        action={
          <Link href="/analyze" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            {th ? "ตรวจใหม่" : "New check"} <ArrowRight className="size-4" />
          </Link>
        }
      />
      <div className="px-5 pb-5">
        {list.length ? (
          <ul className="divide-y divide-[var(--border)]">
            {list.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {c.symptoms.map((s) => (symptomLabel(s) ? tr(symptomLabel(s)!, lang) : s)).join(", ") || (th ? "ไม่ระบุอาการ" : "No symptoms listed")}
                  </p>
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    {formatDateTime(c.createdAt, lang)} · {c.mode === "ai" ? (th ? "AI จริง" : "Live AI") : th ? "โหมดสาธิต" : "Demo mode"}
                    {c.demo && <Badge tone="amber">{th ? "ตัวอย่าง" : "Demo"}</Badge>}
                  </p>
                </div>
                <LevelBadge level={c.level} lang={lang} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-soft p-6 text-center">
            <p className="text-sm text-muted">{th ? "ยังไม่มีการตรวจอาการ" : "No symptom checks yet."}</p>
            <LinkButton href="/analyze" size="sm" className="mt-3">
              <Stethoscope className="size-4" /> {th ? "เริ่มตรวจอาการ" : "Start a symptom check"}
            </LinkButton>
          </div>
        )}
      </div>
    </Card>
  );
}
