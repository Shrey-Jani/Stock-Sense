# StockSense 📈
### AI-Powered Stock Prediction Dashboard

> Type any stock ticker and get an AI-powered prediction — direction, confidence, and a 30-day price forecast — powered by XGBoost and LSTM deep learning.

---

## Live Demo
> 🔗 [Live Demo](https://your-vercel-link.vercel.app) &nbsp;|&nbsp; 🐙 [GitHub](https://github.com/YOUR_USERNAME/StockSense)

---

## Screenshots

> *(Add a GIF or screenshot of your dashboard here)*
> Use ScreenToGif or Loom to record a quick demo and drag it into this section.

---

## What is StockSense?

StockSense is a full stack AI stock prediction app built from scratch. The user types any stock ticker (like AAPL or TSLA) and gets back:

- **Tomorrow's prediction** — will the price go UP or DOWN, with a confidence percentage (XGBoost)
- **30-day price forecast** — actual predicted closing prices shown as a chart overlay (LSTM)
- **Top movers** — today's biggest gainers and losers
- **Technical indicators** — RSI, MACD, MA20, MA50 calculated from real market data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Data | yfinance, pandas, pandas-ta |
| ML Models | XGBoost, TensorFlow/Keras (LSTM), scikit-learn |
| Backend | Python, FastAPI, Uvicorn |
| Database | MongoDB Atlas |
| Frontend | React 18, Recharts, TailwindCSS |
| Deployment | Railway (backend), Vercel (frontend) |

---

## DSA — Performance Decisions

This project intentionally uses Data Structures & Algorithms to optimize real bottlenecks — not just for show.

| DSA | Where Used | Improvement |
|---|---|---|
| **Hash Map** | `data/cache.py` — ticker data cache | Repeat API calls reduced from ~4s to O(1) constant time |
| **Sliding Window** | `data/features.py` — rolling indicators | RSI, MACD, MA computed without recalculating from scratch each step |
| **Min-Heap** | `api/routes/movers.py` — top movers | Finding top-N stocks in O(n log k) instead of O(n log n) full sort |
| **Binary Search** | `api/routes/history.py` — date range queries | Date range slicing in O(log n) instead of O(n) linear scan |

---

## ML Models

### XGBoost Classifier
- **Task:** Predict whether tomorrow's closing price will be higher or lower than today
- **Output:** Direction (UP/DOWN) + confidence percentage
- **Features:** MA20, MA50, RSI, MACD, MACD Signal, Volume Change
- **Accuracy:** ~55-65% (consistently beats 50% random baseline)

### LSTM Deep Learning
- **Task:** Predict actual closing price for the next 30 days
- **Architecture:** 2 LSTM layers (100 units each) + Dropout + Dense output
- **Input:** 60-day sliding window of closing prices
- **Metric:** RMSE (Root Mean Squared Error in dollars)

---

## Project Structure

```
StockSense/
├── backend/
│   ├── data/
│   │   ├── fetcher.py          # yfinance data fetch
│   │   ├── features.py         # DSA: sliding window indicators
│   │   ├── cache.py            # DSA: hash map ticker cache
│   │   └── db.py               # MongoDB read/write
│   ├── models/
│   │   ├── xgb_model.py        # XGBoost classifier
│   │   ├── lstm_model.py       # LSTM price predictor
│   │   └── saved/              # saved .pkl and .h5 model files
│   ├── api/
│   │   └── routes/
│   │       ├── predict.py      # DSA: binary search date range
│   │       ├── movers.py       # DSA: min-heap top movers
│   │       └── history.py      # historical price data
│   └── main.py                 # FastAPI app entry point
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SearchBar.jsx
│       │   ├── PredictionCard.jsx
│       │   ├── StockChart.jsx
│       │   ├── TopMovers.jsx
│       │   └── Indicators.jsx
│       ├── services/
│       │   └── api.js          # Axios calls to backend
│       └── App.js
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/predict?ticker=AAPL` | Returns direction, confidence, 30-day forecast |
| GET | `/movers` | Returns top 5 gainers and top 5 losers |
| GET | `/history?ticker=AAPL&from_date=2024-01-01` | Returns historical prices |
| GET | `/health` | Health check |

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free tier)

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/StockSense.git
cd StockSense

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install fastapi uvicorn yfinance pandas pandas-ta pymongo scikit-learn xgboost tensorflow joblib python-dotenv

# Create .env file
echo "MONGO_URI=your_mongodb_connection_string" > backend/.env

# Run the backend
uvicorn backend.main:app --reload --port 8000
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start the React app
npm start
```

### Train the Models

```bash
# Train XGBoost model for AAPL
python backend/models/xgb_model.py

# Train LSTM model for AAPL
python backend/models/lstm_model.py
```

---

## Disclaimer

⚠️ StockSense is a **portfolio and learning project** — not a financial tool. Stock predictions are inherently uncertain and no model can reliably beat the market. Do not use this for real trading decisions.

---

## What I Learned

- How to build and deploy an end-to-end ML pipeline from raw data to live predictions
- How LSTM models use sliding windows to forecast time series data
- How to apply DSA concepts (heap, binary search, hash map) in real systems to improve performance
- How to connect a Python ML backend to a React frontend via REST API
- That debugging `numpy.float32` serialization errors at midnight is a rite of passage

---

## Author

**Shrey** — Fresh Graduate | Full Stack + ML  
🔗 [LinkedIn](https://linkedin.com/in/YOUR_PROFILE) &nbsp;|&nbsp; 🐙 [GitHub](https://github.com/YOUR_USERNAME)

---

*Built with curiosity, a lot of debugging, and way too much coffee.*
