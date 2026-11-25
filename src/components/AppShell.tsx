"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  BookOpenCheck,
  Bot,
  CloudSun,
  FlaskConical,
  HeartPulse,
  House,
  LineChart,
  Menu,
  Moon,
  Phone,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { t, type DictKey } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useAiStatus } from "@/lib/useAiStatus";
import { cn } from "@/lib/utils";
import { Badge, Button, Dialog } from "./ui";
import { Onboarding } from "./Onboarding";

const NAV: { href: string; key: DictKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/", key: "nav_home", icon: House },
  { href: "/analyze", key: "nav_analyze", icon: Stethoscope },
  { href: "/tracker", key: "nav_tracker", icon: Activity },
  { href: "/insights", key: "nav_insights", icon: Sparkles },
  { href: "/assistant", key: "nav_assistant", icon: Bot },
  { href: "/environment", key: "nav_environment", icon: CloudSun },
  { href: "/trends", key: "nav_trends", icon: LineChart },
  { href: "/prevention", key: "nav_prevention", icon: ShieldCheck },
  { href: "/research", key: "nav_research", icon: FlaskConical },
  { href: "/settings", key: "nav_settings", icon: Settings },
];
const MOBILE_SHORT: Record<string, { en: string; th: string }> = {
  "/analyze": { en: "Check", th: "ตรวจ" },
  "/environment": { en: "Weather", th: "อากาศ" },
  "/assistant": { en: "Chat", th: "แชท" },
};
const MOBILE_MAIN = ["/", "/analyze", "/tracker", "/environment", "/assistant"];

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Preval home">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-teal-450 text-white shadow-lg shadow-brand-500/30">
        <HeartPulse className="size-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[1.05rem] font-bold tracking-tight">
            Pre<span className="text-brand-600 dark:text-brand-400">val</span>
          </span>
          <span className="block text-[11px] text-muted">STEAM prototype</span>
        </span>
      )}
    </Link>
  );
}

