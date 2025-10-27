import fs from "fs";
import path from "path";

export type Edge = { from: string; to: string };
export type Graph = { nodes: string[]; edges: Edge[] };

export function resolveImport(fromFileAbs: string, spec: string, rootAbs: string): string | null {
  if (!spec.startsWith(".")) return null; 
  const base = path.resolve(path.dirname(fromFileAbs), spec);
  const candidates = [".ts", ".tsx", "/index.ts", "/index.tsx"].map(ext => base + ext);
  for (const p of candidates) if (fs.existsSync(p)) return path.relative(rootAbs, p).replace(/\\/g, "/");
  return null;
}

export function buildGraph(filesAbs: string[], rootAbs: string, importMap: Record<string,string[]>): Graph {
  const nodes = filesAbs.map(f => path.relative(rootAbs, f).replace(/\\/g, "/"));
  const nodeSet = new Set(nodes);
  const edges: Edge[] = [];

  for (const [fromRel, specs] of Object.entries(importMap)) {
    const fromAbs = path.resolve(rootAbs, fromRel);
    for (const s of specs) {
      const toRel = resolveImport(fromAbs, s, rootAbs);
      if (toRel && nodeSet.has(toRel)) edges.push({ from: fromRel, to: toRel });
    }
  }
  return { nodes, edges };
}

export function tarjanSCC(g: Graph): string[][] {
  let index = 0;
  const stack: string[] = [];
  const onStack = new Set<string>();
  const idx: Record<string, number> = {};
  const low: Record<string, number> = {};
  const comps: string[][] = [];

  const adj = (v: string) => g.edges.filter(e => e.from === v).map(e => e.to);

  function strong(v: string) {
    idx[v] = low[v] = index++;
    stack.push(v); onStack.add(v);
    for (const w of adj(v)) {
      if (idx[w] === undefined) { strong(w); low[v] = Math.min(low[v], low[w]); }
      else if (onStack.has(w)) { low[v] = Math.min(low[v], idx[w]); }
    }
    if (low[v] === idx[v]) {
      const comp: string[] = [];
      while (true) {
        const w = stack.pop()!; onStack.delete(w); comp.push(w);
        if (w === v) break;
      }
      comps.push(comp);
    }
  }

  for (const v of g.nodes) if (idx[v] === undefined) strong(v);
  return comps.filter(c => c.length >= 2);
}
