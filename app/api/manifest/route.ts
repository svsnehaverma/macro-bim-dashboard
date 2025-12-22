import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const moduleNames: Record<string, string> = {
  EL: "Education Landscape",
  OA: "Organisational Adoption",
  PE: "Policy Environment"
};

function parseDatasetFilename(filename: string): { module: string; country: string } | null {
  // Examples:
  // "EL - ECU XLSX Report - ... .xlsx"
  // "OA - PER XLSX Report - ... .xlsx"
  // "PE - ALL XLSX Report - ... .xlsx"
  const m = filename.match(/^([A-Z]{2})\s*-\s*([A-Z]{2,3}|ALL)\s+XLSX\s+Report/i);
  if (!m) return null;
  return { module: m[1].toUpperCase(), country: m[2].toUpperCase() };
}

export async function GET() {
  const dataDir = path.join(process.cwd(), "data");
  const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : [];

  const datasets: { module: string; country: string; filename: string }[] = [];
  for (const f of files) {
    if (!f.toLowerCase().endsWith(".xlsx")) continue;
    const parsed = parseDatasetFilename(f);
    if (!parsed) continue;
    datasets.push({ ...parsed, filename: f });
  }

  // group
  const map: Record<string, Set<string>> = {};
  for (const d of datasets) {
    map[d.module] = map[d.module] ?? new Set();
    map[d.module].add(d.country);
  }

  const modules = Object.keys(map)
    .sort()
    .map((k) => ({
      key: k,
      label: moduleNames[k] ?? k,
      countries: Array.from(map[k]).sort()
    }));

  return NextResponse.json({ modules, datasets });
}
