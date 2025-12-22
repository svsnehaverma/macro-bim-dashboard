import { readFile } from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Put the json next to this route file:
  // app/api/schema/education-landscape-v2.json
  const fileUrl = new URL("./education-landscape-v2.json", import.meta.url);
  const jsonText = await readFile(fileUrl, "utf-8");

  return new Response(jsonText, {
    headers: { "content-type": "application/json" },
  });
}
