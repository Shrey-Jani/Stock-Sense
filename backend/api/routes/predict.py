# Import sys module for system-specific parameters and path manipulation
import sys
# Import os module for operating system interactions and file path operations
import os

# Add backend directory to Python path so we can import modules from there
# __file__ = current file path (predict.py)
# os.path.dirname(__file__) = api/routes directory
# "..", ".." goes up two levels to backend directory
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

# Add data folder to Python path to import data.cache module
# "..", "..", "data" goes to backend/data directory
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "data"))

# Add models folder to Python path to import model files
# "..", "..", "models" goes to backend/models directory
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "models"))

# Import APIRouter to create a group of related routes
from fastapi import APIRouter
# Import HTTPException to raise HTTP errors with status codes and messages
from fastapi import HTTPException

# Import function to fetch stock data from cache
from data.cache import get_stock_data
# Import XGBoost model training function
from models.xgb_model import train_model as train_xgb
# Import XGBoost model saving function
from models.xgb_model import save_model as save_xgb
# Import XGBoost prediction function for next day price movement
from models.xgb_model import predict_next_day
# Import LSTM model training function
from models.lstm_model import train_model as train_lstm
# Import LSTM model saving function
from models.lstm_model import save_model as save_lstm
# Import LSTM prediction function for next 30 days forecast
from models.lstm_model import predict_next_30_days

# Create a router instance to group prediction-related endpoints
# This will be registered in main.py with prefix "/predict"
router = APIRouter()

# Define the main prediction endpoint
# @router.get("/") means this handles GET requests to /predict/?ticker=AAPL
# Decorator registers this function as an API endpoint
@router.get("/")
# Function name and parameter
# ticker: str = query parameter that user provides (e.g., ?ticker=AAPL)
def predict_stock(ticker: str):
    # Start try-except block to catch and handle errors gracefully
    try:
        # Convert ticker to uppercase and remove whitespace (e.g., "aapl " -> "AAPL")
        ticker = ticker.upper().strip()
        # Log the prediction request
        print(f"\n Prediction request received for: {ticker}")

        # Print status message
        print(f"Fetching data for {ticker}")
        # Fetch historical stock data from cache (data folder)
        df = get_stock_data(ticker)

        # Build full path to models/saved directory where trained models are stored
        base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "models", "saved")
        # Build path to XGBoost model file (e.g., "AAPL_xgb_model.pkl")
        xgb_path = os.path.join(base_dir, f"{ticker}_xgb_model.pkl")
        # Build path to LSTM model file (e.g., "AAPL_lstm_model.pkl")
        lstm_path = os.path.join(base_dir, f"{ticker}_lstm_model.pkl")

        # Check if XGBoost model file already exists
        if not os.path.exists(xgb_path):
            # Model doesn't exist, print status
            print(f"No XGBoost model found for {ticker} Training Now")
            # Train a new XGBoost model on the data
            model, scaler, accuracy = train_xgb(df, ticker)
            # Save the trained model and scaler to disk
            save_xgb(model, scaler, ticker)
        else:
            # Model already exists, just print confirmation
            print(f"XGboost model found for {ticker}")
        
        # Check if LSTM model file already exists
        if not os.path.exists(lstm_path):
            # Model doesn't exist, print status
            print(f"No LSTM model found for {ticker}")
            # Train a new LSTM model on the data
            model, scaler, rmse = train_lstm(df, ticker)
            # Save the trained model and scaler to disk
            save_lstm(model, scaler, ticker)
        else:
            # Model already exists, just print confirmation
            print(f"LSTM model found for {ticker}")
        
        # Print status message
        print(f"Running XGboost prediction")
        # Make prediction using XGBoost model (next day direction: up or down)
        xgb_result = predict_next_day(df, ticker)

        # Print status message
        print(f"Running LSTM 30 days prediction")
        # Make prediction using LSTM model (next 30 days prices)
        lstm_result = predict_next_30_days(df, ticker)

        # Get the most recent closing price (today's price)
        # df["Close"].squeeze() converts to Series, iloc[-1] gets last row
        current_price = round(float(df["Close"].squeeze().iloc[-1]),2)
        # Get the previous closing price (yesterday's price)
        previous_price = round(float(df['Close'].squeeze().iloc[-2]),2)
        # Calculate dollar change between yesterday and today
        price_change = round(current_price - previous_price, 2)
        # Calculate percentage change ((change / previous) * 100)
        price_change_percent = round((price_change /previous_price) * 100, 2)

        # Return the prediction results as JSON response
        return {
            "ticker":            ticker,
            "current_price":     float(round(float(df["Close"].squeeze().iloc[-1]), 2)),
            "price_change":      float(round(float(df["Close"].squeeze().iloc[-1]) - float(df["Close"].squeeze().iloc[-2]), 2)),
            "price_change_pct":  float(round(((float(df["Close"].squeeze().iloc[-1]) - float(df["Close"].squeeze().iloc[-2])) / float(df["Close"].squeeze().iloc[-2])) * 100, 2)),
            "direction":         str(xgb_result["direction"]),
            "confidence":        float(xgb_result["confidence"]),
            "forecast":          [float(p) for p in lstm_result["prices"]],
            "status":            "success"
        }
    # Catch any exceptions that occur during prediction
    except Exception as e:
        # Print error message to console logs
        print(f"Error predicting {ticker}: {str(e)}")
        # Return HTTP 500 error with detailed error message to frontend
        raise HTTPException(
            status_code = 500,  # Internal Server Error status code
            detail=f"Could not get prediction for {ticker}: {str(e)}"  # Error details
        )
    
