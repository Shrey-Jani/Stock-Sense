// TopMovers.jsx — clean top movers card with DSA min-heap under the hood

import React, { useEffect, useState } from "react";
import { fetchMovers } from "../services/api";

function TopMovers() {
  const [movers, setMovers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("gainers"); // "gainers" or "losers"

  useEffect(() => {
    fetchMovers()
      .then(setMovers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const StockRow = ({ stock, index }) => {
    const isUp = stock.change_pct >= 0;
    const color = isUp ? "#10B981" : "#EF4444";
    const bgColor = isUp ? "#F0FDF4" : "#FFF5F5";
    const border = isUp ? "#BBF7D0" : "#FED7D7";

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: index < 4 ? "1px solid rgba(0,0,0,0.05)" : "none",
          animation: `fadeUp 0.3s ${index * 0.05}s ease both`,
        }}
      >
        {/* Rank + ticker */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 22,
              height: 22,
              background: "#F4F3EF",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 700,
              color: "#94A3B8",
            }}
          >
            {index + 1}
          </span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
              {stock.ticker}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#94A3B8",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              ${stock.price}
            </div>
          </div>
        </div>

        {/* Change badge */}
        <div
          style={{
            background: bgColor,
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: "4px 10px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            color: color,
          }}
        >
          {isUp ? "+" : ""}
          {stock.change_pct}%
        </div>
      </div>
    );
  };

  return (
    <div className="card" style={{ padding: 24, height: "100%" }}>
      {/* ── HEADER ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>
            Top Movers
          </h3>
          <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
            Powered by min-heap — O(n log k)
          </p>
        </div>

        {/* Gainers / Losers toggle */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "#F4F3EF",
            borderRadius: 10,
            padding: 4,
          }}
        >
          {["gainers", "losers"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                border: "none",
                fontSize: 12,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                background: tab === t ? "#fff" : "transparent",
                color:
                  tab === t
                    ? t === "gainers"
                      ? "#10B981"
                      : "#EF4444"
                    : "#94A3B8",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s ease",
                textTransform: "capitalize",
              }}
            >
              {t === "gainers" ? "↑ Gainers" : "↓ Losers"}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "#94A3B8",
            fontSize: 13,
          }}
        >
          Loading movers...
        </div>
      ) : movers ? (
        <div>
          {(tab === "gainers" ? movers.gainers : movers.losers).map(
            (stock, i) => (
              <StockRow key={stock.ticker} stock={stock} index={i} />
            ),
          )}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "#94A3B8",
            fontSize: 13,
            padding: "40px 0",
          }}
        >
          Could not load movers
        </div>
      )}
    </div>
  );
}

export default TopMovers;
