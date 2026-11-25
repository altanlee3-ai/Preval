# Prevo: Health Awareness & Illness Prevention (STEAM prototype)

**Prevention of Illness Using an App Interface and AI Analysis**, a Year 10 STEAM project.

Prevo is an educational, privacy-first web app. It helps people understand their symptoms, learn when to seek care, keep track of how they feel, and see environmental and public-health information. **It does not diagnose, prescribe or give medicine doses.**

---

## Quick start

**Windows, easiest way:** install Node.js, then double-click **`Start Prevo.bat`** in this folder. The first run installs everything. After that, it starts the app and opens your browser.


You need **Node.js 18.18 or newer** (20 or 22 recommended). Get it from https://nodejs.org.

```bash
cd prevo
npm install
npm run dev
```

Open **http://localhost:3000**. That's all you need, and the whole app works without an API key in **Demonstration mode**.

For a faster "production" version (best for presenting):

```bash
npm run build
npm start
```

### Optional: turn on live AI (free with Google Gemini)

**Free option: Google Gemini**

1. Go to https://aistudio.google.com/apikey and sign in with a Google account. No credit card is needed.
2. Press **Create API key** and copy the key.
3. In the app folder, open or create a file called `.env.local` and add this line:
   ```
   GEMINI_API_KEY=your-key-here
   ```
   If you make it in Notepad, choose **Save as type: All Files** so it isn't saved as `.env.local.txt`.
4. Close the Prevo window and run `Start Prevo.bat` again. The badge at the top changes from **Demonstration mode** to **Live AI**.

