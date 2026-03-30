// TopMovers.jsx - File name and main purpose
// This component displays the top 5 gaining and top 5 losing stocks of the day
// It uses the /movers API endpoint (backend uses Min-Heap data structure for efficiency!)

// Import React - core library for building React components and UIs
import React from "react";
// Import useEffect - runs code at specific times in component lifecycle (side effects)
// useEffect is used for things like fetching data when component loads
import { useEffect } from "react";
// Import useState - allows components to have state (remember data between renders)
// State is like the component's memory - it can change and trigger re-renders
import { useState } from "react";
// Import the API service function to fetch movers data from the backend
import { fetchMovers } from "../services/api";

// Define the TopMovers functional React component
// This component is responsible for showing top gaining and losing stocks
function TopMovers() {
  // ──── STATE VARIABLES ────────────────────────────────────────────

  // Create state variable "movers" to store the API response data
  // movers will contain { gainers: [...], losers: [...] } from backend
  // setMovers is the function to update the movers state
  // useState(null) means it starts as null (no data yet)
  const [movers, setMovers] = useState(null);

  // Create state variable "loading" to track if data is still being fetched
  // useState(true) means we start in the "loading" state
  // setLoading is the function to turn loading on/off
  // This state tells us when to show "Loading..." vs showing actual data
  const [loading, setLoading] = useState(true);

  // Create state variable "error" to store error messages if something fails
  // useState(null) means no error at the start
  // setError is the function to set error messages if the API call fails
  // This state determines what error message to display if data fetch fails
  const [error, setError] = useState(null);

  // ──── FETCH DATA WHEN COMPONENT LOADS ────────────────────────────

  // useEffect hook - runs side effects (like fetching data)
  // Think of it as "after rendering, do this thing"
  useEffect(() => {
    // Define an async function to fetch the movers data
    // async keyword means this function uses promises/await syntax
    const loadMovers = async () => {
      // try-catch block for error handling
      // "try" to execute code, if it fails, "catch" and handle the error
      try {
        // Call fetchMovers() function from the API service
        // await means "wait for this promise to finish before continuing"
        // const data stores the result returned from the API
        const data = await fetchMovers();

        // Update the movers state with the data we received
        // This triggers a re-render of the component to display the data
        setMovers(data);
      } catch (err) {
        // Catch block runs if fetchMovers() throws an error
        // Set an error message in state when the API call fails
        // This will trigger a re-render showing the error message
        setError("Could not load top movers");
      } finally {
        // Finally block always runs, whether try succeeded or catch happened
        // Set loading to false because data has arrived (or failed)
        // This stops showing the "Loading..." message
        setLoading(false);
      }
    };

    // Call the loadMovers function to start fetching data
    // This actually executes the data-fetching process
    loadMovers();
  }, []); // Empty dependency array [] means run this effect only ONCE when component mounts

  // ──── CONDITIONAL RENDERING: LOADING STATE ──────────────────────

  // Check if we're still loading data
  // If loading is true, show a loading message instead of the data
  if (loading) {
    // Return and display a loading indicator UI
    return (
      <div
        style={{
          // Dark blue-gray background color (hex color code)
          backgroundColor: "#1e293b",
          // Rounded corners (16 pixels = fairly rounded)
          borderRadius: "16px",
          // Internal spacing (padding) from the edges
          padding: "24px",
          // Center align all text horizontally
          textAlign: "center",
          // Gray text color for loading message
          color: "#64748b",
        }}
      >
        {/* Display "Loading movers..." message */}
        Loading movers...
      </div>
    );
  }

  // ──── CONDITIONAL RENDERING: ERROR STATE ────────────────────────

  // Check if there was an error fetching the data
  // If error variable has a value, show the error message
  if (error) {
    // Return and display an error UI
    return (
      <div
        style={{
          // Dark blue-gray background
          backgroundColor: "#1e293b",
          // Rounded corners
          borderRadius: "16px",
          // Internal spacing
          padding: "24px",
          // Red text color (indicating error)
          color: "#f87171",
        }}
      >
        {/* Display the error message stored in state */}
        {error}
      </div>
    );
  }

  // ──── HELPER FUNCTION: RENDER ONE STOCK ROW ──────────────────────

  // Helper function to create a single stock row
  // This function takes one stock object as a parameter
  // It returns JSX for displaying one stock's info in a row
  // This function will be called multiple times in .map() for each stock
  const renderStockRow = (stock) => {
    // Check if this stock is a gainer (positive change) or loser (negative change)
    // stock.change_pct >= 0 means the price went UP (or stayed the same)
    // stock.change_pct < 0 means the price went DOWN
    const isGainer = stock.change_pct >= 0;

    // Set color based on whether it's a gainer or loser
    // Ternary operator: condition ? value_if_true : value_if_false
    // Green (#4ade80) color for gainers (positive)
    // Red (#f87171) color for losers (negative)
    const color = isGainer ? "#4ade80" : "#f87171";

    // Return JSX (React's HTML-like syntax) for one stock row
    return (
      // Container div for this stock row
      <div
        // key is a unique identifier for each row in a list
        // React uses keys to identify which items have changed
        // The ticker symbol is used as the unique key (e.g., "AAPL", "MSFT")
        key={stock.ticker}
        style={{
          // display: flex makes items arrange horizontally (in a row)
          display: "flex",
          // justifyContent: space-between spreads items evenly across the row
          // Places one item on left, one in middle, one on right
          justifyContent: "space-between",
          // Vertically center items in the row
          alignItems: "center",
          // Padding (internal spacing) above and below this row
          padding: "8px 0",
          // Add a thin line (border) at the bottom of this row
          borderBottom: "1px solid #1e293b",
        }}
      >
        {/* COLUMN 1: Stock ticker symbol (e.g., "AAPL", "TSLA") */}
        <span style={{ fontWeight: "600", fontSize: "14px" }}>
          {/* Display the stock ticker from the stock object */}
          {stock.ticker}
        </span>

        {/* COLUMN 2: Current stock price (e.g., "$150.50") */}
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          {/* Display a dollar sign followed by the current price */}$
          {stock.price}
        </span>

        {/* COLUMN 3: Percentage change badge/label */}
        <span
          style={{
            // Background color depends on if it's a gainer (dark green) or loser (dark red)
            // Dark green (#052e16) for gainers to match the green text
            // Dark red (#450a0a) for losers to match the red text
            // This creates a colored badge/pill appearance
            backgroundColor: isGainer ? "#052e16" : "#450a0a",
            // Text color - use the color variable we set earlier (green or red)
            color: color,
            // Padding inside the badge (small spacing around the text)
            padding: "3px 8px",
            // borderRadius: 20px makes it pill-shaped (very rounded)
            borderRadius: "20px",
            // Small font size for the badge (12px)
            fontSize: "12px",
            // Bold font weight to make it stand out
            fontWeight: "600",
          }}
        >
          {/* Show "+" sign for positive changes (gainers) */}
          {/* For negative changes, the minus sign is already in the number */}
          {isGainer ? "+" : ""}
          {/* Display the percentage change (e.g., "3.45%") */}
          {stock.change_pct}%
        </span>
      </div>
    );
  };

  // ──── MAIN RENDER FUNCTION ───────────────────────────────────────

  // Return the main JSX for the component
  return (
    // Main outer container for the entire component
    <div
      style={{
        // Dark blue-gray background color for the card
        backgroundColor: "#1e293b",
        // Rounded corners (16px = moderately rounded)
        borderRadius: "16px",
        // Internal spacing (padding) inside the card
        padding: "24px",
        // Thin gray border around the entire card
        border: "1px solid #334155",
      }}
    >
      {/* ───────── TITLE SECTION ───────────────────────────────────── */}

      {/* Main title "Top Movers Today" */}
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#94a3b8" }}>
        Top Movers Today
      </h3>

      {/* ───────── TOP GAINERS SECTION ─────────────────────────────── */}

      {/* Container for the TOP GAINERS section */}
      <div style={{ marginBottom: "20px" }}>
        {/* "TOP GAINERS" label/header */}
        <p
          style={{
            // Small font size (11px) for the label
            fontSize: "11px",
            // Green color (#4ade80) to indicate gainers
            color: "#4ade80",
            // Bold font weight to make it stand out as a label
            fontWeight: "600",
            // Space below the label before the stock rows
            marginBottom: "8px",
            // Increase spacing between letters (makes text more spaced out)
            letterSpacing: "0.05em",
          }}
        >
          TOP GAINERS
        </p>

        {/* Loop through each gainer stock and render a row for it */}
        {/* .map() iterates over the gainers array */}
        {/* For each stock, it calls renderStockRow() function */}
        {/* This creates 5 rows (one for each top gainer) */}
        {movers.gainers.map(renderStockRow)}
      </div>

      {/* ───────── TOP LOSERS SECTION ──────────────────────────────── */}

      {/* Container for the TOP LOSERS section */}
      <div>
        {/* "TOP LOSERS" label/header */}
        <p
          style={{
            // Small font size (11px) for the label
            fontSize: "11px",
            // Red color (#f87171) to indicate losers
            color: "#f87171",
            // Bold font weight to make it stand out as a label
            fontWeight: "600",
            // Space below the label before the stock rows
            marginBottom: "8px",
            // Increase spacing between letters (makes text more spaced out)
            letterSpacing: "0.05em",
          }}
        >
          TOP LOSERS
        </p>

        {/* Loop through each loser stock and render a row for it */}
        {/* .map() iterates over the losers array */}
        {/* For each stock, it calls renderStockRow() function */}
        {/* This creates 5 rows (one for each top loser) */}
        {movers.losers.map(renderStockRow)}
      </div>
    </div>
  );
}

// Export this component so other files can import and use it
// Without this, TopMovers cannot be imported in other files
export default TopMovers;
