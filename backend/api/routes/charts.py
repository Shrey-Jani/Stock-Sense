# charts.py (API route)
# This endpoint generates matplotlib charts and returns them
# as base64 image strings that React can display directly.

import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from fastapi        import APIRouter, HTTPException
from data.cache     import get_stock_data
from utils.charts   import generate_price_ma_chart, generate_lstm_chart
from models.lstm_model import predict_next_30_days, load_lstm_model, train_model as train_lstm, save_model as save_lstm

router = APIRouter()


@router.get("/")
def get_charts(ticker: str):
    try:
        ticker = ticker.upper().strip()
        print(f"\n Generating charts for {ticker}...")

        # Get stock data with indicators
        df = get_stock_data(ticker)

        # Train LSTM if not already saved
        base_dir  = os.path.join(os.path.dirname(__file__), "..", "..", "models", "saved")
        lstm_path = os.path.join(base_dir, f"{ticker}_lstm_model.h5")

        if not os.path.exists(lstm_path):
            print(f" Training LSTM for {ticker}...")
            model, scaler, _ = train_lstm(df, ticker)
            save_lstm(model, scaler, ticker)

        # Get 30-day forecast
        forecast_result = predict_next_30_days(df, ticker)
        forecast_prices = forecast_result["prices"]

        # Generate both charts
        print(" Generating price + MA chart...")
        chart1 = generate_price_ma_chart(df, ticker)

        print(" Generating LSTM forecast chart...")
        chart2 = generate_lstm_chart(df, ticker, forecast_prices)

        return {
            "ticker":        ticker,
            "price_ma_chart": chart1,   # base64 image string
            "lstm_chart":    chart2,    # base64 image string
            "status":        "success"
        }

    except Exception as e:
        print(f" Chart generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))