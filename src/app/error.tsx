"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui";

/** Shown instead of a blank page if something on a page crashes. */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div className="max-w-md">
        <TriangleAlert className="mx-auto size-10 text-amber-500" />
        <h1 className="mt-3 text-xl font-bold">Something went wrong on this page · เกิดข้อผิดพลาด</h1>
        <p className="mt-2 text-sm text-muted">Your saved records are safe. Try again, or reload the page. · ข้อมูลของคุณยังปลอดภัย ลองใหม่อีกครั้ง</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={reset}>
            <RefreshCw className="size-4" /> Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
