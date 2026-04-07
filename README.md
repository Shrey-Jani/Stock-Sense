# StockSense 📈
### AI-Powered Stock Prediction Dashboard

> Type any stock ticker and get an AI-powered prediction — direction, confidence, and a 30-day price forecast — powered by XGBoost and LSTM deep learning.

---

## 🔗 Live Demo

| | Link |
|---|---|
| 🌐 Frontend | [frontend-00g7.onrender.com](https://frontend-00g7.onrender.com) |
| ⚙️ Backend API | [stocksense-backend-20114184210.us-central1.run.app](https://stocksense-backend-20114184210.us-central1.run.app) |
| 📖 API Docs | [Swagger UI](https://stocksense-backend-20114184210.us-central1.run.app/docs) |
| 🐙 GitHub | [Shrey-Jani/Stock-Sense](https://github.com/Shrey-Jani/Stock-Sense) |

---

## What is StockSense?

StockSense is a full-stack AI stock prediction app built from scratch. The user types any stock ticker (like AAPL or TSLA) and gets back:

- **Tomorrow's prediction** — will the price go UP or DOWN, with a confidence percentage (XGBoost)
- **30-day price forecast** — actual predicted closing prices shown as a chart overlay (LSTM)
- **Top movers** — today's biggest gainers and losers
- **Technical indicators** — RSI, MACD, MA20, MA50 calculated from real market data
- **Interactive charts** — live price charts with moving averages, and LSTM forecast overlays

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Data** | yfinance, pandas |
| **ML Models** | XGBoost, TensorFlow/Keras (LSTM), scikit-learn |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **Frontend** | React 19, Recharts, TailwindCSS, Axios |
| **Deployment** | Google Cloud Run (backend), Render (frontend) |
| **Containerization** | Docker |

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
- **Accuracy:** ~55–65% (consistently beats 50% random baseline)

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
│   │   ├── fetcher.py          # yfinance data fetch with retry logic
│   │   ├── features.py         # DSA: sliding window indicators
│   │   └── cache.py            # DSA: hash map ticker cache
│   ├── models/
│   │   ├── xgb_model.py        # XGBoost classifier
│   │   ├── lstm_model.py       # LSTM price predictor
│   │   └── saved/              # saved .pkl and .h5 model files
│   ├── api/
│   │   └── routes/
│   │       ├── predict.py      # prediction endpoint
│   │       ├── movers.py       # DSA: min-heap top movers
│   │       ├── history.py      # DSA: binary search date range
│   │       └── charts.py       # matplotlib chart generation
│   ├── utils/
│   │   └── charts.py           # chart rendering helpers
│   ├── main.py                 # FastAPI app entry point
│   ├── Dockerfile              # Docker config for Cloud Run
│   ├── .dockerignore
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── SearchBar.jsx       # ticker search with suggestions
│       │   ├── PredictionCard.jsx  # prediction results display
│       │   ├── StockChart.jsx      # historical + forecast chart
│       │   ├── LiveChart.jsx       # real-time price chart
│       │   ├── TopMovers.jsx       # top gainers & losers
│       │   └── Indicators.jsx      # technical indicators display
│       ├── services/
│       │   └── api.js              # Axios API client with retry logic
│       └── App.js
│
├── Procfile
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/predict?ticker=AAPL` | Returns direction, confidence, 30-day forecast |
| `GET` | `/movers` | Returns top 5 gainers and top 5 losers |
| `GET` | `/history?ticker=AAPL&from_date=2024-01-01` | Returns historical prices |
| `GET` | `/charts?ticker=AAPL` | Returns base64-encoded price/MA and LSTM charts |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive Swagger API documentation |

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Shrey-Jani/Stock-Sense.git
cd StockSense

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
# .venv\Scripts\activate   # Windows

# Install dependencies
cd backend
pip install -r requirements.txt

# Run the backend
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start the React app
npm start
```

The app will be available at `http://localhost:3000` with the backend at `http://localhost:8000`.

---

## Deployment

### Backend — Google Cloud Run

The backend is containerized with Docker and deployed to Google Cloud Run with 2GB RAM for ML model training.

```bash
cd backend

gcloud run deploy stocksense-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --timeout 300 \
  --max-instances 4 \
  --concurrency 1 \
  --set-env-vars "FRONTEND_ORIGIN=https://your-frontend-url.com"
```

### Frontend — Render (Static Site)

The React frontend is deployed as a static site on Render with auto-deploy from the `main` branch.

| Render Setting | Value |
|---|---|
| Build Command | `cd frontend && npm install && npm run build` |
| Publish Directory | `frontend/build` |
| Environment Variable | `REACT_APP_API_URL` = your Cloud Run backend URL |

---

## Disclaimer

⚠️ StockSense is a **portfolio and learning project** — not a financial tool. Stock predictions are inherently uncertain and no model can reliably beat the market. Do not use this for real trading decisions.

---

## What I Learned

- How to build and deploy an end-to-end ML pipeline from raw data to live predictions
- How LSTM models use sliding windows to forecast time series data
- How to apply DSA concepts (heap, binary search, hash map) in real systems to improve performance
- How to connect a Python ML backend to a React frontend via REST API
- How to containerize and deploy ML workloads to Google Cloud Run
- How to handle CORS, rate limiting, and cloud IP blocking in production
- That debugging `numpy.float32` serialization errors at midnight is a rite of passage

---

## Author

**Shrey Jani** — Fresh Graduate | Full Stack + ML  
🔗 [LinkedIn](https://linkedin.com/in/shrey-jani) &nbsp;|&nbsp; 🐙 [GitHub](https://github.com/Shrey-Jani)

---

*Built with curiosity, a lot of debugging, and way too much coffee.* ☕
