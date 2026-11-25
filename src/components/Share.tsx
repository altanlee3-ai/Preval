"use client";

import { Check, Copy, QrCode, Share2 } from "lucide-react";
import qrcode from "qrcode-generator";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Dialog } from "./ui";

/** Header button that shows a QR code of the app link, for presentations and posters. */
export function ShareButton() {
  const { settings } = useStore();
  const th = settings.lang === "th";
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.origin), []);
  const svg = useMemo(() => {
    if (!url) return "";
    const q = qrcode(0, "M");
    q.addData(url);
    q.make();
    return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
  }, [url]);
  const local = /localhost|127\.0\.0\.1/.test(url);

  return (
    <>
      <button onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-xl border border-soft hover:bg-black/5 dark:hover:bg-white/5" aria-label={th ? "แชร์ Prevo" : "Share Prevo"}>
        <QrCode className="size-[18px]" />
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={th ? "แชร์ Prevo" : "Share Prevo"}
        footer={
          <>
            {"share" in navigator && (
              <Button variant="outline" onClick={() => navigator.share({ title: "Prevo", url }).catch(() => {})}>
                <Share2 className="size-4" /> {th ? "แชร์" : "Share"}
              </Button>
            )}
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {}
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? (th ? "คัดลอกแล้ว" : "Copied") : th ? "คัดลอกลิงก์" : "Copy link"}
            </Button>
          </>
        }
      >
        <div className="text-center">
          <p className="text-sm text-muted">{th ? "สแกนด้วยกล้องโทรศัพท์เพื่อเปิด Prevo" : "Scan with a phone camera to open Prevo"}</p>
          <div className="mx-auto mt-4 w-56 rounded-2xl bg-white p-3 shadow-sm [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="mt-3 break-all font-mono text-sm">{url}</p>
          {local && (
            <p className="mt-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              {th ? "นี่คือลิงก์ในเครื่องของคุณ เปิดจากเว็บไซต์ Render เพื่อได้ QR ที่คนอื่นสแกนได้" : "This is a link on your own computer. Open Prevo from your Render website to get a QR code others can scan."}
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
}
