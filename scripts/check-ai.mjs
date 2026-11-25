// Start-up check: finds the AI key file, fixes common Windows mistakes, and tests the key.
// Never prints the full key.
import fs from "node:fs";
import path from "node:path";

const dir = process.cwd();
const say = (s = "") => console.log("  " + s);
const exists = (f) => fs.existsSync(path.join(dir, f));

function decode(buf) {
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString("utf16le");
  if (buf.length > 3 && buf[1] === 0 && buf[3] === 0) return buf.toString("utf16le");
  return buf.toString("utf8").replace(/^﻿/, "");
}
function parse(text) {
  const out = {};
  for (const l0 of text.split(/\r?\n/)) {
    const l = l0.replace(/^﻿/, "").trim();
    const m = !l.startsWith("#") && l.match(/^(?:export\s+|set\s+|\$env:)?([A-Za-z_][A-Za-z0-9_]*)\s*[=:]\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim().replace(/^(['"])(.*)\1$/, "$2").replace(/\s+#.*$/, "").trim();
    if (v && !/^(your[-_ ]?key[-_ ]?here|\.\.\.)$/i.test(v)) out[m[1].toUpperCase()] = v;
  }
  return out;
}
const mask = (v) => `${v.slice(0, 4)}…(${v.length} characters)`;

console.log("");
console.log("  ---- AI key check ----");

// 1. Fix the file name Windows Notepad often adds.
for (const wrong of [".env.local.txt", "env.local", "env.local.txt", ".env.txt"]) {
  if (exists(wrong) && !exists(".env.local")) {
    fs.renameSync(path.join(dir, wrong), path.join(dir, ".env.local"));
    say(`Fixed: renamed "${wrong}" to ".env.local".`);
  }
}

// A key typed into .env.example would be lost at the next update, so copy it into .env.local.
if (!exists(".env.local") && exists(".env.example")) {
  const ex = parse(decode(fs.readFileSync(path.join(dir, ".env.example"))));
  if (ex.GEMINI_API_KEY || ex.GOOGLE_API_KEY || ex.ANTHROPIC_API_KEY || ex.OPENAI_API_KEY) {
    fs.copyFileSync(path.join(dir, ".env.example"), path.join(dir, ".env.local"));
    say('Fixed: your key was in ".env.example", so it was copied to ".env.local" (keep it there).');
  }
}

if (!exists(".env.local")) {
  say("No .env.local file found in:");
  say(dir);
  say("The app will run in Demonstration mode. See Settings > AI configuration to add a free Gemini key.");
  console.log("");
  process.exit(0);
}

// 2. Fix UTF-16 files (made by PowerShell "echo ... > .env.local").
const file = path.join(dir, ".env.local");
let buf = fs.readFileSync(file);
if ((buf[0] === 0xff && buf[1] === 0xfe) || (buf.length > 3 && buf[1] === 0 && buf[3] === 0) || (buf[0] === 0xef && buf[1] === 0xbb)) {
  fs.writeFileSync(file, decode(buf), "utf8");
  say("Fixed: converted .env.local to plain UTF-8 text.");
  buf = fs.readFileSync(file);
}

const vals = parse(decode(buf));
if (!vals.GEMINI_API_KEY && vals.GOOGLE_API_KEY) vals.GEMINI_API_KEY = vals.GOOGLE_API_KEY;
const found = ["GEMINI_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY"].filter((k) => vals[k]);
if (!found.length) {
  say(".env.local was found, but it has no key in it.");
  say('Add a line like:  GEMINI_API_KEY=AIza...   (no spaces, no quotes needed)');
  console.log("");
  process.exit(0);
}
for (const k of found) say(`Found ${k} = ${mask(vals[k])}`);

const want = (vals.AI_PROVIDER || "").toLowerCase();
const order = want ? [want, "anthropic", "gemini", "openai"] : ["anthropic", "gemini", "openai"];
const names = { anthropic: "ANTHROPIC_API_KEY", gemini: "GEMINI_API_KEY", openai: "OPENAI_API_KEY" };
const using = order.find((p) => vals[names[p]]);
say(`The app will use: ${using === "gemini" ? "Google Gemini" : using === "anthropic" ? "Claude" : "OpenAI"}`);

// 3. Test the Gemini key (free, no tokens used).
if (using === "gemini") {
  const key = vals.GEMINI_API_KEY;
  if (key.startsWith("sk-")) say("Warning: this looks like an OpenAI key, not a Google key.");
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(10000) });
    if (r.ok) {
      const j = await r.json();
      const flash = (j.models ?? []).map((m) => m.name.replace("models/", "")).filter((n) => /flash/.test(n) && !/image|tts|audio|live|embedding/.test(n));
      say(`Gemini key works. ${flash.length} Flash models available on this key.`);
    } else if (r.status >= 500) say(`Google's AI service is busy right now (${r.status}). The app will retry; try again in a minute if it fails.`);
    else if (r.status === 400 || r.status === 401 || r.status === 403) say("Google rejected this key. Create a new one at https://aistudio.google.com/apikey and paste it again.");
    else say(`Google answered with an error (${r.status}). The app will still try.`);
  } catch {
    say("Could not reach Google to test the key (no internet or blocked). The app will still try.");
  }
}
console.log("");
