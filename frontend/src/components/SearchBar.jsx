// SearchBar.jsx — modern floating search bar

import React, { useEffect, useState } from "react";
import { fetchAvailableTickers, fetchPrediction } from "../services/api";

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

// Mapping of company names to ticker symbols
const COMPANY_TO_TICKER = {
  apple: "AAPL",
  tesla: "TSLA",
  google: "GOOGL",
  alphabet: "GOOGL",
  microsoft: "MSFT",
  amazon: "AMZN",
  nvidia: "NVDA",
  meta: "META",
  facebook: "META",
  netflix: "NFLX",
  nvidia: "NVDA",
  amd: "AMD",
  intel: "INTC",
  ibm: "IBM",
  oracle: "ORCL",
  salesforce: "CRM",
  adobe: "ADBE",
  stripe: "STRP",
  paypal: "PYPL",
  square: "SQ",
  uber: "UBER",
  lyft: "LYFT",
  airbnb: "ABNB",
  zoom: "ZM",
  slack: "WORK",
  gitlab: "GTLB",
  snapchat: "SNAP",
  pinterest: "PINS",
  twitter: "TWTR",
  x: "TWTR",
  tiktok: "MODG",
  discord: "DCRD",
  roblox: "RBLX",

  // Add all ticker symbols as-is for convenience
  aapl: "AAPL",
  tsla: "TSLA",
  googl: "GOOGL",
  msft: "MSFT",
  amzn: "AMZN",
  nvda: "NVDA",
  meta: "META",
  nflx: "NFLX",
};

function SearchBar({ onDataFetched, onError, setLoading }) {
  const [ticker, setTicker] = useState("");
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const data = await fetchAvailableTickers();
        if (Array.isArray(data?.tickers) && data.tickers.length > 0) {
          setSuggestions(data.tickers.slice(0, 8));
        }
      } catch (_error) {
        // Keep static fallback suggestions if API is unavailable.
      }
    };

    loadSuggestions();
  }, []);

  // Convert company name to ticker symbol
  const nameToTicker = (input) => {
    const uppercase = input.toUpperCase();
    const lowercase = input.toLowerCase();

    // Check if it's already a ticker symbol (all caps, 1-4 letters)
    if (/^[A-Z]{1,5}$/.test(uppercase)) {
      return uppercase;
    }

    // Check if it's a company name
    if (COMPANY_TO_TICKER[lowercase]) {
      return COMPANY_TO_TICKER[lowercase];
    }

    // If not found, return uppercased input as fallback
    return uppercase;
  };

  const handleSearch = async (val) => {
    const input = (val || ticker).trim();
    if (!input) return;

    const t = nameToTicker(input);

    try {
      setLoading(true);
      setFocused(false);
      const data = await fetchPrediction(t);
      onDataFetched(data);
    } catch (e) {
      onError(
        `Could not fetch data for "${input}". Please check the company name or ticker symbol.`,
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
          onChange={(e) => setTicker(e.target.value)}
          onKeyPress={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search by name or ticker — Apple, Tesla, Google..."
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
        {suggestions.map((symbol) => (
          <button
            key={symbol}
            onClick={() => {
              setTicker(symbol);
              handleSearch(symbol);
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
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
