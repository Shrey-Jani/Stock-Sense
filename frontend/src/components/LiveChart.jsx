// LiveChart.jsx
// A fully live interactive chart showing:
// - Closing price (indigo line)
// - MA20 (amber dashed line)
// - MA50 (red dashed line)
// - Crossover signal markers (green/red dots)
// All data comes live from the FastAPI /history endpoint
// Built with Recharts — fully interactive, hover tooltips, zoom range

import React, { useEffect, useState, useCallback } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
} from "recharts";
import { fetchHistory } from "../services/api";

// ── Range options ─────────────────────────────────────────────────────
const RANGES = [
  { label: "1M", months: 1 },
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "1Y", months: 12 },
];

// ── Custom tooltip ────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const get = (key) => {
    const found = payload.find((p) => p.dataKey === key);
    return found ? found.value : null;
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        fontFamily: "'Sora', sans-serif",
        minWidth: 160,
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "#94A3B8",
          marginBottom: 8,
          fontWeight: 500,
        }}
      >
        {label}
      </p>

      {get("price") && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 12, color: "#6366F1", fontWeight: 600 }}>
            Close
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: "#1a1a2e",
            }}
          >
            ${get("price")?.toFixed(2)}
          </span>
        </div>
      )}

      {get("ma20") && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>
            MA20
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: "#1a1a2e",
            }}
          >
            ${get("ma20")?.toFixed(2)}
          </span>
        </div>
      )}

      {get("ma50") && (
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
        >
          <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 600 }}>
            MA50
          </span>
          <span
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: "#1a1a2e",
            }}
          >
            ${get("ma50")?.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

// ── Custom legend ─────────────────────────────────────────────────────
const CustomLegend = ({ visibility, onToggle }) => {
  const items = [
    { key: "price", label: "Close Price", color: "#6366F1", dash: false },
    { key: "ma20", label: "MA20", color: "#F59E0B", dash: true },
    { key: "ma50", label: "MA50", color: "#EF4444", dash: true },
  ];

  return (
    <div
      style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onToggle(item.key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: visibility[item.key] ? "#F8F7F4" : "#fff",
            border: `1px solid ${visibility[item.key] ? "rgba(0,0,0,0.08)" : "#E2E8F0"}`,
            borderRadius: 99,
            padding: "5px 12px",
            cursor: "pointer",
            opacity: visibility[item.key] ? 1 : 0.4,
            transition: "all 0.15s ease",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {/* Line preview */}
          <svg width="20" height="10">
            <line
              x1="0"
              y1="5"
              x2="20"
              y2="5"
              stroke={item.color}
              strokeWidth="2"
              strokeDasharray={item.dash ? "4 2" : "none"}
            />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>
            {item.label}
          </span>
        </button>
      ))}

      {/* Crossover legend */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 12px",
          background: "#F8F7F4",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 99,
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#10B981",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#EF4444",
            }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>
          MA Crossover signals
        </span>
      </div>
    </div>
  );
};

