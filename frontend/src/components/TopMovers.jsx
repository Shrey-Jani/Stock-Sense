// TopMovers.jsx
// This component shows the top 5 gaining and top 5 losing stocks of the day.
// It calls the /movers endpoint which uses a Min-Heap under the hood (DSA!)

import React, { useEffect, useState } from "react";
import { fetchMovers } from "../services/api";

function TopMovers() {
  // movers holds the gainers and losers arrays from the API
  const [movers, setMovers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movers when the component first loads
  // useEffect with empty [] means run once on mount
  useEffect(() => {
    const loadMovers = async () => {
      try {
        const data = await fetchMovers();
        setMovers(data);
      } catch (err) {
        setError("Could not load top movers");
      } finally {
        setLoading(false);
      }
    };

    loadMovers();
  }, []); // empty array = run once when component mounts

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        Loading movers...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          padding: "24px",
          color: "#f87171",
        }}
      >
        {error}
      </div>
    );
  }

  // Helper function to render a single stock row
  const renderStockRow = (stock) => {
    const isGainer = stock.change_pct >= 0;
    const color = isGainer ? "#4ade80" : "#f87171";

    return (
      <div
        key={stock.ticker}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: "1px solid #1e293b",
        }}
      >
        {/* Ticker symbol */}
        <span style={{ fontWeight: "600", fontSize: "14px" }}>
          {stock.ticker}
        </span>

        {/* Current price */}
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          ${stock.price}
        </span>

        {/* Percentage change badge */}
        <span
          style={{
            backgroundColor: isGainer ? "#052e16" : "#450a0a",
            color: color,
            padding: "3px 8px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {isGainer ? "+" : ""}
          {stock.change_pct}%
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #334155",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#94a3b8" }}>
        Top Movers Today
      </h3>

      {/* ── TOP GAINERS ──────────────────────────── */}
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "11px",
            color: "#4ade80",
            fontWeight: "600",
            marginBottom: "8px",
            letterSpacing: "0.05em",
          }}
        >
          TOP GAINERS
        </p>
        {movers.gainers.map(renderStockRow)}
      </div>

      {/* ── TOP LOSERS ───────────────────────────── */}
      <div>
        <p
          style={{
            fontSize: "11px",
            color: "#f87171",
            fontWeight: "600",
            marginBottom: "8px",
            letterSpacing: "0.05em",
          }}
        >
          TOP LOSERS
        </p>
        {movers.losers.map(renderStockRow)}
      </div>
    </div>
  );
}

export default TopMovers;
