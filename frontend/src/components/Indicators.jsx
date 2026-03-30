// Indicators.jsx — clean market data indicator strip

import React, { useEffect, useState } from "react";
import { fetchHistory } from "../services/api";

function Indicators({ ticker }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchHistory(ticker);
        const last = res.prices.length - 1;
        setData({
          currentPrice: res.prices[last],
          prevPrice: res.prices[last - 1],
          volume: res.volumes[last],
          prevVolume: res.volumes[last - 1],
          weekHigh: Math.max(...res.prices.slice(-5)),
          weekLow: Math.min(...res.prices.slice(-5)),
          dataPoints: res.count,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (ticker) load();
  }, [ticker]);

  if (loading || !data) return null;

  const dayChange = data.currentPrice - data.prevPrice;
  const dayChangePct = ((dayChange / data.prevPrice) * 100).toFixed(2);
  const isUp = dayChange >= 0;
  const volChange = (
    ((data.volume - data.prevVolume) / data.prevVolume) *
    100
  ).toFixed(1);
  const volUp = parseFloat(volChange) >= 0;

  const metrics = [
    {
      label: "Current Price",
      value: `$${data.currentPrice.toFixed(2)}`,
      sub: `${isUp ? "+" : ""}${dayChange.toFixed(2)} today`,
      color: isUp ? "#10B981" : "#EF4444",
      bg: isUp ? "#F0FDF4" : "#FFF5F5",
      border: isUp ? "#BBF7D0" : "#FED7D7",
      icon: isUp ? "↑" : "↓",
    },
    {
      label: "Day Change",
      value: `${isUp ? "+" : ""}${dayChangePct}%`,
      sub: "vs yesterday's close",
      color: isUp ? "#10B981" : "#EF4444",
      bg: isUp ? "#F0FDF4" : "#FFF5F5",
      border: isUp ? "#BBF7D0" : "#FED7D7",
      icon: "%",
    },
    {
      label: "Volume",
      value:
        data.volume >= 1_000_000
          ? `${(data.volume / 1_000_000).toFixed(1)}M`
          : `${(data.volume / 1_000).toFixed(0)}K`,
      sub: `${volUp ? "+" : ""}${volChange}% vs yesterday`,
      color: "#6366F1",
      bg: "#EEF2FF",
      border: "#C7D2FE",
      icon: "≋",
    },
    {
      label: "5-Day High",
      value: `$${data.weekHigh.toFixed(2)}`,
      sub: "recent peak price",
      color: "#F59E0B",
      bg: "#FFFBEB",
      border: "#FDE68A",
      icon: "▲",
    },
    {
      label: "5-Day Low",
      value: `$${data.weekLow.toFixed(2)}`,
      sub: "recent floor price",
      color: "#8B5CF6",
      bg: "#F5F3FF",
      border: "#DDD6FE",
      icon: "▼",
    },
    {
      label: "Data Points",
      value: data.dataPoints.toLocaleString(),
      sub: "days of training data",
      color: "#64748B",
      bg: "#F8F7F4",
      border: "rgba(0,0,0,0.08)",
      icon: "⬡",
    },
  ];

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>
          Market Snapshot
        </h3>
        <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
          {ticker} · Real-time market data
        </p>
      </div>

      {/* Metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 10,
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              background: m.bg,
              border: `1px solid ${m.border}`,
              borderRadius: 14,
              padding: "14px 14px",
              animation: `fadeUp 0.4s ${i * 0.06}s ease both`,
            }}
          >
            {/* Icon */}
            <div
              style={{
                fontSize: 16,
                color: m.color,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {m.icon}
            </div>

            {/* Value */}
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: m.color,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "-0.3px",
                marginBottom: 4,
              }}
            >
              {m.value}
            </div>

            {/* Label */}
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#1a1a2e",
                marginBottom: 2,
              }}
            >
              {m.label}
            </div>

            {/* Sub */}
            <div style={{ fontSize: 10, color: "#94A3B8" }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 14,
          padding: "10px 14px",
          background: "#F8F7F4",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "#94A3B8" }}>
          ⚠️ StockSense is a portfolio project — not financial advice. Do not
          use for real trading decisions.
        </span>
      </div>
    </div>
  );
}

export default Indicators;
