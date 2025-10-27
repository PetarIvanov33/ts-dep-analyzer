import type { Edge } from "./graph";

export type LLMInput = {
  modules: Array<{ id: string; imports: string[]; externalImports: string[] }>;
  cycles: string[][];
};

export function buildLLMSummary(
  filesRel: string[],
  importMap: Record<string, string[]>,
  resolvedEdges: Edge[]
): LLMInput {
  const localResolved: Record<string, string[]> = {};
  const external: Record<string, string[]> = {};

  for (const [from, specs] of Object.entries(importMap)) {
    const ext: string[] = [];
    for (const s of specs) {
      if (!s.startsWith(".") && !s.startsWith("/")) ext.push(s);
    }
    external[from] = Array.from(new Set(ext));
    localResolved[from] = []; 
  }

  for (const e of resolvedEdges) {
    (localResolved[e.from] ||= []).push(e.to);
  }

  const modules = filesRel.map(id => ({
    id,
    imports: Array.from(new Set(localResolved[id] || [])),
    externalImports: external[id] || []
  }));

  return { modules, cycles: [] };
}
