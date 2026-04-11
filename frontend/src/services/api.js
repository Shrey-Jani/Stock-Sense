import axios from "axios";

const PROD_BACKEND_URL = "https://stocksense-backend-20114184210.us-central1.run.app";
// Use env var when provided. In production fallback to hosted backend, otherwise localhost.
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? PROD_BACKEND_URL
    : "http://localhost:8000");

// Create axios instance with longer timeout (model training can take minutes)
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 minutes
});

// Retry logic for 429 (Too Many Requests) errors
api.interceptors.response.use(null, async (error) => {
  const config = error.config;
  if (error.response && error.response.status === 429 && !config._retryCount) {
    config._retryCount = config._retryCount || 0;
    if (config._retryCount < 3) {
      config._retryCount += 1;
      // Wait before retrying (increasing delay: 3s, 6s, 9s)
      await new Promise((res) => setTimeout(res, config._retryCount * 3000));
      return api(config);
    }
  }
  return Promise.reject(error);
});

export const fetchPrediction = async (ticker) => {
  const response = await api.get(`/predict/`, {
    params: { ticker },
  });
  return response.data;
};

export const fetchAvailableTickers = async () => {
  const response = await api.get(`/predict/available-tickers`);
  return response.data;
};

export const fetchMovers = async () => {
  const response = await api.get(`/movers/`);
  return response.data;
};

export const fetchHistory = async (ticker, fromDate = null) => {
  const params = { ticker };

  // Only add from_date to the request if it was provided
  if (fromDate) {
    params.from_date = fromDate;
  }

  const response = await api.get(`/history/`, { params });
  return response.data;
};
