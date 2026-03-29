import React from "react";

function PredictionCard({ data }) {
  const {
    ticker,
    current_price,
    price_change,
    price_change_pct,
    direction,
    confidence,
    forecast,
  } = data;

  const directionColor = direction === "UP" ? "#4ade80" : "#f87171";

  const directionArrow = direction === "UP" ? "▲" : "▼";

  const changeColor = price_change >= 0 ? "#4ade80" : "#f87171";

  const forecastPrice = forecast[forecast.length - 1];

  const forecastChange = (forecastPrice - current_price).toFixed(2);
  const forecastPct = ((forecastChange / current_price) * 100).toFixed(2);

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #334155",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0" }}>
          {ticker}
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <span style={{ fontSize: "36px", fontWeight: "700" }}>
            ${current_price}
          </span>
          <span style={{ fontSize: "14px", color: changeColor }}>
            {price_change >= 0 ? "+" : ""}
            {price_change} ({price_change_pct}%)
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>
          TOMORROW'S PREDICTION
        </p>
        <div style={{ fontSize: "48px", color: directionColor }}>
          {directionArrow}
        </div>
        <p
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: directionColor,
            margin: "4px 0",
          }}
        >
          {direction}
        </p>
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>
          Confidence:{" "}
          <span style={{ color: "#f1f5f9", fontWeight: "600" }}>
            {confidence}%
          </span>
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#0f172a",
          borderRadius: "12px",
          padding: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>
          30-DAY FORECAST
        </p>
        <p style={{ fontSize: "24px", fontWeight: "700" }}>${forecastPrice}</p>
        <p
          style={{
            fontSize: "13px",
            color: forecastChange >= 0 ? "#4ade80" : "#f87171",
          }}
        >
          {forecastChange >= 0 ? "+" : ""}
          {forecastChange} ({forecastPct}%) over 30 days
        </p>
      </div>
    </div>
  );
}
