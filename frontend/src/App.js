// App.js — StockSense modern light theme

import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import PredictionCard from "./components/PredictionCard";
import StockChart from "./components/StockChart";
import TopMovers from "./components/TopMovers";
import Indicators from "./components/Indicators";
import LiveChart from "./components/LiveChart";
// ── Global styles injected once at app root ──────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Sora', sans-serif;
    background: #F4F3EF;
    color: #1a1a2e;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F4F3EF; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  .fade-up { animation: fadeUp 0.5s ease forwards; }
  .fade-up-1 { animation: fadeUp 0.5s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.5s 0.12s ease both; }
  .fade-up-3 { animation: fadeUp 0.5s 0.20s ease both; }
  .fade-up-4 { animation: fadeUp 0.5s 0.28s ease both; }

  .card {
    background: #FFFFFF;
    border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s ease;
  }
  .card:hover {
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08);
  }
`;

function App() {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDataFetched = (data) => {
    setStockData(data);
    setError(null);
  };
  const handleError = (msg) => {
    setError(msg);
    setStockData(null);
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {/* ── HEADER ─────────────────────────────────────── */}
        <header style={{ marginBottom: 40 }} className="fade-up">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <div>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    lineHeight: 1,
                  }}
                >
                  StockSense
                </h1>
                <p
                  style={{
                    fontSize: 11,
                    color: "#94A3B8",
                    marginTop: 2,
                    fontWeight: 400,
                  }}
                >
                  AI-powered predictions
                </p>
              </div>
            </div>

            {/* Status pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 99,
                padding: "6px 12px",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22C55E",
                  boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
                }}
              />
              <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 500 }}>
                Live market data
              </span>
            </div>
          </div>
        </header>

        {/* ── SEARCH BAR ─────────────────────────────────── */}
        <div className="fade-up-1">
          <SearchBar
            onDataFetched={handleDataFetched}
            onError={handleError}
            setLoading={setLoading}
          />
        </div>

        {/* ── LOADING ────────────────────────────────────── */}
        {loading && (
          <div
            style={{ textAlign: "center", marginTop: 64 }}
            className="fade-up"
          >
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                background: "#fff",
                borderRadius: 20,
                padding: "32px 48px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              }}
            >
              {/* Animated bars */}
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "flex-end",
                  height: 32,
                }}
              >
                {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: [20, 28, 32, 28, 20][i],
                      background: "#6366F1",
                      borderRadius: 99,
                      animation: `pulse 1s ${delay}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: "#1a1a2e" }}>
                  Running AI models...
                </p>
                <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
                  First run may take 2–3 minutes to train
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── ERROR ──────────────────────────────────────── */}
        {error && (
          <div
            className="fade-up"
            style={{
              marginTop: 24,
              background: "#FFF5F5",
              border: "1px solid #FED7D7",
              borderRadius: 14,
              padding: "14px 18px",
              color: "#C53030",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* ── DASHBOARD ──────────────────────────────────── */}
        {stockData && !loading && (
          <div style={{ marginTop: 28 }}>
            {/* Row 1: Prediction + Top Movers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div className="fade-up-1">
                <PredictionCard data={stockData} />
              </div>
              <div className="fade-up-2">
                <TopMovers />
              </div>
            </div>

            {/* Row 2: Chart */}
            <div className="fade-up-3" style={{ marginBottom: 16 }}>
              <StockChart data={stockData} />
            </div>

            {/* Row 3: Indicators */}
            <div className="fade-up-4">
              <Indicators ticker={stockData.ticker} />
            </div>

            {/* ── LIVE CHART ───────────────────────────── */}
            <div className="fade-up" style={{ marginTop: 16 }}>
              <LiveChart ticker={stockData.ticker} />
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ────────────────────────────────── */}
        {!stockData && !loading && !error && (
          <div
            className="fade-up"
            style={{ textAlign: "center", marginTop: 80 }}
          >
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e" }}>
                Search any stock to get started
              </p>
              <p style={{ fontSize: 13, color: "#94A3B8" }}>
                Try AAPL · TSLA · GOOGL · MSFT · AMZN
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
