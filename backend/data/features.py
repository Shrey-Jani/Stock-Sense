from collections import deque
import pandas as pd

def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    close = df["Close"].squeeze()

    df["MA20"] = close.rolling(window=20).mean()
    df["MA50"] = close.rolling(window=50).mean()

    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()
    rs = avg_gain / avg_loss
    df["RSI"] = 100 - (100/(1+rs))

    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    df["MACD"] = ema12 - ema26
    df["MACD_Signal"] = df["MACD"].ewm(span=9, adjust=False).mean()

    df["Volume_Change"] = df["Volume"].pct_change() * 100

    df.dropna(inplace=True)
    return df

if __name__ == "__main__":
    from fetcher import fetch_stock_data
    df = fetch_stock_data("AAPL")
    df = add_indicators(df)
    print(df[["Close", "MA20", "MA50", "RSI", "MACD"]].tail())