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
  "#E11D2E", // red (primary)
  "#111827", // near-black
  "#9CA3AF", // grey
  "#60A5FA", // blue
  "#F59E0B", // amber
  "#10B981", // green
];

function pct(v: number, total: number) {
  if (!total) return "0.0%";
  return ((v / total) * 100).toFixed(1) + "%";
}

const truncate = (s: string, n = 44) => {
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

  // Sort (safest if caller didn't)
  const sorted = [...series].sort((a, b) => b.value - a.value);

  // Video-style cards usually show a few categories; keep top 6 for the donut legend.
  // If there are many, switch to bars and show top 10.
  const isPie = sorted.length <= 6;
  const pieData = sorted.slice(0, 6);
  const barData = sorted.slice(0, 10);

  return (
    <section className="card">
      <header className="cardHeader">
        <h3 className="cardTitle" title={title}>
          {title}
        </h3>
      </header>

      <div className="cardContent">
        {isPie ? (
          <div className="cardGrid">
            {/* Chart (left) */}
            <div className="chartPane">
              <div className="chartBox">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={86}
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={3}
                      isAnimationActive={false}
                      // show values around donut (like the video)
                      labelLine
                      label={({ value }) => (value ? String(value) : "")}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={palette[i % palette.length]} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value: any, _name: any, item: any) => {
                        const full = item?.payload?.name ?? _name;
                        return [value, full];
                      }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legend (right) */}
            <div className="legendPane">
              <div className="legendList">
                {pieData.map((s, i) => (
                  <div className="legendRow" key={`${s.name}-${i}`}>
                    <div className="legendLeft">
                      <span
                        className="legendDot"
                        style={{ background: palette[i % palette.length] }}
                      />
                      <span className="legendLabel" title={s.name}>
                        {truncate(s.name, 52)}
                      </span>
                    </div>

                    <div className="legendRight">
                      <span className="legendPct">{pct(s.value, total)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="legendFooter">
                <span className="muted">Total responses</span>
                <b className="totalNumber">{total}</b>
              </div>
            </div>
          </div>
        ) : (
          <div className="cardGrid single">
            <div className="chartPane wide">
              <div className="chartBox tall">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ left: 24, right: 14, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={200}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => truncate(String(v), 34)}
                    />
                    <Tooltip
                      formatter={(value: any, _name: any, item: any) => {
                        const full = item?.payload?.name ?? _name;
                        return [value, full];
                      }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={palette[0]}
                      radius={[10, 10, 10, 10]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="legendFooter" style={{ marginTop: 10 }}>
                <span className="muted">Total responses</span>
                <b className="totalNumber">{total}</b>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
