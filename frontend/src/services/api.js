import axios from "axios";

const PROD_BACKEND_URL = "https://backend-rd0e.onrender.com";
// Use env var when provided. In production fallback to hosted backend, otherwise localhost.
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? PROD_BACKEND_URL
    : "http://localhost:8000");

export const fetchPrediction = async (ticker) => {
  const response = await axios.get(`${BASE_URL}/predict`, {
    params: { ticker },
  });
  return response.data;
};

export const fetchMovers = async () => {
  const response = await axios.get(`${BASE_URL}/movers`);
  return response.data;
};

export const fetchHistory = async (ticker, fromDate = null) => {
  const params = { ticker };

  // Only add from_date to the request if it was provided
  if (fromDate) {
    params.from_date = fromDate;
  }

  const response = await axios.get(`${BASE_URL}/history`, { params });
  return response.data;
};
