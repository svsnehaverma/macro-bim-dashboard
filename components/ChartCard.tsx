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

const palette = [
  "#ef4444",
  "#111827",
  "#60a5fa",
  "#9ca3af",
  "#f97316",
  "#10b981",
  "#a78bfa",
  "#06b6d4",
];

const truncate = (s: string, n = 34) => {
  const str = String(s ?? "").trim();
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
};

function pct(v: number, total: number) {
  if (!total) return "0%";
  return ((v / total) * 100).toFixed(1) + "%";
}

export function ChartCard(props: {
  title: string;
  itemId?: string;
  total: number;
  series: SeriesPoint[];
}) {
  const { title, itemId, total, series } = props;

  const isPie = series.length <= 6;
  const top = series.slice(0, 10);
  const hidden = Math.max(0, series.length - top.length);

  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardTitle" title={title}>
          {title}
        </div>
        <div className="cardMeta">
          {itemId ? <span className="pill">ID: {itemId}</span> : null}
          <span className="pill">Total: {total}</span>
          <span className="pill">Options: {series.length}</span>
        </div>
      </div>

      <div className="cardBody">
        <div className="chartWrap">
          <ResponsiveContainer width="100%" height="100%">
            {isPie ? (
              <PieChart>
                <Pie
                  data={top}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {top.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
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
                margin={{ left: 28, right: 12, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={190}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => truncate(String(v), 32)}
                />
                <Tooltip
                  formatter={(value: any, _name: any, item: any) => {
                    const full = item?.payload?.name ?? _name;
                    return [value, full];
                  }}
                />
                <Bar dataKey="value" fill="#ef4444" radius={[10, 10, 10, 10]} isAnimationActive={false} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="legend">
          {top.map((s, i) => (
            <div key={s.name} className="legendRow">
              <div className="legendLeft">
                <span className="dot" style={{ background: isPie ? palette[i % palette.length] : "#ef4444" }} />
                <span className="legendLabel" title={s.name}>
                  {s.name}
                </span>
              </div>
              <div className="legendRight">
                <span className="legendValue">{s.value}</span>
                <span className="legendPct">{pct(s.value, total)}</span>
              </div>
            </div>
          ))}

          {hidden > 0 ? <div className="legendNote">Showing top {top.length}. Hidden: {hidden} options.</div> : null}
        </div>
      </div>
    </div>
  );
}
