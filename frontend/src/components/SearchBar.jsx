import React, { useState } from "react";
import { fetchPrediction } from "../services/api";

function searchBar({ onDataFetched, onError, setLoading }) {
  const [ticker, setTicker] = useState("");

  const handleSearch = async () => {
    if (!ticker.trim()) return;

    try {
      setLoading(true);

      const data = await fetchPrediction(ticker.trim().toUpperCase());
      onDataFetched(data);
    } catch (error) {
      onError(`Failed to fetch data for "${ticker}"`);
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "8px",
      }}
    >
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        onKeyPress={handleKeyPress}
        placeholder="Enter Stock Ticker here"
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "10px",
          border: "1px solid #334155",
          backgroundColor: "#1e293b",
          color: "#f1f5f9",
          width: "300px",
          outline: "none",
        }}
      />

      <button
        onClick={handleSearch}
        style={{
          padding: "12px 28px",
          fontSize: "16px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#38bdf8",
          color: "#0f172a",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </div>
  );
}

export default searchBar;
