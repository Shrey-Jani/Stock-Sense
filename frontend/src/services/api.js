import axios from "axios";

const BASE_URL = "http://localhost:8000";

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
