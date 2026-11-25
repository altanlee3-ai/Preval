"use client";

import { Activity, BarChart3, ClipboardCopy, Database, Download, FileText, Pencil, Plus, Printer, Trash2, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckHistory } from "@/components/CheckHistory";
import { SeverityPill } from "@/components/health";
import { Badge, Button, Card, CardHeader, Dialog, Field, inputCls, PageHeader, Segmented } from "@/components/ui";
import { t, tr, type Lang } from "@/lib/i18n";
import { useStore, type SymptomRecord } from "@/lib/store";
import { CATEGORY_LABELS, SYMPTOMS, symptomLabel, type SymptomCategory } from "@/lib/symptoms";
import { cn, formatDate, todayISO } from "@/lib/utils";

const COLORS = ["#2574eb", "#1fb5a8", "#f97316", "#a855f7", "#ef4444", "#eab308", "#0ea5e9", "#10b981"];

const nameOf = (s: string, lang: Lang) => {
  const l = symptomLabel(s);
  return l ? tr(l, lang) : s;
};

export default function TrackerPage() {
  const { settings, records, addRecord, updateRecord, deleteRecord, loadDemoRecords, clearDemoRecords, toast } = useStore();
  const lang = settings.lang;
  const [range, setRange] = useState<"7" | "30" | "90" | "all">("30");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<SymptomRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setFormOpen(true);
      window.history.replaceState(null, "", "/tracker");
    }
  }, []);

  const from = useMemo(() => {
    if (range === "all") return "0000-00-00";
    const d = new Date();
    d.setDate(d.getDate() - Number(range) + 1);
    return d.toISOString().slice(0, 10);
  }, [range]);

  const visible = useMemo(() => records.filter((r) => r.date >= from && (filter === "all" || r.symptom === filter)).sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : a.date < b.date ? 1 : -1)), [records, from, filter]);
  const symptomsInData = useMemo(() => [...new Set(records.map((r) => r.symptom))], [records]);
  const chartSymptoms = useMemo(() => [...new Set(visible.map((r) => r.symptom))].slice(0, 6), [visible]);

  const lineData = useMemo(() => {
    const dates = [...new Set(visible.map((r) => r.date))].sort();
    return dates.map((d) => {
      const row: Record<string, string | number | null> = { date: formatDate(d, lang, { day: "numeric", month: "short" }) };
      for (const s of chartSymptoms) {
        const rs = visible.filter((r) => r.date === d && r.symptom === s);
        row[s] = rs.length ? Math.max(...rs.map((r) => r.severity)) : null;
      }
      return row;
    });
  }, [visible, chartSymptoms, lang]);

  const barData = useMemo(() => {
    const m = new Map<string, { count: number; total: number }>();
    for (const r of visible) {
      const x = m.get(r.symptom) ?? { count: 0, total: 0 };
      m.set(r.symptom, { count: x.count + 1, total: x.total + r.severity });
    }
    return [...m.entries()].map(([s, v]) => ({ name: nameOf(s, lang), count: v.count, avg: +(v.total / v.count).toFixed(1) })).sort((a, b) => b.count - a.count);
  }, [visible, lang]);

  const hasDemo = records.some((r) => r.demo);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Activity className="size-5" />}
        title={lang === "th" ? "บันทึกและติดตามอาการ" : "Symptom Tracker"}
        subtitle={lang === "th" ? "บันทึกอาการ ดูการเปลี่ยนแปลง และสร้างสรุปสำหรับบุคลากรทางการแพทย์" : "Record symptoms, see changes over time, and create a summary for a health professional."}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSummaryOpen(true)} disabled={!records.length}>
              <FileText className="size-4" /> {lang === "th" ? "สร้างสรุป" : "Create summary"}
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" /> {t("log_symptom", lang)}
            </Button>
          </div>
        }
      />

      {hasDemo && (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <span>{lang === "th" ? "มีข้อมูลตัวอย่าง (ข้อมูลจำลองสำหรับการนำเสนอ) ในกราฟ — ทำเครื่องหมาย “ตัวอย่าง”" : "Demonstration records (simulated, for presentations) are included and marked “Demo”."}</span>
          <Button size="sm" variant="outline" onClick={clearDemoRecords}>
            {lang === "th" ? "ลบข้อมูลตัวอย่าง" : "Remove demo data"}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          label="range"
          value={range}
          onChange={setRange}
          options={[
            { value: "7", label: lang === "th" ? "7 วัน" : "7 days" },
            { value: "30", label: lang === "th" ? "30 วัน" : "30 days" },
            { value: "90", label: lang === "th" ? "90 วัน" : "90 days" },
            { value: "all", label: lang === "th" ? "ทั้งหมด" : "All" },
          ]}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={cn(inputCls, "sm:w-56")} aria-label="Filter by symptom">
          <option value="all">{lang === "th" ? "ทุกอาการ" : "All symptoms"}</option>
          {symptomsInData.map((s) => (
            <option key={s} value={s}>
              {nameOf(s, lang)}
            </option>
          ))}
        </select>
      </div>

      {!records.length ? (
        <Card className="p-10 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15">
            <Activity className="size-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{t("no_records", lang)}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            {lang === "th" ? "เริ่มบันทึกอาการเพื่อดูแนวโน้ม หรือโหลดข้อมูลตัวอย่างที่ติดป้ายชัดเจนสำหรับการนำเสนอ" : "Start logging to see trends, or load clearly-labelled demonstration data for a presentation."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="size-4" /> {t("log_symptom", lang)}
            </Button>
            <Button variant="outline" onClick={loadDemoRecords}>
              <Database className="size-4" /> {lang === "th" ? "โหลดข้อมูลตัวอย่าง" : "Load demo data"}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader icon={<TrendingUp className="size-5" />} title={lang === "th" ? "ความรุนแรงตามเวลา" : "Severity over time"} subtitle={lang === "th" ? "ค่าสูงสุดต่อวัน (1–10)" : "Highest rating per day (1–10)"} action={hasDemo ? <Badge tone="amber">{lang === "th" ? "มีข้อมูลตัวอย่าง" : "Includes demo"}</Badge> : null} />
              <div className="h-72 px-2 pb-4">
                {lineData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {chartSymptoms.map((s, i) => (
                        <Line key={s} type="monotone" dataKey={s} name={nameOf(s, lang)} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="grid h-full place-items-center text-sm text-muted">{lang === "th" ? "ไม่มีข้อมูลในช่วงนี้" : "No records in this range."}</p>
                )}
              </div>
            </Card>
            <Card>
              <CardHeader icon={<BarChart3 className="size-5" />} title={lang === "th" ? "ความถี่ของอาการ" : "How often"} subtitle={lang === "th" ? "จำนวนบันทึกต่ออาการ" : "Records per symptom"} />
              <div className="h-72 px-2 pb-4">
                {barData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" width={90} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "var(--surface-2)" }} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} />
                      <Bar dataKey="count" name={lang === "th" ? "จำนวน" : "Records"} fill="#2574eb" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="grid h-full place-items-center text-sm text-muted">—</p>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title={lang === "th" ? "บันทึกทั้งหมด" : "All records"} subtitle={`${visible.length} ${lang === "th" ? "รายการ" : "shown"}`} action={!hasDemo ? <Button size="sm" variant="ghost" onClick={loadDemoRecords}><Database className="size-4" /> {lang === "th" ? "ข้อมูลตัวอย่าง" : "Demo data"}</Button> : null} />
            <ul className="divide-y divide-[var(--border)] px-5 pb-3">
              {visible.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <SeverityPill v={r.severity} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {nameOf(r.symptom, lang)} {r.demo && <Badge tone="amber" className="ml-1">{lang === "th" ? "ตัวอย่าง" : "Demo"}</Badge>}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {formatDate(r.date, lang)}
                      {r.notes && ` · ${r.notes}`}
                    </p>
                  </div>
                  <button
                    aria-label={t("edit", lang)}
                    onClick={() => {
                      setEditing(r);
                      setFormOpen(true);
                    }}
                    className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-[var(--text)] dark:hover:bg-white/10"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button aria-label={t("delete", lang)} onClick={() => setConfirmDel(r.id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
              {!visible.length && <li className="py-6 text-center text-sm text-muted">{lang === "th" ? "ไม่มีบันทึกในช่วงนี้" : "No records match this filter."}</li>}
            </ul>
          </Card>
        </>
      )}

      <RecordForm
        open={formOpen}
        initial={editing}
        lang={lang}
        onClose={() => setFormOpen(false)}
        onSave={(r) => {
          if (editing) {
            updateRecord(editing.id, { ...r, demo: false });
            toast(lang === "th" ? "อัปเดตแล้ว" : "Record updated");
          } else {
            addRecord(r);
            toast(lang === "th" ? "บันทึกแล้ว" : "Record saved");
          }
          setFormOpen(false);
        }}
      />

      <Dialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title={lang === "th" ? "ลบบันทึกนี้?" : "Delete this record?"}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>
              {t("cancel", lang)}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirmDel) deleteRecord(confirmDel);
                setConfirmDel(null);
                toast(lang === "th" ? "ลบแล้ว" : "Record deleted");
              }}
            >
              {t("delete", lang)}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">{lang === "th" ? "การดำเนินการนี้ไม่สามารถย้อนกลับได้" : "This can't be undone."}</p>
      </Dialog>

      <CheckHistory limit={20} />

      <SummaryDialog open={summaryOpen} onClose={() => setSummaryOpen(false)} records={records} lang={lang} />
    </div>
  );
}

function RecordForm({ open, initial, onClose, onSave, lang }: { open: boolean; initial: SymptomRecord | null; onClose: () => void; onSave: (r: Omit<SymptomRecord, "id" | "createdAt">) => void; lang: Lang }) {
  const [date, setDate] = useState(todayISO());
  const [symptom, setSymptom] = useState("");
  const [custom, setCustom] = useState("");
  const [severity, setSeverity] = useState(4);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErr({});
    if (initial) {
      setDate(initial.date);
      const known = SYMPTOMS.some((s) => s.id === initial.symptom);
      setSymptom(known ? initial.symptom : "other");
      setCustom(known ? "" : initial.symptom);
      setSeverity(initial.severity);
      setNotes(initial.notes);
    } else {
      setDate(todayISO());
      setSymptom("");
      setCustom("");
      setSeverity(4);
      setNotes("");
    }
  }, [open, initial]);

  const submit = () => {
    const e: Record<string, string> = {};
    if (!date || isNaN(new Date(date).getTime())) e.date = lang === "th" ? "วันที่ไม่ถูกต้อง" : "Enter a valid date";
    else if (date > todayISO()) e.date = lang === "th" ? "ไม่สามารถเลือกวันในอนาคต" : "Date can't be in the future";
    if (!symptom) e.symptom = lang === "th" ? "โปรดเลือกอาการ" : "Choose a symptom";
    if (symptom === "other" && custom.trim().length < 2) e.custom = lang === "th" ? "โปรดระบุอาการ" : "Type the symptom name";
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({ date, symptom: symptom === "other" ? custom.trim().slice(0, 60) : symptom, severity, notes: notes.trim().slice(0, 300) });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initial ? (lang === "th" ? "แก้ไขบันทึก" : "Edit record") : t("log_symptom", lang)}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("cancel", lang)}
          </Button>
          <Button onClick={submit}>{t("save", lang)}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t("date", lang)} error={err.date} htmlFor="rdate">
          <input id="rdate" type="date" max={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label={t("symptom", lang)} error={err.symptom} htmlFor="rsym">
          <select id="rsym" value={symptom} onChange={(e) => setSymptom(e.target.value)} className={inputCls}>
            <option value="">{lang === "th" ? "— เลือก —" : "— Choose —"}</option>
            {(Object.keys(CATEGORY_LABELS) as SymptomCategory[]).map((c) => (
              <optgroup key={c} label={tr(CATEGORY_LABELS[c], lang)}>
                {SYMPTOMS.filter((s) => s.category === c).map((s) => (
                  <option key={s.id} value={s.id}>
                    {tr(s.label, lang)}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value="other">{lang === "th" ? "อื่น ๆ (พิมพ์เอง)" : "Other (type it)"}</option>
          </select>
        </Field>
        {symptom === "other" && (
          <Field label={lang === "th" ? "ชื่ออาการ" : "Symptom name"} error={err.custom} htmlFor="rcustom">
            <input id="rcustom" maxLength={60} value={custom} onChange={(e) => setCustom(e.target.value)} className={inputCls} />
          </Field>
        )}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="rsev" className="text-sm font-medium">
              {t("severity", lang)}
            </label>
            <SeverityPill v={severity} />
          </div>
          <input id="rsev" type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(+e.target.value)} className="mt-2 w-full" />
        </div>
        <Field label={`${t("notes", lang)} (${lang === "th" ? "ไม่บังคับ" : "optional"})`} hint={lang === "th" ? "หลีกเลี่ยงการใส่ข้อมูลระบุตัวตน" : "Avoid identifying details."} htmlFor="rnotes">
          <textarea id="rnotes" rows={3} maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </Field>
      </div>
    </Dialog>
  );
}

function buildSummary(records: SymptomRecord[], lang: Lang) {
  const real = records;
  const bySym = new Map<string, SymptomRecord[]>();
  for (const r of [...real].sort((a, b) => a.date.localeCompare(b.date))) bySym.set(r.symptom, [...(bySym.get(r.symptom) ?? []), r]);
  const dates = real.map((r) => r.date).sort();
  const th = lang === "th";
  const lines: string[] = [];
  lines.push(th ? "สรุปอาการที่บันทึกด้วยตนเอง" : "SELF-REPORTED SYMPTOM SUMMARY");
  lines.push(th ? `สร้างโดย PreventAI (ต้นแบบเพื่อการศึกษา) เมื่อ ${formatDate(todayISO(), lang)}` : `Generated by PreventAI (educational prototype) on ${formatDate(todayISO(), lang)}`);
  if (dates.length) lines.push(th ? `ช่วงเวลา: ${formatDate(dates[0], lang)} – ${formatDate(dates[dates.length - 1], lang)}` : `Period: ${formatDate(dates[0], lang)} – ${formatDate(dates[dates.length - 1], lang)}`);
  if (real.some((r) => r.demo)) lines.push(th ? "⚠ มีข้อมูลตัวอย่าง (จำลอง) รวมอยู่ด้วย" : "⚠ Includes simulated demonstration records");
  lines.push("");
  for (const [s, rs] of bySym) {
    const sev = rs.map((r) => r.severity);
    const avg = sev.reduce((a, b) => a + b, 0) / sev.length;
    const first = sev[0];
    const last = sev[sev.length - 1];
    const trend = rs.length < 2 ? (th ? "บันทึกเดียว" : "single record") : last < first - 1 ? (th ? "ดีขึ้น" : "improving") : last > first + 1 ? (th ? "แย่ลง" : "worsening") : th ? "คงที่" : "about the same";
    lines.push(`• ${nameOf(s, lang)}`);
    lines.push(
      th
        ? `  ${rs.length} บันทึก, ${formatDate(rs[0].date, lang)} – ${formatDate(rs[rs.length - 1].date, lang)}; ความรุนแรงเฉลี่ย ${avg.toFixed(1)}/10, สูงสุด ${Math.max(...sev)}/10; แนวโน้ม: ${trend}`
        : `  ${rs.length} record(s), ${formatDate(rs[0].date, lang)} – ${formatDate(rs[rs.length - 1].date, lang)}; average severity ${avg.toFixed(1)}/10, highest ${Math.max(...sev)}/10; trend: ${trend}`,
    );
    const notes = rs.filter((r) => r.notes).map((r) => `${formatDate(r.date, lang, { day: "numeric", month: "short" })}: ${r.notes}`);
    if (notes.length) lines.push(`  ${th ? "หมายเหตุ" : "Notes"}: ${notes.join("; ")}`);
  }
  lines.push("");
  lines.push(
    th
      ? "ข้อมูลนี้บันทึกด้วยตนเอง (ความรุนแรง 1–10 ตามความรู้สึก) ไม่ใช่การวินิจฉัย โปรดใช้ประกอบการพูดคุยกับบุคลากรทางการแพทย์"
      : "Self-reported data (severity is a personal 1–10 rating). Not a diagnosis. Intended to support a conversation with a healthcare professional.",
  );
  return lines.join("\n");
}

function SummaryDialog({ open, onClose, records, lang }: { open: boolean; onClose: () => void; records: SymptomRecord[]; lang: Lang }) {
  const [includeDemo, setIncludeDemo] = useState(false);
  const { toast } = useStore();
  const hasDemo = records.some((r) => r.demo);
  const text = useMemo(() => buildSummary(records.filter((r) => includeDemo || !r.demo), lang), [records, includeDemo, lang]);
  const empty = !records.filter((r) => includeDemo || !r.demo).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast(lang === "th" ? "คัดลอกแล้ว" : "Copied to clipboard");
    } catch {
      toast(lang === "th" ? "คัดลอกไม่ได้" : "Couldn't copy — select the text manually", "warn");
    }
  };
  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `symptom-summary-${todayISO()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const print = () => {
    const w = window.open("", "_blank", "width=720,height=900");
    if (!w) return toast(lang === "th" ? "เบราว์เซอร์บล็อกหน้าต่าง" : "Pop-up blocked", "warn");
    const pre = w.document.createElement("pre");
    pre.textContent = text;
    pre.style.cssText = "font: 14px/1.6 system-ui, sans-serif; white-space: pre-wrap; padding: 24px;";
    w.document.title = "Symptom summary";
    w.document.body.appendChild(pre);
    w.print();
  };

  return (
    <Dialog open={open} onClose={onClose} title={lang === "th" ? "สรุปสำหรับบุคลากรทางการแพทย์" : "Summary for a health professional"}>
      {hasDemo && (
        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeDemo} onChange={(e) => setIncludeDemo(e.target.checked)} /> {lang === "th" ? "รวมข้อมูลตัวอย่าง (จำลอง)" : "Include demo (simulated) records"}
        </label>
      )}
      {empty ? (
        <p className="text-sm text-muted">{lang === "th" ? "ไม่มีบันทึกจริงให้สรุป" : "No real records to summarise yet."}</p>
      ) : (
        <pre className="surface-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl p-4 text-xs leading-relaxed">{text}</pre>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={copy} disabled={empty}>
          <ClipboardCopy className="size-4" /> {lang === "th" ? "คัดลอก" : "Copy"}
        </Button>
        <Button variant="outline" onClick={download} disabled={empty}>
          <Download className="size-4" /> .txt
        </Button>
        <Button variant="outline" onClick={print} disabled={empty}>
          <Printer className="size-4" /> {lang === "th" ? "พิมพ์" : "Print"}
        </Button>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Minus className="size-3" /> {lang === "th" ? "แชร์เฉพาะเมื่อคุณเลือกเอง ไม่มีการส่งข้อมูลอัตโนมัติ" : "Nothing is sent automatically — you choose whether to share it."} <TrendingDown className="hidden" />
      </p>
    </Dialog>
  );
}
