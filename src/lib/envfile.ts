import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Forgiving key loader. Next.js already reads .env.local at start-up, but on Windows the file is
 * often saved as ".env.local.txt" (Notepad), in UTF-16 (PowerShell "echo > file"), or edited
 * after the app started. This reads the likely files directly, so keys work without those pitfalls.
 * Values are only placed in process.env on the server; they are never sent to the browser.
 */
export const KEY_NAMES = ["ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY", "OPENAI_API_KEY", "AI_PROVIDER", "GEMINI_MODEL", "OPENAI_MODEL"] as const;
const CANDIDATES = [".env.local", ".env.local.txt", "env.local", "env.local.txt", ".env", ".env.txt", ".env.example"];

let lastSig = "";
let fromFiles: Record<string, string> = {};
export let envFilesFound: string[] = [];
export let envFileProblems: string[] = [];

function decode(buf: Buffer): string {
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString("utf16le");
  if (buf[0] === 0xfe && buf[1] === 0xff) return Buffer.from(buf.subarray(2)).swap16().toString("utf16le");
  if (buf.length > 3 && buf[1] === 0 && buf[3] === 0) return buf.toString("utf16le");
  return buf.toString("utf8").replace(/^﻿/, "");
}

export function parseEnv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line0 of text.split(/\r?\n/)) {
    const line = line0.replace(/^﻿/, "").trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(?:export\s+|set\s+|\$env:)?([A-Za-z_][A-Za-z0-9_]*)\s*[=:]\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    v = v.replace(/\s+#.*$/, "").trim();
    if (v && !/^(your[-_ ]?key[-_ ]?here|\.\.\.|sk-…|sk-\.\.\.)$/i.test(v)) out[m[1].toUpperCase()] = v;
  }
  return out;
}

/** Re-reads the key files if any changed, and fills in keys missing from process.env. */
export function ensureEnv() {
  const dir = process.cwd();
  const stats = CANDIDATES.map((f) => {
    try {
      const st = fs.statSync(path.join(dir, f));
      return st.isFile() ? `${f}:${st.mtimeMs}:${st.size}` : "";
    } catch {
      return "";
    }
  });
  const sig = stats.join("|");
  if (sig === lastSig) return apply();
  lastSig = sig;
  fromFiles = {};
  envFilesFound = [];
  envFileProblems = [];
  CANDIDATES.forEach((f, i) => {
    if (!stats[i]) return;
    envFilesFound.push(f);
    try {
      const buf = fs.readFileSync(path.join(dir, f));
      if (buf.length > 3 && buf[1] === 0 && buf[3] === 0) envFileProblems.push(`${f} is saved as UTF-16 (handled)`);
      const vals = parseEnv(decode(buf));
      const hasKey = ["ANTHROPIC_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY", "OPENAI_API_KEY"].some((k) => vals[k]);
      if (hasKey && f !== ".env.local" && f !== ".env") envFileProblems.push(`your key is in "${f}"; it should be in ".env.local" (handled for now)`);
      for (const k of KEY_NAMES) if (vals[k] && !fromFiles[k]) fromFiles[k] = vals[k];
    } catch {
      envFileProblems.push(`could not read ${f}`);
    }
  });
  apply();
}

const original: Record<string, string | undefined> = {};
function apply() {
  for (const k of KEY_NAMES) {
    if (!(k in original)) original[k] = process.env[k]?.trim() || undefined;
    const v = fromFiles[k] || original[k];
    if (v) process.env[k] = v;
    else delete process.env[k];
  }
  // Google's docs also call it GOOGLE_API_KEY.
  if (!process.env.GEMINI_API_KEY && process.env.GOOGLE_API_KEY) process.env.GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
}
