import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import PredictionCard from "./components/PredictionCard";
import StockChart from "./components/StockChart";
import TopMovers from "./components/TopMovers";
import Indicators from "./components/Indicators";

function App() {
  const [stockData, setStockData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleDataFetched = (data) => {
    setStockData(data);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setStockData(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a", // dark navy background
        color: "#f1f5f9", // light text
        fontFamily: "sans-serif",
        padding: "24px",
      }}
    >
      {/* ── APP HEADER ───────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#38bdf8" }}>
          StockSense
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
          AI-powered stock prediction dashboard
        </p>
      </div>

      {/* ── SEARCH BAR ───────────────────────────── */}
      {/* User types a ticker here — triggers the API call */}
      <SearchBar
        onDataFetched={handleDataFetched}
        onError={handleError}
        setLoading={setLoading}
      />

      {/* LOADING STATE */}
      {loading && (
        <div
          style={{ textAlign: "center", marginTop: "40px", color: "#38bdf8" }}
        >
          <p style={{ fontSize: "16px" }}>
            Fetching data and running AI models...
          </p>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            First time may take 2-3 minutes to train the model
          </p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            color: "#f87171",
            backgroundColor: "#1e293b",
            padding: "16px",
            borderRadius: "12px",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {/* MAIN DASHBOARD */}
      {/* Only shows when we have real data from the API */}
      {stockData && !loading && (
        <div>
          {/* TOP ROW: Prediction card + Top movers ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            {/* Shows UP/DOWN prediction with confidence % */}
            <PredictionCard data={stockData} />

            {/* Shows top 5 gainers and losers of the day */}
            <TopMovers />
          </div>

          {/* ── MIDDLE ROW: Price chart ──────────────── */}
          {/* Shows historical price + 30 day forecast line */}
          <div style={{ marginTop: "16px" }}>
            <StockChart data={stockData} />
          </div>

          {/* ── BOTTOM ROW: Technical indicators ─────── */}
          {/* Shows RSI, MACD, MA20, MA50 as readable badges */}
          <div style={{ marginTop: "16px" }}>
            <Indicators ticker={stockData.ticker} />
          </div>
        </div>
      )}

      {/*  EMPTY STATE */}
      {/* Shows before any ticker is searched */}
      {!stockData && !loading && !error && (
        <div
          style={{ textAlign: "center", marginTop: "80px", color: "#475569" }}
        >
          <p style={{ fontSize: "18px" }}>
            Search any stock ticker above to get started
          </p>
          <p style={{ fontSize: "13px", marginTop: "8px" }}>
            Try AAPL, TSLA, GOOGL, MSFT or AMZN
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