function AiBadge() {
  const s = useAiStatus();
  const { settings } = useStore();
  if (!s) return null;
  return s.ai ? (
    <Badge tone="green" className="hidden sm:inline-flex">
      <span className="size-1.5 rounded-full bg-emerald-500" /> {t("live_ai", settings.lang)}
    </Badge>
  ) : (
    <Link href="/settings#ai">
      <Badge tone="amber">
        <span className="size-1.5 rounded-full bg-amber-500" /> <span className="hidden sm:inline">{t("demo_mode", settings.lang)}</span>
        <span className="sm:hidden">{settings.lang === "th" ? "สาธิต" : "Demo"}</span>
      </Badge>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, updateSettings, resolvedTheme, consentOpen, grantConsent, declineConsent, toasts, setConsentOpen } = useStore();
  const lang = settings.lang;
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => setMoreOpen(false), [pathname]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-3 focus:py-2 focus:text-white">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="no-print glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-soft px-4 py-5 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-8 flex-1 space-y-1" aria-label="Main">
          {NAV.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(href) ? "text-brand-700 dark:text-brand-200" : "text-muted hover:bg-black/[.03] hover:text-[var(--text)] dark:hover:bg-white/5",
              )}
            >
              {isActive(href) && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-500/15" transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />}
              <Icon className="relative size-[18px]" />
              <span className="relative">{t(key, lang)}</span>
            </Link>
          ))}
        </nav>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <div className="mb-1 flex items-center gap-1.5 font-semibold">
            <Phone className="size-3.5" /> 1669
          </div>
          {t("emergency_line", lang)}
        </div>
      </aside>

      {/* Top bar */}
      <header className="no-print glass sticky top-0 z-30 border-b border-soft lg:ml-64">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="lg:hidden">
            <Logo />
          </div>
          <p className="hidden text-sm text-muted lg:block">{t("tagline", lang)}</p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <AiBadge />
            <button
              onClick={() => updateSettings({ lang: lang === "en" ? "th" : "en" })}
              className="h-9 rounded-xl border border-soft px-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5"
              aria-label={lang === "en" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"}
            >
              {lang === "en" ? "ไทย" : "EN"}
            </button>
            <button
              onClick={() => updateSettings({ theme: resolvedTheme === "dark" ? "light" : "dark" })}
              className="grid size-9 place-items-center rounded-xl border border-soft hover:bg-black/5 dark:hover:bg-white/5"
              aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {resolvedTheme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="pb-28 lg:ml-64 lg:pb-10">
        <div key={pathname} className="page-enter mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
        <footer className="no-print mx-auto max-w-6xl px-4 pb-6 text-center text-xs text-muted sm:px-6">
          <p>{t("disclaimer_short", lang)}</p>
          <p className="mt-1">
            {lang === "th" ? "โครงงาน STEAM: การป้องกันโรคด้วยแอปพลิเคชันและการวิเคราะห์ด้วย AI" : "STEAM project: Prevention of Illness Using an App Interface and AI Analysis"} ·{" "}
            <Link href="/settings#about" className="underline underline-offset-2">
              {lang === "th" ? "เกี่ยวกับและข้อจำกัด" : "About & limitations"}
            </Link>
          </p>
        </footer>
      </main>

      {/* Mobile bottom nav */}
      <nav className="no-print glass fixed inset-x-0 bottom-0 z-40 border-t border-soft pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {NAV.filter((n) => MOBILE_MAIN.includes(n.href)).map(({ href, key, icon: Icon }) => (
            <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", isActive(href) ? "text-brand-600 dark:text-brand-300" : "text-muted")}>
              <Icon className="size-[22px]" />
              <span className="max-w-full truncate px-1">{MOBILE_SHORT[href]?.[lang] ?? t(key, lang)}</span>
            </Link>
          ))}
          <button onClick={() => setMoreOpen(true)} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", !MOBILE_MAIN.some(isActive) ? "text-brand-600 dark:text-brand-300" : "text-muted")}>
            <Menu className="size-[22px]" />
            {t("nav_more", lang)}
          </button>
        </div>
      </nav>

      {/* Mobile "more" sheet */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
            <motion.div className="surface absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-soft p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]" initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold">{t("nav_more", lang)}</span>
                <button onClick={() => setMoreOpen(false)} aria-label="Close" className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/10">
                  <X className="size-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {NAV.map(({ href, key, icon: Icon }) => (
                  <Link key={href} href={href} className={cn("flex flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs font-medium", isActive(href) ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200" : "border-soft")}>
                    <Icon className="size-6" />
                    {t(key, lang)}
                  </Link>
                ))}
              </div>
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-800 dark:bg-red-500/10 dark:text-red-200">{t("emergency_line", lang)}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Onboarding />

      {/* Consent dialog */}
      <Dialog
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        dismissible={false}
        title={
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-brand-600" /> {t("privacy_consent_title", lang)}
          </span>
        }
        footer={
          <>
            <Button variant="outline" onClick={declineConsent}>
              {t("decline", lang)}
            </Button>
            <Button onClick={grantConsent}>{t("allow", lang)}</Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">{t("privacy_consent_body", lang)}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {[
            lang === "th" ? "ไม่ต้องสร้างบัญชี ไม่เก็บชื่อจริง" : "No account, no real name needed",
            lang === "th" ? "ไม่มีการติดตามหรือโฆษณา" : "No tracking or advertising",
            lang === "th" ? "ส่งออกหรือลบข้อมูลได้ทุกเมื่อ" : "Export or delete your data any time",
          ].map((x) => (
            <li key={x} className="flex items-center gap-2">
              <BookOpenCheck className="size-4 text-teal-600" /> {x}
            </li>
          ))}
        </ul>
      </Dialog>

      {/* Toasts */}
      <div className="no-print pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
        <AnimatePresence>
          {toasts.map((x) => (
            <motion.div
              key={x.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn("pointer-events-auto rounded-2xl px-4 py-2.5 text-sm font-medium shadow-xl", x.tone === "ok" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-amber-500 text-white")}
            >
              {x.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
