// Import React library - needed to create React components
// React is the core library for building interactive user interfaces
import React from "react";

// Define a React functional component called PredictionCard
// Components are reusable pieces of UI (like LEGO blocks)
// The ({ data }) means this component receives a prop called "data"
// Props are like function parameters - they pass data to the component
function PredictionCard({ data }) {
  // Destructuring: Extract individual values from the data object
  // Instead of writing: data.ticker, data.current_price, etc.
  // We can now directly use: ticker, current_price, etc.
  const {
    ticker, // Stock symbol (e.g., "AAPL")
    current_price, // Current stock price (e.g., 150.50)
    price_change, // Dollar change from yesterday (e.g., +5.50)
    price_change_pct, // Percentage change (e.g., 3.7%)
    direction, // Prediction: "UP" or "DOWN"
    confidence, // Model confidence level (0-100%)
    forecast, // Array of 30 predicted prices
  } = data;

  // Set color based on direction prediction
  // If direction is "UP", use green (#4ade80), otherwise red (#f87171)
  // This is a ternary operator: condition ? value_if_true : value_if_false
  const directionColor = direction === "UP" ? "#4ade80" : "#f87171";

  // Set arrow symbol based on direction
  // UP direction shows upward arrow ▲, DOWN shows downward arrow ▼
  const directionArrow = direction === "UP" ? "▲" : "▼";

  // Set color for price change display
  // If price_change is positive or zero, use green, otherwise red
  const changeColor = price_change >= 0 ? "#4ade80" : "#f87171";

  // Get the last predicted price from the 30-day forecast array
  // forecast is an array like [150.50, 151.20, 152.10, ..., 155.75]
  // forecast.length - 1 gets the index of the last element
  // forecast[forecast.length - 1] = 155.75 (the 30th day's predicted price)
  const forecastPrice = forecast[forecast.length - 1];

  // Calculate the dollar difference between 30-day forecast and current price
  // Example: 155.75 - 150.50 = 5.25
  // toFixed(2) rounds to 2 decimal places (standard for money)
  const forecastChange = (forecastPrice - current_price).toFixed(2);

  // Calculate the percentage change for the 30-day forecast
  // Formula: (change / current_price) * 100 = percentage
  // Example: (5.25 / 150.50) * 100 = 3.49%
  // toFixed(2) rounds to 2 decimal places
  const forecastPct = ((forecastChange / current_price) * 100).toFixed(2);

  // Return the JSX (HTML-like syntax that React understands)
  // JSX is a mix of JavaScript and HTML - it gets compiled to React elements
  return (
    // Main card container with dark background and rounded corners
    <div
      style={{
        backgroundColor: "#1e293b", // Dark blue-gray background color
        borderRadius: "16px", // Rounded corners (16px = very rounded)
        padding: "24px", // Internal spacing from edges
        border: "1px solid #334155", // Thin gray border around card
      }}
    >
      {/* Header section with stock ticker and price */}
      <div style={{ marginBottom: "20px" }}>
        {/* Stock ticker symbol (e.g., "AAPL") */}
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: "0" }}>
          {ticker}
        </h2>

        {/* Container for current price and change info (arranged horizontally) */}
        <div
          style={{
            display: "flex", // Arrange child elements in a row
            alignItems: "baseline", // Align items at their baselines
            gap: "12px", // Space between items
            marginTop: "8px", // Space above this section
          }}
        >
          {/* Current stock price - displayed large and bold */}
          <span style={{ fontSize: "36px", fontWeight: "700" }}>
            ${current_price}
          </span>

          {/* Price change info - shows dollar change and percentage */}
          <span style={{ fontSize: "14px", color: changeColor }}>
            {/* Show "+" if gain, nothing if loss (minus sign already included) */}
            {price_change >= 0 ? "+" : ""}
            {/* Display the dollar change (e.g., "+5.50") */}
            {price_change} ({/* Display percentage (e.g., "3.7%") */}
            {price_change_pct}%)
          </span>
        </div>
      </div>

      {/* Prediction box for tomorrow's direction and confidence */}
      <div
        style={{
          backgroundColor: "#0f172a", // Even darker background
          borderRadius: "12px", // Slightly less rounded
          padding: "16px", // Internal spacing
          marginBottom: "16px", // Space below this box
          textAlign: "center", // Center all text
        }}
      >
        {/* Label "TOMORROW'S PREDICTION" */}
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>
          TOMORROW'S PREDICTION
        </p>

        {/* Large arrow symbol showing UP or DOWN direction */}
        <div style={{ fontSize: "48px", color: directionColor }}>
          {directionArrow}
        </div>

        {/* Direction text: "UP" or "DOWN" in the same color as arrow */}
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

        {/* Confidence level (model's certainty about the prediction) */}
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>
          Confidence:{" "}
          <span style={{ color: "#f1f5f9", fontWeight: "600" }}>
            {confidence}%
          </span>
        </p>
      </div>

      {/* 30-day forecast box showing end-of-month predicted price */}
      <div
        style={{
          backgroundColor: "#0f172a", // Same dark background as prediction box
          borderRadius: "12px", // Rounded corners
          padding: "16px", // Internal spacing
          textAlign: "center", // Center all text
        }}
      >
        {/* Label "30-DAY FORECAST" */}
        <p style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>
          30-DAY FORECAST
        </p>

        {/* Predicted price at end of 30 days - displayed large */}
        <p style={{ fontSize: "24px", fontWeight: "700" }}>${forecastPrice}</p>

        {/* Expected change in 30 days - shows dollar and percentage change */}
        <p
          style={{
            fontSize: "13px",
            // Color is green if forecast is higher, red if lower
            color: forecastChange >= 0 ? "#4ade80" : "#f87171",
          }}
        >
          {/* Show "+" if gain, nothing if loss */}
          {forecastChange >= 0 ? "+" : ""}
          {/* Dollar change (e.g., "+5.25") */}
          {forecastChange} ({/* Percentage change (e.g., "3.49%") */}
          {forecastPct}%) over 30 days
        </p>
      </div>
    </div>
  );
}

// Export this component so other files can import and use it
// This makes PredictionCard available to other components
export default PredictionCard;
