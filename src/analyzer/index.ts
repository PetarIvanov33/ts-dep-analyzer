import fs from "fs";
import path from "path";
import { scanFiles } from "./fileScanner";
import { extractImports } from "./parser";
import { buildGraph, tarjanSCC } from "./graph";
import { buildLLMSummary } from "./summary";
import { analyzeWithGemini } from "../llm/geminiClient";

export async function analyze(root: string) {
  const absRoot = path.resolve(root);
  const filesAbs = await scanFiles(absRoot);

  const importMap: Record<string, string[]> = {};
  const filesRel = filesAbs.map((p) =>
    path.relative(absRoot, p).replace(/\\/g, "/")
  );
  for (const fileAbs of filesAbs) {
    const rel = path.relative(absRoot, fileAbs).replace(/\\/g, "/");
    const code = fs.readFileSync(fileAbs, "utf8");
    importMap[rel] = extractImports(fileAbs, code);
  }

  console.log("\n=== Import Map ===");
  for (const [from, list] of Object.entries(importMap))
    for (const to of list) console.log(`${from} → ${to}`);

  const graph = buildGraph(filesAbs, absRoot, importMap);
  const scc = tarjanSCC(graph);
  console.log("\n=== Circular Dependencies ===");
  if (scc.length === 0) console.log("(none)");
  else scc.forEach((c) => console.log(c.join(" → ")));

  const llmInput = buildLLMSummary(filesRel, importMap, graph.edges);
  llmInput.cycles = scc;

  let llmOutput: any = undefined;
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("\n=== Gemini AI Analysis ===");
      llmOutput = await analyzeWithGemini(llmInput);
      console.log(JSON.stringify(llmOutput, null, 2));
    } catch (e: any) {
      console.error("[LLM] Error:", e.message || e);
    }
  } else {
    console.log("\n[LLM] GEMINI_API_KEY липсва – пропускам AI анализа.");
  }

  const outDir = path.join(process.cwd(), ".dep-report");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "analysis.json"),
    JSON.stringify({ importMap, graph, cycles: scc, llm: llmOutput }, null, 2),
    "utf8"
  );

  const totalFiles = Object.keys(importMap).length;
  const totalImports = Object.values(importMap).reduce(
    (a, b) => a + b.length,
    0
  );
  const avgImports = (totalImports / totalFiles).toFixed(2);
  const totalCycles = scc.length;

  console.log("\n=== Metrics Summary ===");
  console.log(`Files analyzed: ${totalFiles}`);
  console.log(`Total imports: ${totalImports}`);
  console.log(`Average imports per file: ${avgImports}`);
  console.log(`Circular dependencies: ${totalCycles}`);

  if (llmOutput) {
    console.log("\n=== AI Summary ===");
    const risks = llmOutput.risks
      ?.slice(0, 2)
      .map((r: string) => "- " + r.replace(/\s+/g, " ").trim())
      .join("\n");
    const recs = llmOutput.refactor_recommendations
      ?.slice(0, 2)
      .map((r: string) => "- " + r.replace(/\s+/g, " ").trim())
      .join("\n");
    if (risks) console.log("Top Risks:\n" + risks);
    if (recs) console.log("\nRecommendations:\n" + recs);
  }

  console.log(`\nSaved: ${path.join(outDir, "analysis.json")}`);
}
