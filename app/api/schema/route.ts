import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const filePath = path.join(process.cwd(), "public", "schema", "education-landscape-v2.json");
  const jsonText = await readFile(filePath, "utf-8");

  return new Response(jsonText, {
    headers: { "content-type": "application/json" },
  });
}
