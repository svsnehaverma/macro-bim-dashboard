"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar, SidebarSection } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { ChartCard } from "../components/ChartCard";

type Manifest = {
  modules: { key: string; label: string; countries: string[] }[];
  datasets: { module: string; country: string; filename: string }[];
};

type SummaryQuestion = {
  key: string;
  itemId: string;
  title: string;
  total: number;
  series: { name: string; value: number }[];
};

type Summary = {
  module: string;
  country: string;
  file: string;
  sheetName: string;
  questionCount: number;
  questions: SummaryQuestion[];
};

type SchemaResponse = {
  sections: Record<string, Array<{ key: string; label: string; questionIds: string[] }>>;
};

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [schema, setSchema] = useState<SchemaResponse | null>(null);

  const [moduleKey, setModuleKey] = useState<string>("EL");
  const [country, setCountry] = useState<string>("ECU");
  const [search, setSearch] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // NEW: section/subcategory state
  const [sectionKey, setSectionKey] = useState<string>("");

  useEffect(() => {
    fetch("/api/manifest")
      .then((r) => r.json())
      .then((m: Manifest) => {
        setManifest(m);
        const firstModule = m.modules?.[0]?.key ?? "EL";
        setModuleKey((prev) => (m.modules.find((x) => x.key === prev) ? prev : firstModule));
      })
      .catch((e) => setErr(String(e?.message ?? e)));
  }, []);

  // load schema (EL/OA subcategories from your JSON)
  useEffect(() => {
    fetch("/api/schema")
      .then((r) => r.json())
      .then((s: SchemaResponse) => {
        if ((s as any)?.error) throw new Error((s as any).error);
        setSchema(s);
      })
      .catch((e) => setErr(String(e?.message ?? e)));
  }, []);

  const availableCountries = useMemo(() => {
    const mod = manifest?.modules?.find((m) => m.key === moduleKey);
    const list = mod?.countries?.length ? mod.countries : ["ECU"];
    return list;
  }, [manifest, moduleKey]);

  useEffect(() => {
    if (!availableCountries.includes(country)) setCountry(availableCountries[0]);
  }, [availableCountries, country]);

  // available sections for the active module
  const sections: SidebarSection[] = useMemo(() => {
    const list = schema?.sections?.[moduleKey] ?? [];
    // If schema missing for PE, fallback
    if (!list.length) return [{ key: `${moduleKey}_ALL`, label: "All" }];
    return list.map((x) => ({ key: x.key, label: x.label }));
  }, [schema, moduleKey]);

  // keep selected section valid
  useEffect(() => {
    if (!sections.length) return;
    if (!sectionKey || !sections.find((s) => s.key === sectionKey)) {
      setSectionKey(sections[0].key);
    }
  }, [sections, sectionKey]);

  // fetch summary when module/country changes
  useEffect(() => {
    if (!manifest) return;
    setErr(null);
    setSummary(null);
    const url = `/api/summary?module=${encodeURIComponent(moduleKey)}&country=${encodeURIComponent(country)}`;
    fetch(url)
      .then((r) => r.json())
      .then((s) => {
        if (s?.error) throw new Error(s.error);
        setSummary(s);
      })
      .catch((e) => setErr(String(e?.message ?? e)));
  }, [manifest, moduleKey, country]);

  const moduleLabel =
    manifest?.modules?.find((m) => m.key === moduleKey)?.label ??
    (moduleKey === "EL" ? "Education Landscape" : moduleKey === "OA" ? "Organisational Adoption" : moduleKey);

  // Map current section -> allowed question IDs
  const allowedIds = useMemo(() => {
    const list = schema?.sections?.[moduleKey] ?? [];
    const sec = list.find((x) => x.key === sectionKey);
    // For PE or “All” fallback: empty list means “don’t filter by ids”
    return new Set((sec?.questionIds ?? []).map(String));
  }, [schema, moduleKey, sectionKey]);

  const filtered = useMemo(() => {
    const qs = summary?.questions ?? [];

    // 1) Section filter (by question ids)
    const bySection =
      allowedIds.size > 0 ? qs.filter((q) => allowedIds.has(String(q.itemId))) : qs;

    // 2) Search filter
    const q = search.trim().toLowerCase();
    if (!q) return bySection;
    return bySection.filter(
      (x) =>
        (x.title || "").toLowerCase().includes(q) ||
        (x.itemId || "").toLowerCase().includes(q)
    );
  }, [summary, search, allowedIds]);

  const modules = manifest?.modules?.map((m) => m.key) ?? ["EL", "OA", "PE"];

  return (
    <div className="container">
      <Sidebar
        modules={modules}
        activeModule={moduleKey}
        onSelectModule={(m) => {
          setModuleKey(String(m));
          setSearch("");
        }}
        sections={sections}
        activeSectionKey={sectionKey}
        onSelectSection={(k) => {
          setSectionKey(k);
          setSearch("");
        }}
      />

      <div className="main">
        <div className="topbar">
          <div className="topbarLeft">
            <div className="topbarTitle">{moduleLabel}</div>
            <div className="topbarSub">
              Dashboards / {moduleLabel}
              {sections.find((s) => s.key === sectionKey)?.label
                ? ` / ${sections.find((s) => s.key === sectionKey)!.label}`
                : ""}
            </div>
          </div>

          <div className="topbarRight">
            <div className="control">
              <label>Country</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="control">
              <label>Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Question / ID…"
              />
            </div>
          </div>
        </div>

        {err && (
          <div className="grid">
            <div className="card cardWide">
              <div className="cardHeader">
                <div className="cardTitle">Couldn’t load data</div>
              </div>
              <div className="small">{err}</div>
              <div className="small" style={{ marginTop: 10 }}>
                Tip: ensure the Excel file exists in <code>/data</code> and has an <b>Answers</b> sheet, and JSON schema files exist in <code>/data</code>.
              </div>
            </div>
          </div>
        )}

        {!err && (!summary || !schema) && (
          <div className="grid">
            <div className="card cardWide">
              <div className="small">Loading dashboard…</div>
            </div>
          </div>
        )}

        {!err && summary && schema && (
          <div className="grid">
            {filtered.slice(0, 24).map((q) => (
              <ChartCard key={q.key} title={q.title} itemId={q.itemId} total={q.total} series={q.series} />
            ))}

            {filtered.length > 24 && (
              <div className="card cardWide">
                <div className="small">
                  Showing first 24 questions (search to narrow). Total matching questions: <b>{filtered.length}</b>.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
