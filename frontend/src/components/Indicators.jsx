import React, { useEffect, useState } from "react";
import { fetchHistory } from "../services/api";

function Indicators({ ticker }) {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIndicators = async () => {
      try {
        setLoading(true);

        const data = await fetchHistory(ticker);

        const latestIndex = data.prices.length - 1;

        setIndicators({
          currentPrice: data.prices[latestIndex],
          prevPrice: data.prices[latestIndex - 1],
          volume: data.volumes[latestIndex],
          dataPoints: data.count,
        });
      } catch (err) {
        console.error("Failed to load indicators:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) loadIndicators();
  }, [ticker]);

  if (loading) return null;

  const dayChange = indicators.currentPrice - indicators.prevPrice;
  const dayChangePct = ((dayChange / indicators.prevPrice) * 100).toFixed(2);
  const isPositive = dayChange >= 0;

  const Badge = ({ label, value, color }) => (
    <div
      style={{
        backgroundColor: "#0f172a",
        borderRadius: "10px",
        padding: "16px",
        textAlign: "center",
        flex: 1,
      }}
    >
      <p
        style={{
          color: "#6478b",
          fontSize: "11px",
          marginBottom: "6px",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: color || "#f1f5f9",
          fontSize: "18px",
          fontWeight: "700",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: "1e293b",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #334155",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#94a3b8" }}>
        Market Data {ticker}{" "}
      </h3>

      {/* Grid of indicator badges */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Badge
          label="CURRENT PRICE"
          value={`$${indicators.currentPrice}`}
          color="#f1f5f9"
        />

        <Badge
          label="DAY CHANGE"
          value={`${isPositive ? "+" : ""}${dayChange.toFixed(2)} (${dayChangePct}%)`}
          color={isPositive ? "#4ade80" : "#f87171"}
        />

        <Badge
          label="VOLUME"
          value={indicators.volume.toLocaleString()}
          color="#78bfa"
        />
        <Badge
          label="DATA POINTS"
          value={indicators.dataPoints}
          color="#a78bfa"
        />
      </div>
    </div>
  );
}

export default Indicators;
