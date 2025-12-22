import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

type Row = {
  "Item ID"?: string | number;
  "Item Title"?: string;
  "User Input"?: string;
  "Item Type"?: string;
};

function parseDatasetFilename(filename: string): { module: string; country: string } | null {
  const m = filename.match(/^([A-Z]{2})\s*-\s*([A-Z]{2,3}|ALL)\s+XLSX\s+Report/i);
  if (!m) return null;
  return { module: m[1].toUpperCase(), country: m[2].toUpperCase() };
}

function normalize(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function splitMulti(value: string): string[] {
  // Heuristic: for multi-select answers, exports often join values with ';' or ','.
  // We split only when it looks like multiple choices (contains ';' or '|' or ' , ').
  const v = value.trim();
  if (!v) return [];
  if (v.includes(";")) return v.split(";").map((x) => x.trim()).filter(Boolean);
  if (v.includes("|")) return v.split("|").map((x) => x.trim()).filter(Boolean);
  // avoid splitting normal sentences by comma
  const commaCount = (v.match(/,/g) || []).length;
  if (commaCount >= 2) return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [v];
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const moduleKey = (url.searchParams.get("module") || "EL").toUpperCase();
  const country = (url.searchParams.get("country") || "ECU").toUpperCase();

  const dataDir = path.join(process.cwd(), "data");
  const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : [];

  const match = files.find((f) => {
    if (!f.toLowerCase().endsWith(".xlsx")) return false;
    const p = parseDatasetFilename(f);
    return p?.module === moduleKey && p?.country === country;
  });

  if (!match) {
    return NextResponse.json(
      { error: `No dataset found for module=${moduleKey}, country=${country}. Put the XLSX in /data with name like 'EL - ECU XLSX Report - ...xlsx'.` },
      { status: 404 }
    );
  }

  const filePath = path.join(dataDir, match);
  const buf = fs.readFileSync(filePath);
  const wb = XLSX.read(buf, { type: "buffer" });

  const sheetName = wb.SheetNames.includes("Answers") ? "Answers" : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Row>(ws, { defval: "" });

  const agg: Record<string, { itemId: string; title: string; total: number; counts: Record<string, number> }> = {};

  for (const r of rows) {
    const itemId = normalize(r["Item ID"]);
    const title = normalize(r["Item Title"]);
    const raw = normalize(r["User Input"]);
    if (!itemId && !title) continue;

    const key = itemId || title;
    if (!agg[key]) agg[key] = { itemId, title, total: 0, counts: {} };

    const answers = splitMulti(raw || "(blank)");
    if (answers.length === 0) continue;

    for (const a of answers) {
      const ans = a || "(blank)";
      agg[key].total += 1;
      agg[key].counts[ans] = (agg[key].counts[ans] ?? 0) + 1;
    }
  }

  const questions = Object.entries(agg).map(([key, v]) => ({
    key,
    itemId: v.itemId,
    title: v.title,
    total: v.total,
    series: Object.entries(v.counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }));

  questions.sort((a, b) => b.total - a.total);

  return NextResponse.json({
    module: moduleKey,
    country,
    file: match,
    sheetName,
    questionCount: questions.length,
    questions
  });
}
