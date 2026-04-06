import yfinance as yf
import pandas as pd
from datetime import datetime

def fetch_stock_data(ticker: str, period: str = "5y") -> pd.DataFrame:
    """Fetch stock data with intelligent retry logic for insufficient data.
    
    Args:
        ticker: Stock ticker symbol (e.g., 'AAPL')
        period: Data period for 5 years of history
    
    Returns:
        DataFrame with OHLCV data
    
    Raises:
        ValueError: If no valid data can be fetched
    """
    print(f"Fetching data for {ticker} (period: {period})...")
    
    try:
        stock = yf.download(ticker, period=period, auto_adjust=True, progress=False)
    except Exception as e:
        print(f"Error downloading {ticker}: {str(e)}")
        raise ValueError(f"Failed to fetch data for ticker: {ticker}. Error: {str(e)}")

    if stock.empty:
        raise ValueError(f"No data found for ticker: {ticker}. Please verify the ticker symbol is correct.")
    
    # Select only required columns
    stock = stock[["Open", "High", "Low", "Close", "Volume"]]
    stock.dropna(inplace=True)
    stock.index = pd.to_datetime(stock.index)
    
    print(f"Fetched {len(stock)} rows for {ticker}")
    
    # If we got insufficient data with default period, retry with longer period
    if len(stock) < 100:
        print(f"⚠️  Only got {len(stock)} rows with {period} period. Retrying with max period...")
        try:
            stock = yf.download(ticker, period="max", auto_adjust=True, progress=False)
            if not stock.empty:
                stock = stock[["Open", "High", "Low", "Close", "Volume"]]
                stock.dropna(inplace=True)
                stock.index = pd.to_datetime(stock.index)
                print(f"✓ Retry successful! Now have {len(stock)} rows for {ticker}")
            else:
                raise ValueError(f"No data available for {ticker}")
        except Exception as e:
            print(f"Retry failed: {str(e)}")
            raise ValueError(
                f"Insufficient historical data for {ticker}. Only {len(stock)} rows available. "
                f"Need at least 100 rows. The ticker may not have enough historical data or may be invalid."
            )
    
    return stock
    
if __name__ == "__main__":
    df = fetch_stock_data("AAPL")
    print(df.head())