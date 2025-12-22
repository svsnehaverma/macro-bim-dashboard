import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type SurveySchema = {
  title?: string;
  pages?: Array<{
    title?: string | { default?: string; [k: string]: any };
    elements?: Array<{ question_id?: string | number; name?: string }>;
  }>;
};

function titleToString(t: any) {
  if (!t) return "";
  if (typeof t === "string") return t;
  if (typeof t === "object") return t.default ?? t.en ?? t.es ?? t["pt-br"] ?? "";
  return String(t);
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export async function GET() {
  const dataDir = path.join(process.cwd(), "data");

  const elPath = path.join(dataDir, "JSON file Education Landscape v2.json");
  const oaPath = path.join(dataDir, "JSON file Organisational Adoption Study.json");

  if (!fs.existsSync(elPath) || !fs.existsSync(oaPath)) {
    return NextResponse.json(
      {
        error:
          "Schema JSON files not found. Place them in /data as: 'JSON file Education Landscape v2.json' and 'JSON file Organisational Adoption Study.json'.",
      },
      { status: 404 }
    );
  }

  const el: SurveySchema = JSON.parse(fs.readFileSync(elPath, "utf-8"));
  const oa: SurveySchema = JSON.parse(fs.readFileSync(oaPath, "utf-8"));

  // --- EL (8 pages in JSON) -> 4 video-style subcategories
  const elPages = el.pages ?? [];
  const byTitle = new Map<string, string[]>();

  for (const p of elPages) {
    const pt = titleToString(p.title);
    const ids =
      (p.elements ?? [])
        .map((e) => (e.question_id ?? e.name ?? "").toString())
        .filter(Boolean) ?? [];
    byTitle.set(pt, ids);
  }

  // These names match your EL JSON “default” titles
  const elGeneral = byTitle.get("General") ?? [];
  const elEduUnits = byTitle.get("Educational Units") ?? [];
  const elLearning = byTitle.get("Learning Outcomes") ?? [];
  const elFramework = byTitle.get("Educational Framework") ?? [];
  const elResearch = byTitle.get("Research") ?? [];
  const elShort = byTitle.get("Short Courses and BIM-related Training") ?? [];
  const elCollab = byTitle.get("Collaboration between academia, government and/or industry") ?? [];
  const elAdditional = byTitle.get("Additional Info") ?? [];

  const EL = [
    {
      key: "EL_HEP",
      label: "Higher education programmes",
      questionIds: uniq([...elGeneral, ...elEduUnits, ...elLearning, ...elFramework]),
    },
    { key: "EL_RES", label: "Research", questionIds: uniq([...elResearch]) },
    { key: "EL_SC", label: "Short courses & BIM training", questionIds: uniq([...elShort]) },
    { key: "EL_COL", label: "Collaboration", questionIds: uniq([...elCollab]) },
    // If you want, we can add “Additional Info” as a 5th section, but video shows 4.
    // { key: "EL_ADD", label: "Additional Info", questionIds: uniq([...elAdditional]) },
  ];

  // --- OA (already 4 pages)
  const oaPages = oa.pages ?? [];
  const OA = oaPages.map((p, idx) => {
    const label = titleToString(p.title) || `Section ${idx + 1}`;
    const questionIds =
      (p.elements ?? [])
        .map((e) => (e.question_id ?? e.name ?? "").toString())
        .filter(Boolean) ?? [];
    return { key: `OA_${idx + 1}`, label, questionIds: uniq(questionIds) };
  });

  // PE: keep as a single bucket for now (unless you have a PE JSON schema too)
  const PE = [{ key: "PE_ALL", label: "All", questionIds: [] as string[] }];

  return NextResponse.json({
    sections: {
      EL,
      OA,
      PE,
    },
  });
}
