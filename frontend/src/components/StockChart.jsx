// StockChart.jsx
// This component shows two things on one chart:
// 1. Historical closing prices (solid blue line)
// 2. LSTM 30-day price forecast (dashed orange line)
// We use the Recharts library for the chart

import React, { useEffect, useState } from "react";
import {
  ComposedChart, // allows mixing different chart types
  Line, // line chart element
  XAxis, // horizontal axis
  YAxis, // vertical axis
  CartesianGrid, // background grid lines
  Tooltip, // popup that shows values on hover
  Legend, // labels showing what each line means
  ResponsiveContainer, // makes chart fill its container width
} from "recharts";
import { fetchHistory } from "../services/api";

function StockChart({ data }) {
  // chartData holds the combined historical + forecast data for the chart
  const [chartData, setChartData] = useState([]);

  // loading state while we fetch historical data
  const [loading, setLoading] = useState(true);

  // This runs whenever the ticker changes (data.ticker changes)
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);

        // Fetch last 6 months of historical data from our /history endpoint
        // We calculate 6 months ago from today
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const fromDate = sixMonthsAgo.toISOString().split("T")[0]; // format: YYYY-MM-DD

        const historyData = await fetchHistory(data.ticker, fromDate);

        // Build the historical data points for the chart
        // Each point has a date and the actual closing price
        const historicalPoints = historyData.dates.map((date, index) => ({
          date: date,
          actual: historyData.prices[index], // real historical price
          forecast: null, // no forecast for historical dates
        }));

        // Build the forecast data points for the next 30 days
        // We start from tomorrow and go forward
        const forecastPoints = data.forecast.map((price, index) => {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + index + 1);
          return {
            date: futureDate.toISOString().split("T")[0],
            actual: null, // no actual price for future dates
            forecast: price, // LSTM predicted price
          };
        });

        // Combine historical and forecast into one array for the chart
        setChartData([...historicalPoints, ...forecastPoints]);
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a ticker
    if (data.ticker) {
      loadChartData();
    }
  }, [data.ticker]); // re-runs whenever ticker changes

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#1e293b",
          borderRadius: "16px",
          padding: "24px",
          textAlign: "center",
          color: "#64748b",
        }}
      >
        Loading chart...
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #334155",
      }}
    >
      {/* Chart title */}
      <h3 style={{ margin: "0 0 20px 0", fontSize: "16px", color: "#94a3b8" }}>
        Price History + 30-Day Forecast — {data.ticker}
      </h3>

      {/* ResponsiveContainer makes the chart fill the full width */}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          {/* Background grid lines */}
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />

          {/* X axis shows dates — we show every 20th label to avoid crowding */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(value, index) => (index % 20 === 0 ? value : "")}
          />

          {/* Y axis shows price — automatically scales to fit the data */}
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(value) => `$${value}`}
            domain={["auto", "auto"]}
          />

          {/* Tooltip shows exact values when hovering over the chart */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value, name) => [
              value ? `$${value}` : "N/A",
              name === "actual" ? "Actual Price" : "Forecast Price",
            ]}
          />

          {/* Legend labels at the top of the chart */}
          <Legend
            formatter={(value) =>
              value === "actual" ? "Actual Price" : "30-Day Forecast"
            }
          />

          {/* Solid blue line for historical actual prices */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false} // no dots on each data point — too crowded
            connectNulls={false} // don't connect across null values
          />

          {/* Dashed orange line for LSTM forecast prices */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#fb923c"
            strokeWidth={2}
            strokeDasharray="6 3" // makes the line dashed
            dot={false}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;
