"use client";
import { useEffect, useState } from "react";

export type AiStatus = {
  ai: boolean;
  model: string | null;
  provider?: string | null;
  keysFound?: string[];
  files?: string[];
  problems?: string[];
  folder?: string;
  version?: string;
  test?: { ok: boolean; message: string };
};

let cache: AiStatus | null = null;
let inflight: Promise<AiStatus> | null = null;
const listeners = new Set<(s: AiStatus) => void>();

function load(test = false) {
  return fetch(`/api/status${test ? "?test=1" : ""}`, { cache: "no-store" })
    .then((r) => r.json() as Promise<AiStatus>)
    .catch(() => ({ ai: false, model: null }) as AiStatus)
    .then((v) => {
      cache = v;
      listeners.forEach((l) => l(v));
      return v;
    });
}

/** Re-checks the AI status (optionally making a tiny test call) and updates every badge. */
export function refreshAiStatus(test = false) {
  inflight = load(test);
  return inflight;
}

export function useAiStatus() {
  const [s, setS] = useState(cache);
  useEffect(() => {
    listeners.add(setS);
    if (!cache) {
      inflight ??= load();
      inflight.then(setS);
    }
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}
