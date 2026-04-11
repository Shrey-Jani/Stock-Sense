import sys 
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, "data"))
sys.path.append(os.path.join(BASE_DIR, "models"))

from data.cache import get_stock_data
from models.xgb_model import train_model as train_xgb, save_model as save_xgb
from models.lstm_model import train_model as train_lstm, save_model as save_lstm

STOCKS = [
    # Big Tech
    "AAPL",  "MSFT",  "GOOGL", "AMZN",  "META",
    "NVDA",  "TSLA",  "UBER",  "AMD",   "INTC",

    # Finance
    "JPM",   "BAC",   "GS",    "V",     "MA",

    # Healthcare
    "JNJ",   "PFE",   "UNH",   "ABBV",  "MRK",

    # Consumer
    "WMT",   "KO",    "MCD",   "NKE",   "DIS",

    # Energy + Others
    "XOM",   "CVX",   "PYPL",  "SPOT",  "NFLX"
]

successful = []
failed = []

print("=" * 55)
print(f"Stock Sense - Pre training {len(STOCKS)} stocks")
print("=" * 55)
print("This will take 30-60 minutes.")
print("=" * 55)

start_time = time.time()

for i, ticker in enumerate(STOCKS, 1):
    print(f"\n[{i}/{len(STOCKS)}] Training {ticker}...")
    ticker_start = time.time()

    try:
        print(f" Fetching data for {ticker}...")
        df = get_stock_data(ticker)
        print(f" Got {len(df)} rows of data")

        base_dir = os.path.join(os.path.dirname(__file__), "models", "saved")
        xgb_path = os.path.join(base_dir, f"{ticker}_xgb_model.pkl")

        if os.path.exists(xgb_path):
            print(f" XGboost model already exists")
        else:
            print(f" Training XGBoost ...")
            model, scaler, accuracy = train_xgb(df, ticker)
            save_xgb(model, scaler, ticker)
            print(f" XGBoost done - accuracy: {round(accuracy * 100, 1)} %")
        
        lstm_path = os.path.join(base_dir, f"{ticker}_lstm_model.keras")

        if os.path.exists(lstm_path):
            print(f"LSTM model already exists")
        else:
            print(f"Training LSTM(this takes 2-3 minutes)...")
            model, scaler, rmse = train_lstm(df, ticker)
            save_lstm(model, scaler, ticker)
            print(f"LSTM done - RMSE: ${round(rmse, 2)}")

        ticker_time = round(time.time() - ticker_start, 1)
        successful.append(ticker)
        print(f" {ticker} completed in {ticker_time}s")

    except Exception as e:
        print(f" Failed to train : {ticker} - {str(e)}")
        failed.append((ticker, str(e)))
        continue

total_time = round((time.time() - start_time) / 60, 1)

print("\n" + "=" * 55) 
print(f" Training Complete")
print("=" * 55)
print(f" Total time: {total_time} minutes")
print(f" Successful: {len(successful)}/{len(STOCKS)} stocks")
print(f" Failed: {len(failed)} stocks")

if successful:
    print(f"\n Trained stocks:")
    for s in successful:
        print(f" {s}")
if failed:
    print(f"\n Failed Stocks:")
    for ticker, reason in failed:
        print(f" {ticker}: {reason}")
print("\n All models saved to backend/models/saved")
print("=" * 55)