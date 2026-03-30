# Import heapq module for efficient selection of largest/smallest elements
import heapq
# Import sys module for system-specific parameters and path manipulation
import sys
# Import os module for operating system interactions and file path operations
import os

# Add backend directory to Python path so we can import modules from there
# __file__ = current file path (movers.py)
# os.path.dirname(__file__) = api/routes directory
# "..", ".." goes up two levels to backend directory
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

# Import APIRouter to create a group of related routes
from fastapi import APIRouter
# Import HTTPException to raise HTTP errors with status codes and messages
from fastapi import HTTPException
# Import function to fetch real stock data from external source
from data.fetcher import fetch_stock_data

# Create a router instance to group movers-related endpoints
# This will be registered in main.py with prefix "/movers"
router = APIRouter()

# List of popular stock tickers to track for market movements
# These are the stocks we'll monitor to find which are moving up or down
WATCHLIST = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",  # Apple, Microsoft, Google, Amazon, Tesla
    "META", "NVDA", "NFLX", "AMD",  "INTC",   # Meta, Nvidia, Netflix, AMD, Intel
    "UBER", "LYFT", "SNAP", "SPOT", "PYPL"    # Uber, Lyft, Snap, Spotify, PayPal
]

# Define endpoint to get top moving stocks (gainers and losers)
# @router.get("/") means this handles GET requests to /movers/
@router.get("/")
# Function to fetch and calculate top market movers
def get_top_movers():
    # Start try-except block to catch and handle errors gracefully
    try:
        # Print status message to console
        print("\n Fetching top movers ...")

        # Create empty list to store price changes for all stocks
        # Each item will be: (percentage_change, ticker, current_price)
        all_changes = []

        # Loop through each stock in our watchlist
        for ticker in WATCHLIST:
            # Try-except for individual stock to skip if error occurs
            try:
                # Fetch last 5 days of stock data for this ticker
                # period="5d" means get data for the last 5 days
                df = fetch_stock_data(ticker, period="5d")

                # Check if we have at least 2 days of data (today and yesterday)
                # We need 2 prices to calculate change
                if len(df) < 2:
                    # Skip this stock if we don't have enough data
                    continue

                # Extract the Close column (closing prices) as a Series
                close = df["Close"].squeeze()
                
                # Get today's closing price (last row in data)
                # iloc[-1] means "last row"
                today_price = float(close.iloc[-1])
                
                # Get yesterday's closing price (second to last row)
                # iloc[-2] means "second to last row"
                yesterday_price = float(close.iloc[-2])

                # Calculate percentage change between yesterday and today
                # Formula: ((current - previous) / previous) * 100
                # round(..., 2) rounds to 2 decimal places (e.g., 2.35%)
                pct_change = round(((today_price - yesterday_price) / yesterday_price) * 100, 2)

                # Add this stock's change to our list as a tuple
                # Format: (percentage_change, ticker_symbol, current_price)
                # Example: (5.23, "AAPL", 150.50)
                all_changes.append((pct_change, ticker, round(today_price, 2)))

            # If there's an error fetching this individual stock
            except Exception as e:
                # Print which stock was skipped and why
                print(f"Skipping {ticker}: {str(e)}")
                # Continue to next stock instead of crashing
                continue
        
        # Check if we successfully fetched data for ANY stocks
        if len(all_changes) == 0:
            # Raise error if all stocks failed
            raise HTTPException("Could not fetch data for any stocks")
        
        # Use heapq.nlargest to efficiently get top 5 stocks with highest gains
        # nlargest(5, list) returns the 5 items with largest first element (percentage)
        top_gainers = heapq.nlargest(5, all_changes)

        # Use heapq.nsmallest to efficiently get top 5 stocks with biggest losses
        # nsmallest(5, list) returns the 5 items with smallest first element (percentage)
        top_losers = heapq.nsmallest(5, all_changes)

        # Convert top gainers from tuples into dictionaries for JSON response
        # This makes the data more readable in the API response
        gainers_list = [
            {
                "ticker": ticker,        # Stock symbol (e.g., "AAPL")
                "price": price,          # Current price
                "change_percent": pct,  # Percentage change
                "type": "gainer"         # Label as a gainer
            }
            # Loop through each top gainer tuple and convert it
            for pct, ticker, price in top_gainers
        ]

        # Convert top losers from tuples into dictionaries for JSON response
        losers_list = [
            {
                "ticker": ticker,        # Stock symbol (e.g., "TSLA")
                "price": price,          # Current price
                "change_percent": pct,  # Percentage change (negative number)
                "type": "loser"          # Label as a loser
            }
            # Loop through each top loser tuple and convert it
            for pct, ticker, price in top_losers
        ]

        # Print the top gainer and loser to console for logging
        print(f"Top gainer: {top_gainers[0][1]} gained {top_gainers[0][0]}%")
        print(f"Top loser: {top_losers[0][1]} lost {abs(top_losers[0][0])}%")

        # Return the final response as JSON
        return {
            "gainers": gainers_list,      # List of top 5 gaining stocks
            "losers": losers_list,        # List of top 5 losing stocks
            "status": "success"           # Indicates request was successful
        }
    
    # Catch any exceptions that occur during the process
    except Exception as e:
        # Print error message to console logs
        print(f"Error fetching movers: {str(e)}")
        # Return HTTP 500 error with detailed error message to frontend
        raise HTTPException(
            status_code=500,  # Internal Server Error status code
            detail=f"Could not fetch movers: {str(e)}"  # Error details
        )