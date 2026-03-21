import fs from "fs";
import path from "path";
import type { SchoolRegistryFile } from "./types";

let cached: SchoolRegistryFile | null = null;

export function getSchoolRegistry(): SchoolRegistryFile {
  if (cached) return cached;
  const p = path.join(process.cwd(), "data", "mba_interview_dataset", "school_registry.json");
  const raw = fs.readFileSync(p, "utf-8");
  cached = JSON.parse(raw) as SchoolRegistryFile;
  return cached;
}

export function isValidSchoolId(id: string): boolean {
  return getSchoolRegistry().schools.some((s) => s.id === id);
}
