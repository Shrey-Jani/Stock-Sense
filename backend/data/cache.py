import time

my_cache = {}

CACHE_EXPIRY = 3600

def get_from_cache(ticker):

    if ticker in my_cache:

        saved_data = my_cache[ticker][0]
        saved_time = my_cache[ticker][1]

        seconds_passed = time.time() - saved_time

        if seconds_passed < CACHE_EXPIRY:
            print(f"Good news! We already have data for {ticker} in cache.")
            print(f"Data is {int(seconds_passed)} seconds old but still fresh")
            return saved_data
        
        else:
            print(f"Data for {ticker} is too old. Fetching fresh data...")
            del my_cache[ticker]
        
        return None
    
def save_to_cache(ticker, data):
    current_time = time.time()
    my_cache[ticker] = (data, current_time)

    print(f"Saved {ticker} data to cache sucessfully!")

def get_stock_data(ticker):
    from fetcher import fetch_stock_data
    from features import add_indicators

    cached_data = get_from_cache(ticker)

    if cached_data is not None:
        return cached_data
    
    print(f"No cache found for {ticker}. Downloading from Yahoo Finance...")
    
    try:
        fresh_data = fetch_stock_data(ticker)
    except ValueError as e:
        print(f"Data fetch error: {str(e)}")
        raise
    
    # Validate minimum data before processing (fetch_stock_data already does this with retry)
    if fresh_data.empty or len(fresh_data) < 100:
        raise ValueError(
            f"Insufficient data for {ticker}. Got {len(fresh_data)} rows after fetch. "
            f"Need at least 100 rows. Try a different ticker or check the stock exchange."
        )
    
    print(f"Adding technical indicators to {len(fresh_data)} rows...")
    fresh_data = add_indicators(fresh_data)
    
    # Validate data after adding indicators (after dropna)
    if fresh_data.empty or len(fresh_data) < 61:
        raise ValueError(
            f"Not enough data after preprocessing for {ticker}. Got {len(fresh_data)} rows, need at least 61.\n"
            f"This happens when technical indicators (MA20, MA50, RSI, MACD) remove too many rows."
        )
    
    print(f"✓ Successfully processed {len(fresh_data)} rows for {ticker}")
    save_to_cache(ticker, fresh_data)
    return fresh_data

if __name__ == "__main__":
    print("Test 1 First time fetching AAPL data")
    print("Expected should download from Yahoo Finance")
    data_first = get_stock_data("AAPL")
    print(data_first[["Close", "MA20", "RSI"]].tail(3))

    print()

    print("Test 2 Fetching again AAPL data")
    print("Expected should load from cache")
    data_second = get_stock_data("AAPL")
    print(data_second[["Close", "MA20", "RSI"]].tail(3))