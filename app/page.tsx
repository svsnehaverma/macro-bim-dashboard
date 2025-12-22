"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
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

export default function Home() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [moduleKey, setModuleKey] = useState<string>("EL");
  const [country, setCountry] = useState<string>("ECU");
  const [search, setSearch] = useState<string>("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);

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

  const availableCountries = useMemo(() => {
    const mod = manifest?.modules?.find((m) => m.key === moduleKey);
    const list = mod?.countries?.length ? mod.countries : ["ECU"];
    return list;
  }, [manifest, moduleKey]);

  // keep selected country valid for module
  useEffect(() => {
    if (!availableCountries.includes(country)) {
      setCountry(availableCountries[0]);
    }
  }, [availableCountries, country]);

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

  const filtered = useMemo(() => {
    const qs = summary?.questions ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return qs;
    return qs.filter((x) => (x.title || "").toLowerCase().includes(q) || (x.itemId || "").toLowerCase().includes(q));
  }, [summary, search]);

  const modules = manifest?.modules?.map((m) => m.key) ?? ["EL", "OA", "PE"];

  const moduleLabel =
    manifest?.modules?.find((m) => m.key === moduleKey)?.label ??
    (moduleKey === "EL" ? "Education Landscape" : moduleKey === "OA" ? "Organisational Adoption" : moduleKey);

  return (
    <div className="shell">
      <Sidebar modules={modules} activeModule={moduleKey} onSelectModule={setModuleKey} />

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
                <h3>Couldn’t load data</h3>
              </div>
              <div className="small">{err}</div>
              <div className="small" style={{ marginTop: 10 }}>
                Tip: ensure the Excel file exists in <code>/data</code> and has an <b>Answers</b> sheet.
              </div>
            </div>
          </div>
        )}

        {!err && !summary && (
          <div className="grid">
            <div className="card cardWide">
              <div className="small">Loading summary…</div>
            </div>
          </div>
        )}

        {!err && summary && (
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
      </main>
    </div>
    </div>
  );
}