// ── Main LiveChart component ──────────────────────────────────────────
function LiveChart({ ticker }) {
  const [chartData, setChartData] = useState([]);
  const [crossovers, setCrossovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("3M");
  const [visibility, setVisibility] = useState({
    price: true,
    ma20: true,
    ma50: true,
  });
  const [stats, setStats] = useState(null);

  // Toggle a line on/off
  const handleToggle = useCallback((key) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // Calculate from_date based on selected range
        const selectedRange = RANGES.find((r) => r.label === range);
        const fromDate = new Date();
        fromDate.setMonth(fromDate.getMonth() - selectedRange.months);
        const fromDateStr = fromDate.toISOString().split("T")[0];

        // Fetch history with MA values from our updated API
        const res = await fetchHistory(ticker, fromDateStr);

        // Build chart data — one object per day
        const data = res.dates.map((date, i) => ({
          date,
          price: res.prices[i],
          ma20: res.ma20[i],
          ma50: res.ma50[i],
        }));

        setChartData(data);

        // ── Detect MA crossover signals ───────────────────────────────
        // DSA: sliding window — check each consecutive pair of days
        // If MA20 crosses MA50, record it as a signal dot on the chart
        const signals = [];
        for (let i = 1; i < data.length; i++) {
          const prev = data[i - 1];
          const curr = data[i];

          if (!prev.ma20 || !prev.ma50 || !curr.ma20 || !curr.ma50) continue;

          // Bullish: MA20 just crossed ABOVE MA50
          if (prev.ma20 <= prev.ma50 && curr.ma20 > curr.ma50) {
            signals.push({
              date: curr.date,
              value: curr.price,
              type: "bullish",
            });
          }

          // Bearish: MA20 just crossed BELOW MA50
          if (prev.ma20 >= prev.ma50 && curr.ma20 < curr.ma50) {
            signals.push({
              date: curr.date,
              value: curr.price,
              type: "bearish",
            });
          }
        }
        setCrossovers(signals);

        // ── Calculate quick stats ─────────────────────────────────────
        const prices = res.prices.filter(Boolean);
        const latestMA20 = res.ma20.filter(Boolean).at(-1);
        const latestMA50 = res.ma50.filter(Boolean).at(-1);
        const latestRSI = res.rsi?.filter(Boolean).at(-1);

        setStats({
          high: Math.max(...prices).toFixed(2),
          low: Math.min(...prices).toFixed(2),
          ma20: latestMA20?.toFixed(2),
          ma50: latestMA50?.toFixed(2),
          rsi: latestRSI?.toFixed(1),
          trend: latestMA20 > latestMA50 ? "Bullish" : "Bearish",
          signals: signals.length,
        });
      } catch (e) {
        console.error("LiveChart failed:", e);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) load();
  }, [ticker, range]);

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* ── HEADER ───────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>
            Live Price Chart
          </h3>
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            {ticker} · Moving averages + crossover signals · Click legend to
            toggle lines
          </p>
        </div>

        {/* Range selector */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#F4F3EF",
            borderRadius: 10,
            padding: 4,
          }}
        >
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.label)}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                border: "none",
                fontSize: 12,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                background: range === r.label ? "#fff" : "transparent",
                color: range === r.label ? "#6366F1" : "#94A3B8",
                boxShadow:
                  range === r.label ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ──────────────────────────────── */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Period High", value: `$${stats.high}`, color: "#10B981" },
            { label: "Period Low", value: `$${stats.low}`, color: "#EF4444" },
            { label: "MA20", value: `$${stats.ma20}`, color: "#F59E0B" },
            { label: "MA50", value: `$${stats.ma50}`, color: "#EF4444" },
            {
              label: "RSI",
              value: stats.rsi,
              color:
                stats.rsi > 70
                  ? "#EF4444"
                  : stats.rsi < 30
                    ? "#10B981"
                    : "#6366F1",
            },
            {
              label: "Trend",
              value: stats.trend,
              color: stats.trend === "Bullish" ? "#10B981" : "#EF4444",
            },
            { label: "Crossovers", value: stats.signals, color: "#8B5CF6" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#F8F7F4",
                borderRadius: 10,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: s.color,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CUSTOM LEGEND ────────────────────────────── */}
      <CustomLegend visibility={visibility} onToggle={handleToggle} />

      {/* ── CHART ────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            height: 360,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            fontSize: 13,
            gap: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#6366F1",
              animation: "pulse 1s ease-in-out infinite",
            }}
          />
          Loading live data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{
                fill: "#94A3B8",
                fontSize: 11,
                fontFamily: "'Sora', sans-serif",
              }}
              tickFormatter={(v, i) => {
                const step = Math.ceil(chartData.length / 7);
                return i % step === 0 ? v.slice(5) : "";
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: "#94A3B8",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
              }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              width={58}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* ── Close price line ───────────────────── */}
            {visibility.price && (
              <Line
                type="monotone"
                dataKey="price"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
                connectNulls={true}
                activeDot={{
                  r: 5,
                  fill: "#6366F1",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            )}

            {/* ── MA20 line ──────────────────────────── */}
            {visibility.ma20 && (
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#F59E0B"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                connectNulls={true}
                activeDot={{
                  r: 4,
                  fill: "#F59E0B",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            )}

            {/* ── MA50 line ──────────────────────────── */}
            {visibility.ma50 && (
              <Line
                type="monotone"
                dataKey="ma50"
                stroke="#EF4444"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                connectNulls={true}
                activeDot={{
                  r: 4,
                  fill: "#EF4444",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            )}

            {/* ── Bullish crossover dots ─────────────── */}
            {crossovers
              .filter((c) => c.type === "bullish")
              .map((c, i) => (
                <ReferenceLine
                  key={`bull-${i}`}
                  x={c.date}
                  stroke="#10B981"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              ))}

            {/* ── Bearish crossover dots ─────────────── */}
            {crossovers
              .filter((c) => c.type === "bearish")
              .map((c, i) => (
                <ReferenceLine
                  key={`bear-${i}`}
                  x={c.date}
                  stroke="#EF4444"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              ))}
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* ── CROSSOVER SUMMARY ────────────────────────── */}
      {crossovers.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "#F8F7F4",
            borderRadius: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "#94A3B8", alignSelf: "center" }}>
            Crossover signals:
          </span>
          {crossovers.slice(-5).map((c, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 99,
                background: c.type === "bullish" ? "#F0FDF4" : "#FFF5F5",
                color: c.type === "bullish" ? "#10B981" : "#EF4444",
                border: `1px solid ${c.type === "bullish" ? "#BBF7D0" : "#FED7D7"}`,
              }}
            >
              {c.type === "bullish" ? "↑" : "↓"} {c.date}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveChart;
