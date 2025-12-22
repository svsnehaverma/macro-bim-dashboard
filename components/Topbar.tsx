"use client";

export function Topbar(props: {
  title: string;
  breadcrumb: string;
  countries: string[];
  country: string;
  onCountry: (c: string) => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  const { title, breadcrumb, countries, country, onCountry, search, onSearch } = props;

  return (
    <div className="topbar">
      <div className="hgroup">
        <div className="breadcrumb">{breadcrumb}</div>
        <h2>{title}</h2>
        <p>Questions aggregated from the selected dataset</p>
      </div>

      <div className="controls">
        <div className="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M16.2 16.2 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search…"
            aria-label="Search questions"
          />
        </div>

        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, margin: "0 0 4px 6px" }}>
            Filter by
          </div>
          <select className="select" value={country} onChange={(e) => onCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
