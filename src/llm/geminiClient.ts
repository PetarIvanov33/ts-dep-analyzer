import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMInput } from "../analyzer/summary";

export type LLMReport = {
  version: string;
  risks: string[];
  cycles_explained: Array<{ cycle: string[]; why: string }>;
  tight_clusters: Array<{ modules: string[]; reason: string }>;
  refactor_recommendations: string[];
};

export async function analyzeWithGemini(input: LLMInput): Promise<LLMReport> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: { responseMimeType: "application/json" },
  });

  const system =
    "You are a senior software architect. You receive ONLY metadata of a TypeScript dependency graph. " +
    "Return STRICT JSON with fields: " +
    "{version:string, risks:string[], cycles_explained:{cycle:string[], why:string}[], " +
    "tight_clusters:{modules:string[], reason:string}[], refactor_recommendations:string[] }. " +
    "Do NOT include markdown, code fences or prose.";

  const payload = { summary: input };

  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: system + "\n\nDATA:\n" + JSON.stringify(payload) }]}],
  });

  const text = res.response.text().trim();
  return JSON.parse(text) as LLMReport;
}
