// PredictionCard.jsx — premium prediction display card

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

  const isUp = direction === "UP";
  const upColor = "#10B981";
  const downColor = "#EF4444";
  const directionColor = isUp ? upColor : downColor;
  const changeBg = isUp ? "#F0FDF4" : "#FFF5F5";
  const changeBorder = isUp ? "#BBF7D0" : "#FED7D7";

  const forecastPrice = forecast[forecast.length - 1];
  const forecastChange = (forecastPrice - current_price).toFixed(2);
  const forecastPct = ((forecastChange / current_price) * 100).toFixed(2);
  const forecastUp = parseFloat(forecastChange) >= 0;

  return (
    <div className="card" style={{ padding: 24, height: "100%" }}>
      {/* ── HEADER: ticker + change badge ──────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              {ticker}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: "#EEF2FF",
                color: "#6366F1",
                borderRadius: 99,
                padding: "3px 8px",
              }}
            >
              NASDAQ
            </span>
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-1px",
              marginTop: 4,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            ${current_price.toFixed(2)}
          </div>
        </div>

        {/* Day change badge */}
        <div
          style={{
            background: changeBg,
            border: `1px solid ${changeBorder}`,
            borderRadius: 10,
            padding: "6px 12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: directionColor,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {price_change >= 0 ? "+" : ""}
            {price_change?.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: directionColor, fontWeight: 500 }}>
            {price_change_pct >= 0 ? "+" : ""}
            {price_change_pct?.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* ── DIVIDER ────────────────────────────────── */}
      <div
        style={{ height: 1, background: "rgba(0,0,0,0.05)", marginBottom: 20 }}
      />

      {/* ── TOMORROW PREDICTION ────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94A3B8",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          TOMORROW'S PREDICTION
        </p>

        <div
          style={{
            background: isUp
              ? "linear-gradient(135deg, #F0FDF4, #DCFCE7)"
              : "linear-gradient(135deg, #FFF5F5, #FEE2E2)",
            borderRadius: 14,
            padding: "18px 20px",
            border: `1px solid ${changeBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: directionColor,
                letterSpacing: "-0.5px",
              }}
            >
              {isUp ? "↑ Going UP" : "↓ Going DOWN"}
            </div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
              XGBoost classifier prediction
            </div>
          </div>

          {/* Confidence ring */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: `conic-gradient(${directionColor} ${confidence * 3.6}deg, #F1F5F9 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: isUp ? "#F0FDF4" : "#FFF5F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: directionColor,
                  }}
                >
                  {Math.min(confidence, 99).toFixed(0)}%
                </span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>
              confidence
            </div>
          </div>
        </div>
      </div>

      {/* ── 30 DAY FORECAST ────────────────────────── */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94A3B8",
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          30-DAY LSTM FORECAST
        </p>
        <div
          style={{
            background: "#F8F7F4",
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "-0.5px",
              }}
            >
              ${parseFloat(forecastPrice).toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
              predicted in 30 days
            </div>
          </div>
          <div
            style={{
              background: forecastUp ? "#F0FDF4" : "#FFF5F5",
              border: `1px solid ${forecastUp ? "#BBF7D0" : "#FED7D7"}`,
              borderRadius: 10,
              padding: "6px 12px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: forecastUp ? upColor : downColor,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {forecastUp ? "+" : ""}
              {forecastChange}
            </div>
            <div
              style={{ fontSize: 11, color: forecastUp ? upColor : downColor }}
            >
              {forecastUp ? "+" : ""}
              {forecastPct}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionCard;
