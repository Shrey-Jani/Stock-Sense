# Import bisect module for efficient binary search on sorted lists
# Binary search is much faster than linear search for large datasets
import bisect
# Import sys module for system-specific parameters and path manipulation
import sys
# Import os module for operating system interactions and file path operations
import os

# Add backend directory to Python path so we can import modules from there
# __file__ = current file path (history.py)
# os.path.dirname(__file__) = api/routes directory
# "..", ".." goes up two levels to backend directory
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

# Import APIRouter to create a group of related routes
from fastapi import APIRouter
# Import HTTPException to raise HTTP errors with status codes and messages
from fastapi import HTTPException
# Import datetime module to validate and work with dates
from datetime import datetime
# Import function to fetch stock data from cache
from data.cache import get_stock_data

# Create a router instance to group history-related endpoints
# This will be registered in main.py with prefix "/history"
router = APIRouter()

# Define endpoint to get historical stock data
# @router.get("/") means this handles GET requests to /history/?ticker=AAPL
@router.get("/")
# Function parameters:
# ticker: str = required query parameter (stock symbol like "AAPL")
# from_date: str = optional query parameter (starting date in YYYY-MM-DD format, defaults to None/all data)
def get_historical_data(ticker: str, from_date: str = None):
    # Start try-except block to catch and handle errors gracefully
    try:
        # Convert ticker to uppercase and remove whitespace (e.g., "aapl " -> "AAPL")
        ticker = ticker.upper().strip()
        # Print request details to console for logging
        print(f"\n History request for {ticker} from {from_date}")

        # Fetch all historical stock data for this ticker from cache
        df = get_stock_data(ticker)

        # Extract all dates from the dataframe and convert to YYYY-MM-DD string format
        # strftime("%Y-%m-%d") formats dates as strings
        # tolist() converts the Series to a Python list
        all_dates = df.index.strftime("%Y-%m-%d").tolist()

        # Initialize start_index to 0 (beginning of data by default)
        # This will be modified if from_date is provided
        start_index = 0
        
        # Check if user provided a from_date parameter
        if from_date:
            # Validate that the date string is in correct format (YYYY-MM-DD)
            try:
                # datetime.strptime parses the string and raises ValueError if format is wrong
                datetime.strptime(from_date, "%Y-%m-%d")
            # If date format is invalid
            except ValueError:
                # Return HTTP 400 (Bad Request) error with helpful message
                raise HTTPException(
                    status_code = 400,  # Bad Request status code
                    detail = "Invalid date format. Use YYYY-MM-DD"  # Help user fix it
                    )
            
            # Use binary search to find the index where from_date starts in all_dates
            # bisect_left finds the leftmost position where from_date would be inserted
            # This is much faster than looping through dates (O(log n) vs O(n))
            start_index = bisect.bisect_left(all_dates, from_date)

            # Print debug info showing which date was found
            print(f"Binary search found start index: {start_index}")
            print(f"Starting from date: {all_dates[start_index]}")

        # Filter the dataframe to include only data from start_index onwards
        # iloc[n:] means "from row n to the end"
        df_filtered = df.iloc[start_index:]

        # Extract the closing prices column and convert to list
        # squeeze() converts single column DataFrame to Series
        close = df_filtered["Close"].squeeze()
        
        # Extract the dates from filtered dataframe and format as YYYY-MM-DD strings
        dates = df_filtered.index.strftime("%Y-%m-%d").tolist()
        
        # Extract the prices and round to 2 decimal places
        # float() ensures values are numbers, round(..., 2) rounds to cents
        prices = [round(float(price), 2) for price in close.tolist()]

        # Extract trading volumes (number of shares traded)
        # int() converts to integers since volumes don't have decimals
        volumes = [int(v) for v in df_filtered["Volume"].squeeze().tolist()]

        # Print how much data we're returning
        print(f"returning {len(dates)} data points for {ticker}")

        # Return the historical data as JSON response
        return {
            "ticker": ticker,        # Stock symbol (e.g., "AAPL")
            "Dates": dates,          # List of dates in YYYY-MM-DD format
            "prices": prices,        # List of closing prices for each date
            "volumes": volumes,      # List of trading volumes for each date
            "count": len(dates),     # Total number of data points returned
            "status": "success"      # Indicates request was successful
        }
    
    # Handle HTTPException specifically (from validation above)
    except HTTPException:
        # Re-raise the HTTP exception so it properly returns to client
        raise
    
    # Catch any other unexpected exceptions
    except Exception as e:
        # Print error message to console logs
        print(f" Error fetching history for {ticker}: {str(e)}")
        # Return HTTP 500 error with detailed error message to frontend
        raise HTTPException(
            status_code=500,  # Internal Server Error status code
            detail=f"Could not fetch history for {ticker}: {str(e)}"  # Error details
        )