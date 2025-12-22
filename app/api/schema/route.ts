import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function readJson(relPath: string) {
  const p = path.join(process.cwd(), relPath);
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw);
}

function elementTitles(survey: any, pageTitle: string): string[] {
  const page = (survey?.pages ?? []).find((p: any) => p?.title === pageTitle);
  if (!page) return [];
  return (page.elements ?? [])
    .map((e: any) => {
      const t = e?.title;
      if (!t) return "";
      if (typeof t === "string") return t.trim();
      if (typeof t === "object") return (t.default ?? "").trim();
      return "";
    })
    .filter(Boolean);
}

export async function GET() {
  // Put your JSON files in /data exactly like this (recommended):
  // data/JSON file Education Landscape v2.json
  // data/JSON file Organisational Adoption Study.json
  const el = readJson("data/JSON file Education Landscape v2.json");
  const oa = readJson("data/JSON file Organisational Adoption Study.json");

  // VIDEO-LIKE 4 subcategories
  const EL = {
    key: "EL",
    label: "Education Landscape",
    subcategories: [
      {
        key: "EL_HEP",
        label: "Higher education programmes",
        pages: ["Educational Units", "Learning Outcomes", "Educational Framework"],
      },
      { key: "EL_RES", label: "Research", pages: ["Research"] },
      { key: "EL_SC", label: "Short courses & training", pages: ["Short Courses and BIM-related Training"] },
      {
        key: "EL_COLLAB",
        label: "Collaboration",
        pages: ["Collaboration between academia, government and/or industry"],
      },
    ],
  };

  const OA = {
    key: "OA",
    label: "Organisational Adoption",
    subcategories: [
      { key: "OA_ORG", label: "Organisation information", pages: ["Organisation information"] },
      { key: "OA_ADOPT", label: "Adoption", pages: ["Adoption"] },
      { key: "OA_TD", label: "Targeted deliverables", pages: ["Targeted deliverables"] },
      { key: "OA_INT", label: "Interoperability", pages: ["Interoperability"] },
    ],
  };

  // Expand to question titles (exact matching against Excel “Item Title”)
  const expand = (mod: any, survey: any) => ({
    ...mod,
    subcategories: mod.subcategories.map((sc: any) => {
      const titles = sc.pages.flatMap((pt: string) => elementTitles(survey, pt));
      return { ...sc, titles };
    }),
  });

  return NextResponse.json({
    modules: [expand(EL, el), expand(OA, oa)],
  });
}
