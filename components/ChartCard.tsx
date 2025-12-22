"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export type SeriesPoint = { name: string; value: number };

// Keep your palette
const palette = ["#ef4444", "#111827", "#60a5fa", "#9ca3af", "#f97316", "#10b981"];

function pct(v: number, total: number) {
  if (!total) return "0%";
  return ((v / total) * 100).toFixed(1) + "%";
}

// NEW: truncate helper to prevent overlaps in axis/labels
const truncate = (s: string, n = 28) => {
  const str = String(s ?? "");
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
};

export function ChartCard(props: {
  title: string;
  itemId?: string;
  total: number;
  series: SeriesPoint[];
}) {
  const { title, total, series } = props;

  // If many categories, use bar chart. Also limit to top N for neatness.
  const top = series.slice(0, 10);
  const isPie = series.length <= 6;

  return (
    <div className="card">
      {/* Keep title but clamp via CSS in globals.css */}
      <div className="cardTitle" title={title}>
        {title}
      </div>

      <div className="cardBody">
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            {isPie ? (
              <PieChart>
                <Pie
                  data={top}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={92}
                  paddingAngle={2}
                  stroke="white"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {top.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>

                {/* Tooltip shows FULL label (not truncated) */}
                <Tooltip
                  formatter={(value: any, _name: any, item: any) => {
                    const full = item?.payload?.name ?? _name;
                    return [value, full];
                  }}
                />
              </PieChart>
            ) : (
              <BarChart
                data={top}
                layout="vertical"
                margin={{ left: 24, right: 10, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={170}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => truncate(String(v), 28)}
                />
                <Tooltip
                  formatter={(value: any, _name: any, item: any) => {
                    const full = item?.payload?.name ?? _name;
                    return [value, full];
                  }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 8, 8]} isAnimationActive={false} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Neater breakdown list (still shows full labels via title hover) */}
        <div className="legend">
          {top.map((s, i) => (
            <div
              key={s.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                padding: "4px 0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: isPie ? palette[i % palette.length] : "#ef4444",
                    flex: "0 0 auto",
                  }}
                />
                <span
                  title={s.name} // full text on hover
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 230,
                  }}
                >
                  {s.name}
                </span>
              </div>

              <div style={{ display: "flex", gap: 12, color: "#111827", fontWeight: 700 }}>
                <span style={{ minWidth: 38, textAlign: "right" }}>{s.value}</span>
                <span style={{ minWidth: 54, textAlign: "right", color: "#6b7280", fontWeight: 600 }}>
                  {pct(s.value, total)}
                </span>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 12 }}>
            Total responses: <b style={{ color: "#111827" }}>{total}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
