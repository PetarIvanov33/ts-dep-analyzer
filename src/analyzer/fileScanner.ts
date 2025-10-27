import fg from "fast-glob";

export async function scanFiles(root: string): Promise<string[]> {
  const base = root.replace(/\\/g, "/").replace(/\/+$/, "");
  return fg([`${base}/**/*.ts`, `${base}/**/*.tsx`], {
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    onlyFiles: true
  });
}
