import path from "path";
import { analyze } from "./analyzer/index";

const argRoot = process.argv[2] ?? "./src";
const root = path.resolve(process.cwd(), argRoot);

analyze(root).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
