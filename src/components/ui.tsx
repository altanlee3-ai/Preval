"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import Link from "next/link";
import { forwardRef, useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-sm shadow-brand-600/30 hover:from-brand-500 hover:to-brand-700",
  secondary: "surface-2 text-[var(--text)] hover:brightness-95 dark:hover:brightness-125",
  ghost: "text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-soft text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5",
};
const sizes = { sm: "h-8 px-3 text-sm gap-1.5", md: "h-10 px-4 text-sm gap-2", lg: "h-12 px-6 text-base gap-2" };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-xl font-medium transition-all active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

export function LinkButton({ href, children, variant = "primary", size = "md", className }: { href: string; children: ReactNode; variant?: Variant; size?: keyof typeof sizes; className?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex select-none items-center justify-center rounded-xl font-medium transition-all active:scale-[.98]", variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("surface rounded-2xl border border-soft shadow-[0_1px_2px_rgba(15,23,42,.04),0_8px_24px_-12px_rgba(15,23,42,.08)]", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon, action, className }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 p-5 pb-3", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">{icon}</div>}
        <div className="min-w-0">
          <h2 className="font-semibold leading-tight tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "blue" | "teal" | "amber" | "red" | "green" | "violet"; className?: string }) {
  const tones = {
    neutral: "surface-2 text-muted",
    blue: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
    teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
    amber: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function Chip({ selected, onClick, children, className, tone = "blue" }: { selected?: boolean; onClick?: () => void; children: ReactNode; className?: string; tone?: "blue" | "red" }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all active:scale-[.97]",
        selected
          ? tone === "red"
            ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
            : "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
          : "border-soft surface hover:border-brand-300",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string | number>({ value, onChange, options, className, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("surface-2 inline-flex rounded-xl p-1", className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={value === o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", value === o.value ? "text-[var(--text)]" : "text-muted hover:text-[var(--text)]")}
        >
          {value === o.value && <motion.span layoutId={`seg-${label}`} className="surface absolute inset-0 rounded-lg shadow-sm" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600")}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </label>
  );
}

export function Dialog({ open, onClose, title, children, footer, dismissible = true }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; dismissible?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismissible && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, dismissible]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => dismissible && onClose()} />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="surface relative max-h-[90vh] w-full overflow-auto rounded-t-3xl border border-soft p-6 shadow-2xl sm:max-w-lg sm:rounded-3xl"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              {dismissible && (
                <button aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-black/5 dark:hover:bg-white/10">
                  <X className="size-5" />
                </button>
              )}
            </div>
            {children}
            {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PageHeader({ title, subtitle, icon, action }: { title: ReactNode; subtitle?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-450 text-white shadow-lg shadow-brand-500/25">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-soft surface px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15";

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("stagger", className)}>{children}</div>;
}

export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("item-enter", className)}>{children}</div>;
}

/** Minimal, safe Markdown renderer (bold, italic, lists, paragraphs). No HTML injection. */
export function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  const inline = (s: string, k: number) => {
    const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={`${k}-${i}`}>{p.slice(2, -2)}</strong>
      ) : p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
        <em key={`${k}-${i}`}>{p.slice(1, -1)}</em>
      ) : (
        <span key={`${k}-${i}`}>{p}</span>
      ),
    );
  };
  return (
    <div className="space-y-2.5 text-[0.95rem] leading-relaxed">
      {blocks.map((b, bi) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
          const ordered = /^\s*\d+\./.test(lines[0]);
          const L = ordered ? "ol" : "ul";
          return (
            <L key={bi} className={cn("space-y-1 pl-5", ordered ? "list-decimal" : "list-disc")}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""), li)}</li>
              ))}
            </L>
          );
        }
        if (/^#{1,4}\s/.test(b)) return <p key={bi} className="font-semibold">{inline(b.replace(/^#{1,4}\s/, ""), bi)}</p>;
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <span key={li}>
                {inline(l, li)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
