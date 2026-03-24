import yfinance as yf
import pandas as pd
from datetime import datetime

def fetch_stock_data(ticker: str, period: str = "2y") -> pd.DataFrame:
    print("fetching data for {ticker}...")
    stock = yf.download(ticker, period = period, auto_adjust=True)

    if stock.empty:
        raise ValueError(f"No data found for ticker: {ticker}")
    stock = stock[["Open", "High", "Low", "Close", "Volume"]]
    stock.dropna(inplace=True)
    stock.index = pd.to_datetime(stock.index)

    print(f"Fetched {len(stock)} row for {ticker}")
    return stock
    
if __name__ == "__main__":
    df = fetch_stock_data("AAPL")
    print(df.head())