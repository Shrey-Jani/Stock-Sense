// SearchBar.jsx — modern floating search bar

import React, { useState } from "react";
import { fetchPrediction } from "../services/api";

const SUGGESTIONS = [
  "AAPL",
  "TSLA",
  "GOOGL",
  "MSFT",
  "AMZN",
  "NVDA",
  "META",
  "NFLX",
];

function SearchBar({ onDataFetched, onError, setLoading }) {
  const [ticker, setTicker] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSearch = async (val) => {
    const t = (val || ticker).trim().toUpperCase();
    if (!t) return;
    try {
      setLoading(true);
      setFocused(false);
      const data = await fetchPrediction(t);
      onDataFetched(data);
    } catch (e) {
      onError(
        `Could not fetch data for "${t}". Please check the ticker symbol.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{ marginBottom: 8 }}>
      {/* Main search row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          background: "#fff",
          borderRadius: 16,
          padding: 8,
          border: focused
            ? "1.5px solid #6366F1"
            : "1.5px solid rgba(0,0,0,0.08)",
          boxShadow: focused
            ? "0 0 0 4px rgba(99,102,241,0.1), 0 8px 24px rgba(0,0,0,0.06)"
            : "0 2px 8px rgba(0,0,0,0.04)",
          transition: "all 0.2s ease",
        }}
      >
        {/* Search icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
            color: "#94A3B8",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyPress={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Enter ticker symbol — AAPL, TSLA, GOOGL..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 15,
            fontFamily: "'Sora', sans-serif",
            fontWeight: 500,
            color: "#1a1a2e",
            background: "transparent",
            letterSpacing: "0.5px",
          }}
        />

        {/* Search button */}
        <button
          onClick={() => handleSearch()}
          style={{
            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 24px",
            fontSize: 14,
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 6px 16px rgba(99,102,241,0.45)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(99,102,241,0.35)";
          }}
        >
          Analyze
        </button>
      </div>

      {/* Quick suggestion pills */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 10,
          flexWrap: "wrap",
          paddingLeft: 4,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#94A3B8",
            alignSelf: "center",
            marginRight: 2,
          }}
        >
          Try:
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setTicker(s);
              handleSearch(s);
            }}
            style={{
              background: "#F8F7F4",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 99,
              padding: "4px 12px",
              fontSize: 12,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 500,
              color: "#64748B",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#EEF2FF";
              e.target.style.color = "#6366F1";
              e.target.style.borderColor = "#C7D2FE";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#F8F7F4";
              e.target.style.color = "#64748B";
              e.target.style.borderColor = "rgba(0,0,0,0.08)";
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
