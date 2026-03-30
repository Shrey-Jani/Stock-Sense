// StockChart.jsx — clean modern chart with forecast overlay

import React, { useEffect, useState } from "react";
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
} from "recharts";
import { fetchHistory } from "../services/api";

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const actual = payload.find((p) => p.dataKey === "actual");
  const forecast = payload.find((p) => p.dataKey === "forecast");

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>{label}</p>
      {actual && actual.value && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "#6366F1" }}>
          Actual:{" "}
          <span style={{ fontFamily: "'DM Mono', monospace" }}>
            ${actual.value.toFixed(2)}
          </span>
        </p>
      )}
      {forecast && forecast.value && (
        <p style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>
          Forecast:{" "}
          <span style={{ fontFamily: "'DM Mono', monospace" }}>
            ${forecast.value.toFixed(2)}
          </span>
        </p>
      )}
    </div>
  );
};

function StockChart({ data }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("6M"); // 1M, 3M, 6M, 1Y

  const rangeOptions = ["1M", "3M", "6M", "1Y"];

  const getMonthsBack = (r) => ({ "1M": 1, "3M": 3, "6M": 6, "1Y": 12 })[r];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const d = new Date();
        d.setMonth(d.getMonth() - getMonthsBack(range));
        const fromDate = d.toISOString().split("T")[0];

        const historyData = await fetchHistory(data.ticker, fromDate);

        const historical = historyData.dates.map((date, i) => ({
          date,
          actual: historyData.prices[i],
          forecast: null,
        }));

        const forecasted = data.forecast.map((price, i) => {
          const fd = new Date();
          fd.setDate(fd.getDate() + i + 1);
          return {
            date: fd.toISOString().split("T")[0],
            actual: null,
            forecast: price,
          };
        });

        setChartData([...historical, ...forecasted]);
      } catch (e) {
        console.error("Chart load failed:", e);
      } finally {
        setLoading(false);
      }
    };

    if (data.ticker) load();
  }, [data.ticker, range]);

  // Find where forecast starts (for reference line)
  const forecastStartDate = data.forecast.length
    ? new Date().toISOString().split("T")[0]
    : null;

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* ── CHART HEADER ───────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>
            Price Chart
          </h3>
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            Historical prices + 30-day LSTM forecast
          </p>
        </div>

        {/* Range selector pills */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#F4F3EF",
            borderRadius: 10,
            padding: 4,
          }}
        >
          {rangeOptions.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                border: "none",
                fontSize: 12,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                background: range === r ? "#fff" : "transparent",
                color: range === r ? "#6366F1" : "#94A3B8",
                boxShadow: range === r ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── LEGEND ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 24,
              height: 2,
              background: "#6366F1",
              borderRadius: 99,
            }}
          />
          <span style={{ fontSize: 12, color: "#64748B" }}>Actual price</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 24,
              height: 2,
              background:
                "repeating-linear-gradient(90deg, #F59E0B 0px, #F59E0B 6px, transparent 6px, transparent 10px)",
              borderRadius: 99,
            }}
          />
          <span style={{ fontSize: 12, color: "#64748B" }}>
            30-day forecast
          </span>
        </div>
      </div>

      {/* ── CHART ──────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            fontSize: 13,
          }}
        >
          Loading chart data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={chartData}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
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
              tickFormatter={(v, i) =>
                i % Math.ceil(chartData.length / 6) === 0 ? v.slice(5) : ""
              }
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
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Vertical line marking where forecast starts */}
            {forecastStartDate && (
              <ReferenceLine
                x={forecastStartDate}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "Today",
                  position: "top",
                  fontSize: 10,
                  fill: "#94A3B8",
                  fontFamily: "'Sora', sans-serif",
                }}
              />
            )}

            {/* Actual price line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              activeDot={{
                r: 4,
                fill: "#6366F1",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />

            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={false}
              connectNulls={false}
              activeDot={{
                r: 4,
                fill: "#F59E0B",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default StockChart;
