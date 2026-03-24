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
    
    fresh_data = fetch_stock_data(ticker)
    fresh_data = add_indicators(fresh_data)
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