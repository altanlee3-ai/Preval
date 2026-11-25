import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Prevo — Health awareness & illness prevention", template: "%s · Prevo" },
  description: "An educational, privacy-first prototype that helps people understand symptoms, environmental health and prevention. Not a diagnostic tool.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "Prevo", statusBarStyle: "default" },
  // Link previews (LINE, Messenger, Discord…). Render sets RENDER_EXTERNAL_URL to the site's address.
  metadataBase: new URL(process.env.RENDER_EXTERNAL_URL || "http://localhost:3000"),
  openGraph: {
    title: "Prevo — Health awareness & illness prevention",
    description: "AI symptom check, habit insights, air quality & heat, and prevention tips. A STEAM project in English and Thai. Not a diagnosis.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Prevo" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1018" },
  ],
};

// Applies the saved theme before first paint to avoid a flash.
const themeInit = `(function(){try{var s=JSON.parse(localStorage.getItem('pa.settings')||'{}');var t=s.theme||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;if(d)e.classList.add('dark');if(s.fontScale)e.style.setProperty('--font-scale',s.fontScale);if(s.lang)e.lang=s.lang;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <StoreProvider>
          <AppShell>{children}</AppShell>
        </StoreProvider>
      </body>
    </html>
  );
}