The free tier has per-minute and daily limits. If you hit one, the app shows a labelled demo answer and says why. Google may use free-tier requests to improve its products; the app only sends anonymous answers. The default model is `gemini-flash-latest` (Google's newest Flash model). Change it with `GEMINI_MODEL=`.

**Badge still says Demonstration mode?** Open **Settings → AI configuration → Key check** and press **Test AI connection**. It shows which key file and keys the app found, the folder `.env.local` must be in, and the app version. `Start Prevo.bat` also prints a key check when it starts, and it fixes the two most common Windows mistakes itself: a file saved as `.env.local.txt`, and a file saved in UTF-16 by PowerShell. Only one Prevo window can run at a time.

**Paid options:** `ANTHROPIC_API_KEY` (Claude, https://console.anthropic.com/) or `OPENAI_API_KEY` (OpenAI, https://platform.openai.com/api-keys).

If more than one key is set, the order is Claude, then Gemini, then OpenAI. To choose, add `AI_PROVIDER=gemini` (or `anthropic` / `openai`). Keys are only used on the server (`src/lib/ai.ts`) and are never sent to the browser. If the AI is unreachable, over its limit, or the key is wrong, the app falls back to the labelled demonstration answers and tells you why. **Never share your key or post it anywhere.**

### Install as an app (PWA)

After `npm run build && npm start`, open the site in Chrome or Edge and choose **Install app**. On iPhone, use Safari and then **Share → Add to Home Screen**. Basic pages keep working offline.

---

## Put it online (GitHub + Render, free)

1. Put this folder in a GitHub repository. Never upload `.env.local`; it's already in `.gitignore`.
2. Sign in at https://render.com with GitHub, choose **New → Blueprint**, and pick the repository. Render reads `render.yaml`.
3. When Render asks for `GEMINI_API_KEY`, paste your free key from https://aistudio.google.com/apikey. You can also leave it empty to run in demo mode.
4. Press **Apply**. The first build takes a few minutes, and then you get a link like `https://preval.onrender.com`.

Notes:
- On the free plan the site sleeps after about 15 minutes with no visitors. The next visit takes up to a minute to wake it.
- Each visitor's health records stay in their own browser (localStorage), not on the server.
- Live AI is rate-limited per visitor so the free key isn't used up. Over the limit, visitors get the labelled demo answer.

## Features

| Page | What it does |
|---|---|
| **Home** | Greeting, a daily Prevo score (0–100 from sleep, water, activity, mood and habits; a guide, not a medical score), daily wellness check-in (sleep, water, activity, mood) with a 7-day chart and streak, environment snapshot, recent records, habit reminders, tips, community-health info |
| **Symptom Check** | A 4-step wizard: emergency warning signs, 77 searchable symptoms in 9 groups, free-text description, duration, severity and context. It gives a 4-level concern indicator and shows *what influenced it*, plus possible general causes, warning signs, when to seek care, prevention, and limitations |
| **Tracker** | Add, edit and delete symptom records, see severity-over-time and frequency charts, and create a summary to share with a health professional (copy, .txt or print). A history of past symptom checks is shown below. Demo data is clearly labelled |
| **Insights** | Pattern finder: compares symptom severity on days you met each sleep, water, activity and mood goal with days you didn't, with Pearson correlation and a scatter chart, plus an optional AI explanation (only summary numbers are sent). Also a printable 7-day health report and achievement badges |
| **Assistant** | Chat for general health-education questions, with voice input and read-aloud (browser speech). Emergency wording triggers an urgent-care banner |
| **Environment** | Live air quality (US AQI, PM2.5/PM10), temperature, "feels like" heat, humidity, UV and a 7-day outlook, with health advice and an hour-by-hour "best time to be active outdoors" planner. Data from Open-Meteo |
| **Disease Trends** | Live annual WHO Global Health Observatory data (TB incidence, measles cases) by country, plus links to official warning sources and a clearly **SIMULATED** seasonal-pattern teaching chart |
| **Prevention** | 8 evidence-based topic cards with sources, a guided breathing exercise, first-aid basics (cuts, burns, nosebleeds, heat, sprains, bites, choking), plus a knowledge quiz |
| **Research** | Objectives, the 3 phases, a comparison of existing app types, a feature checklist, a SUS usability survey, timed usability tasks, live performance and safety tests, and known limitations. Results can be exported as CSV |
| **Settings & Privacy** | Theme, English/Thai, text size, high contrast, reduced motion, area, reminders, consent, JSON export, a one-click **presentation demo** (labelled example data) and **delete all data** |

### Sharing

The QR button at the top shows a QR code and link for the current website, handy for presentations and posters. Link previews (LINE, Messenger and others) use `public/og.png`.

## Safety design

- **Rules first, AI second.** The concern level comes from transparent, conservative rules (`src/lib/triage.ts`). Any emergency warning sign gives *Urgent*. The AI may **raise** the level but can **never lower** it.
- Some symptoms (e.g. blood in urine, yellow skin, blurred vision) raise the level on their own, and fever with a stiff neck gives *Urgent*.
- Free-text is scanned for emergency phrases in English and Thai (chest pain, can't breathe, stroke signs, self-harm and others). If one is found, the app shows 1669 and 1323 straight away.
- Levels are labelled as *categories, not probabilities*. The rules are not clinically validated, and the app says so.
- Symptom urgency is kept **separate** from environmental and community information.
- The AI system prompt forbids diagnoses, medicine names and doses, invented statistics and outbreaks. Its output is constrained to a JSON schema.
- **No invented outbreaks.** No official alert feed is connected, and the app says so. Simulated data is always badged.
- Demo answers are pre-written, reviewed text and are labelled "Demonstration mode, not live AI".

## Privacy

- No accounts, names, emails, cookies or tracking.
- Health records are saved **only in this browser** (localStorage), and only after the user agrees. Without consent, data lasts for the session only.
- Location is optional and rounded to about 11 km (a broad area).
- Users can export or delete all of their data in Settings.

## Data sources

- Weather and air quality: [Open-Meteo](https://open-meteo.com/) (CC BY 4.0), with air quality from CAMS. Fetched in the browser. If it can't be reached, labelled simulated values are shown instead.
- Disease trends: [WHO Global Health Observatory OData API](https://www.who.int/data/gho/info/gho-odata-api). If it fails, **no substitute numbers** are shown.
- Educational content: WHO, CDC, NHS, Thailand DDC and US EPA/NWS thresholds (cited in the app).

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · custom shadcn-style components · Recharts · Motion · lucide-react icons · Anthropic TypeScript SDK or OpenAI API (optional) · PWA (manifest + service worker).

```
src/
  app/            pages + API routes (api/analyze, api/chat, api/status, api/who)
  components/     AppShell (navigation), ui.tsx (buttons, cards, dialogs…), health.tsx
  lib/            triage rules, symptom catalogue, demo cases, i18n (EN/TH),
                  environment + trends helpers, local store (consent-aware)
public/           manifest, service worker, icons
```

## Known limitations

These are listed on the Research page too. The rules are not clinically validated. Demo mode only covers common symptom patterns. WHO data is annual and national. There is no live outbreak feed. Data is lost if browser storage is cleared. Biomarkers and microbiome analysis are future research concepts only.

---

*Educational prototype. Not a medical device. In an emergency in Thailand call **1669**. Mental health hotline: **1323** (24 h).*
