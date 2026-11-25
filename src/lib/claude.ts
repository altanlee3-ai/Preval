import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5-5";
export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY?.trim());

let client: Anthropic | null = null;
export function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 60_000 });
  return client;
}

export const SAFETY_RULES = `You are the health-education engine inside "Prevo", a Year 10 student STEAM prototype about illness prevention.
Non-negotiable safety rules:
- You are NOT a doctor. Never give a diagnosis, never say someone "has" a condition, never state probabilities or percentages for conditions.
- Never recommend specific prescription medicines, doses or treatment plans. You may say "ask a pharmacist or doctor before taking any medicine".
- Use cautious, evidence-based, general information consistent with WHO / CDC / NHS public guidance. If unsure, say so.
- Always point out recognised emergency warning signs and say to call 1669 (Thailand) or the local emergency number when relevant.
- Never provide false reassurance ("it's nothing", "you're fine").
- Do not invent statistics, outbreaks, or local disease activity.
- If the user mentions self-harm or suicide, respond with care and give the Thailand Mental Health Hotline 1323 (24 h) and 1669 for emergencies.
- Write for teenagers and ordinary people: short, plain sentences.`;

export function errorMessage(e: unknown) {
  if (e instanceof Anthropic.AuthenticationError) return "The AI key was rejected (check ANTHROPIC_API_KEY).";
  if (e instanceof Anthropic.RateLimitError) return "The AI service is busy (rate limit). Please try again shortly.";
  if (e instanceof Anthropic.APIConnectionError) return "Could not reach the AI service (network).";
  if (e instanceof Anthropic.APIError) return `AI service error (${e.status ?? "unknown"}).`;
  return "Unexpected error while contacting the AI service.";
}
