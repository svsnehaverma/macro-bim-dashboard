"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar, ModuleNode } from "../components/Sidebar";
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

type StructureModule = {
  key: string;
  label: string;
  subcategories: { key: string; label: string; titles: string[] }[];
};

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [structure, setStructure] = useState<StructureModule[] | null>(null);

  const [moduleKey, setModuleKey] = useState<string>("EL");
  const [subcatKey, setSubcatKey] = useState<string>("EL_HEP");

  const [country, setCountry] = useState<string>("ECU");
  const [search, setSearch] = useState<string>("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/manifest")
      .then((r) => r.json())
      .then((m: Manifest) => setManifest(m))
      .catch((e) => setErr(String(e?.message ?? e)));
  }, []);

  useEffect(() => {
    fetch("/api/structure")
      .then((r) => r.json())
      .then((s) => setStructure(s.modules))
      .catch((e) => setErr(String(e?.message ?? e)));
  }, []);

  const sidebarModules: ModuleNode[] = useMemo(() => {
    return (structure ?? []).map((m) => ({
      key: m.key,
      label: m.label,
      subcategories: (m.subcategories ?? []).map((sc) => ({ key: sc.key, label: sc.label })),
    }));
  }, [structure]);

  const moduleLabel =
    manifest?.modules?.find((m) => m.key === moduleKey)?.label ??
    structure?.find((m) => m.key === moduleKey)?.label ??
    moduleKey;

  const availableCountries = useMemo(() => {
    const mod = manifest?.modules?.find((m) => m.key === moduleKey);
    return mod?.countries?.length ? mod.countries : ["ECU"];
  }, [manifest, moduleKey]);

  // keep selected country valid for module
  useEffect(() => {
    if (!availableCountries.includes(country)) setCountry(availableCountries[0]);
  }, [availableCountries, country]);

  // load summary (Excel aggregation)
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

  const allowedTitlesSet = useMemo(() => {
    const mod = structure?.find((m) => m.key === moduleKey);
    const sc = mod?.subcategories?.find((x) => x.key === subcatKey);
    const titles = sc?.titles ?? [];
    return new Set(titles.map((t) => t.trim().toLowerCase()));
  }, [structure, moduleKey, subcatKey]);

  const filtered = useMemo(() => {
    const qs = summary?.questions ?? [];
    const q = search.trim().toLowerCase();

    // 1) filter by subcategory (JSON titles)
    let out = qs;
    if (allowedTitlesSet.size) {
      out = out.filter((x) => allowedTitlesSet.has((x.title ?? "").trim().toLowerCase()));
    }

    // 2) filter by search
    if (q) {
      out = out.filter(
        (x) => (x.title || "").toLowerCase().includes(q) || (x.itemId || "").toLowerCase().includes(q)
      );
    }
    return out;
  }, [summary, search, allowedTitlesSet]);

  const onSelect = (m: string, sc: string) => {
    setModuleKey(m);
    setSubcatKey(sc);
  };

  // If structure loads later, keep a valid subcategory selected
  useEffect(() => {
    const mod = structure?.find((m) => m.key === moduleKey);
    if (!mod) return;
    if (!mod.subcategories.find((x) => x.key === subcatKey)) {
      setSubcatKey(mod.subcategories?.[0]?.key ?? "");
    }
  }, [structure, moduleKey, subcatKey]);

  return (
    <div className="shell">
      <Sidebar
        modules={sidebarModules.length ? sidebarModules : [
          { key: "EL", label: "Education Landscape", subcategories: [{ key: "EL_HEP", label: "Higher education programmes" }] },
          { key: "OA", label: "Organisational Adoption", subcategories: [{ key: "OA_ORG", label: "Organisation information" }] },
        ]}
        activeModule={moduleKey}
        activeSubcat={subcatKey}
        onSelect={onSelect}
      />

      <div className="content">
        <main className="main">
          <Topbar
            title={moduleLabel}
            breadcrumb={`Dashboards / ${moduleLabel}`}
            countries={availableCountries}
            country={country}
            onCountry={setCountry}
            search={search}
            onSearch={setSearch}
          />

          {err && (
            <div className="grid">
              <div className="card cardWide">
                <div className="cardHeader">
                  <div className="cardTitle">Couldn’t load data</div>
                </div>
                <div className="small">{err}</div>
                <div className="small" style={{ marginTop: 10 }}>
                  Tip: ensure Excel is in <code>/data</code> and JSON is in <code>/data</code> too.
                </div>
              </div>
            </div>
          )}

          {!err && (!summary || !structure) && (
            <div className="grid">
              <div className="card cardWide">
                <div className="small">Loading dashboard…</div>
              </div>
            </div>
          )}

          {!err && summary && structure && (
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

              {filtered.length === 0 && (
                <div className="card cardWide">
                  <div className="small">
                    No questions matched this subcategory. (This usually means the Excel “Item Title” text differs slightly
                    from the JSON titles.)
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
