# Import NumPy for numerical operations and array handling
import numpy as np
# Import Pandas for working with dataframes and time-series data
import pandas as pd
# Import joblib for saving and loading Python objects (like the scaler)
import joblib
# Import OS module for file path operations
import os

# Import Keras Sequential model (builds neural networks layer by layer)
from tensorflow.keras.models import Sequential, load_model
# Import LSTM, Dense, and Dropout layers for building the neural network
from tensorflow.keras.layers import LSTM, Dense, Dropout
# Import EarlyStopping callback to prevent overfitting during training
from tensorflow.keras.callbacks import EarlyStopping

# Import MinMaxScaler to normalize prices to range [0, 1]
from sklearn.preprocessing import MinMaxScaler

# Number of previous days used to predict the next day (60 days of history)
SEQUENCE_LENGTH = 60

# Number of days to forecast into the future
FORECAST_DAYS = 30
# Number of training iterations (passes through entire dataset)
EPOCHS = 50
# Number of samples processed before updating model weights
BATCH_SIZE = 32

# Function to prepare training data sequences from historical prices
def prepare_sequences(df: pd.DataFrame):
    # Extract closing prices from dataframe and convert to 1D array
    close_prices = df["Close"].squeeze().values

    # Reshape prices from 1D to 2D array (required by scaler)
    close_prices = close_prices.reshape(-1, 1)

    # Create scaler object that normalizes values between 0 and 1
    scaler = MinMaxScaler(feature_range=(0,1))
    # Apply normalization: (price - min) / (max - min)
    scaled_prices = scaler.fit_transform(close_prices)

    # Input sequences (X) and output labels (Y)
    X = []  # Will store 60-day price sequences
    Y = []  # Will store the next day price (target to predict)
    
    # Create overlapping windows of 60 days
    for i in range(SEQUENCE_LENGTH, len(scaled_prices)):
        # Take 60 consecutive days of prices
        X.append(scaled_prices[i - SEQUENCE_LENGTH:i, 0])
        # Store the next day's price as the target
        Y.append(scaled_prices[i, 0])

    # Convert lists to NumPy arrays
    X = np.array(X)
    Y = np.array(Y)

    # Reshape X for LSTM: (samples, timesteps, features)
    # samples = number of sequences, timesteps = 60 days, features = 1 (price)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    # Print confirmation of sequences created
    print(f"Created {len(X)} sequences of {SEQUENCE_LENGTH} days each for training.")
    # Return training inputs, outputs, and scaler (needed later to convert predictions back to real prices)
    return X, Y, scaler

# Build the LSTM neural network model for time-series forecasting
def build_model():
    # Create sequential model (layers stacked linearly)
    model = Sequential()

    # Add first LSTM layer with 100 neurons
    # return_sequences=True means output goes to next LSTM layer
    # input_shape = (60 days, 1 feature) specifies input dimensions
    model.add(LSTM(
        units=100,  # Number of LSTM units (memory cells)
        return_sequences=True,  # Pass full sequence to next layer
        input_shape=(SEQUENCE_LENGTH, 1)  # Input: 60 timesteps, 1 feature
    ))

    # Add Dropout layer (randomly disables 20% of neurons during training)
    # This prevents overfitting by reducing co-adaptation
    model.add(Dropout(0.2))

    # Add second LSTM layer with 100 neurons
    # return_sequences=False means output only final timestep
    model.add(LSTM(
        units=100,  # Another 100 LSTM units for deeper learning
        return_sequences=False  # Return only the final output
    ))

    # Add another Dropout layer for regularization
    model.add(Dropout(0.2))

    # Add Dense (fully connected) layer with 50 neurons
    # Compresses learned features into 50 dimensions
    model.add(Dense(units=50))

    # Add output Dense layer with 1 neuron (predicts 1 price value)
    model.add(Dense(units=1))

    # Compile model: adam optimizer minimizes mean squared error (MSE) loss
    # Adam = adaptive learning rate optimizer (good for time-series)
    model.compile(optimizer="adam", loss="mse")

    # Print success message and display model architecture
    print("LSTM model architecture built successfully!")
    print(model.summary())

    # Return the compiled model
    return model

# Train the LSTM model on historical stock data
def train_model(df: pd.DataFrame, ticker: str = "STOCK"):
    # Print starting message with stock ticker
    print(f"\n Starting LSTM training for {ticker}")
    print(f"This may take a few minutes, LSTM is a deep learning model")

    # Prepare sequences: X = input sequences, Y = target prices, scaler = normalizer
    X, Y, scaler = prepare_sequences(df)

    # Split data into 80% training, 20% testing
    split_index = int(len(X) * 0.8)
    # Training input sequences (80%)
    X_train = X[:split_index]
    # Testing input sequences (20%)
    X_test  = X[split_index:]
    # Training target prices (80%)
    Y_train = Y[:split_index]
    # Testing target prices (20%)
    Y_test  = Y[split_index:]

    # Print dataset sizes
    print(f"Training on {len(X_train)} sequences")
    print(f" Testing on {len(X_test)} sequences")

    # Build the neural network model
    model = build_model()

    # Create early stopping callback to prevent overfitting
    # Monitors validation loss and stops if no improvement for 10 epochs
    early_stopping = EarlyStopping(
        monitor = "val_loss",  # Watch validation loss
        patience=10,  # Wait 10 epochs for improvement
        restore_best_weights=True  # Use weights from best epoch
    )

    # Train the model on training data
    history = model.fit(
        X_train, Y_train,  # Training data
        epochs=EPOCHS,  # 50 passes through data
        batch_size = BATCH_SIZE,  # Process 32 samples at a time
        validation_split = 0.1,  # Use 10% of training data to validate
        callbacks=[early_stopping],  # Use early stopping
        verbose=1  # Print progress
    )

    # Make predictions on test data
    test_predictions = model.predict(X_test)

    # Convert scaled predictions back to real prices
    test_predictions_real = scaler.inverse_transform(test_predictions)
    # Convert scaled test targets back to real prices
    Y_test_real = scaler.inverse_transform(Y_test.reshape(-1,1))

    # Calculate Root Mean Squared Error: average magnitude of prediction errors
    rmse = np.sqrt(np.mean((test_predictions_real - Y_test_real) ** 2))
    # Print model performance
    print(f"\nLSTM Test RMSE: ${round(rmse, 2)}")
    print(f" (On average, predictions are ${round(rmse, 2)} away from real price)")

    # Return trained model, scaler (for later use), and error metric
    return model, scaler, rmse

# Save trained model and scaler to disk for future use
def save_model(model, scaler, ticker: str):
    # Get current file directory path
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Create "saved" folder path inside current directory
    save_folder = os.path.join(base_dir, "saved")
    # Create folder if it doesn't exist (exist_ok=True prevents errors if already exists)
    os.makedirs(save_folder, exist_ok = True)

    # Create file path for model: e.g., "saved/AAPL_lstm_model.keras"
    # .keras format is modern and compatible with latest Keras versions
    model_path = os.path.join(save_folder, f"{ticker}_lstm_model.keras")
    # Create file path for scaler: e.g., "saved/AAPL_lstm_scaler.pkl"
    # .pkl (pickle) format stores Python objects
    scaler_path = os.path.join(save_folder, f"{ticker}_lstm_scaler.pkl")

    # Save the trained neural network model to disk
    model.save(model_path)
    # Save the scaler object to disk (joblib is optimized for NumPy/Sklearn objects)
    joblib.dump(scaler, scaler_path)

    # Print confirmation messages with file paths
    print(f"\n LSTM model saved to: {model_path}")
    print(f" Scaler saved to: {scaler_path}")

# Load previously trained model and scaler from disk
def load_lstm_model(ticker: str):
    # Get current file directory path
    base_dir =  os.path.dirname(os.path.abspath(__file__))
    # Build path to "saved" folder
    save_folder = os.path.join(base_dir, "saved")

    # Build path to model file: e.g., "saved/AAPL_lstm_model.keras"
    model_path = os.path.join(save_folder, f"{ticker}_lstm_model.keras")
    # Build path to scaler file: e.g., "saved/AAPL_lstm_scaler.pkl"
    scaler_path = os.path.join(save_folder, f"{ticker}_lstm_scaler.pkl")

    # Check if model file exists
    if not os.path.exists(model_path):
        # Raise error if file not found (must train model first)
        raise FileNotFoundError(f"No LSTM Model found for {ticker}.")
    # Load the trained model from disk
    model = load_model(model_path)
    # Load the scaler object from disk
    scaler = joblib.load(scaler_path)

    # Print confirmation message
    print(f"Loaded LSTM Model for {ticker}")
    # Return the loaded model and scaler
    return model, scaler

# Predict stock prices for the next 30 days using the trained model
def predict_next_30_days(df: pd.DataFrame, ticker: str):
    # Load previously trained model and its scaler from disk
    model, scaler = load_lstm_model(ticker)

    # Extract all closing prices from dataframe
    close_prices = df["Close"].squeeze().values
    # Get the most recent 60 prices (used as starting input)
    last_60_prices = close_prices[-SEQUENCE_LENGTH:]
    # Normalize the last 60 prices using the saved scaler
    last_60_scaled = scaler.transform(last_60_prices.reshape(-1,1))

    # Convert normalized prices to list (will grow as we predict)
    current_window = list(last_60_scaled.flatten())

    # List to store all 30 predicted normalized prices
    future_predictions = []

    # Loop 30 times to predict each day ahead
    for day in range(FORECAST_DAYS):
        # Extract last 60 normalized prices from our sliding window
        input_sequence = np.array(current_window[-SEQUENCE_LENGTH:])

        # Reshape to LSTM format: (samples=1, timesteps=60, features=1)
        input_sequence = input_sequence.reshape(1, SEQUENCE_LENGTH, 1)

        # Use model to predict next day's normalized price
        # [0][0] extracts the single predicted value
        next_day_scaled = model.predict(input_sequence, verbose=0)[0][0]

        # Add predicted normalized price to sliding window
        current_window.append(next_day_scaled)

        # Store the normalized prediction
        future_predictions.append(next_day_scaled)

    # Convert list to 2D array for inverse transformation
    future_predictions = np.array(future_predictions).reshape(-1,1)
    # Convert normalized predictions back to real prices
    # Reverse the normalization: (price * (max - min)) + min
    future_prices_real = scaler.inverse_transform(future_predictions)

    # Flatten the 2D array to 1D list of real prices
    future_prices_list = future_prices_real.flatten().tolist()

    # Print header for forecast
    print(f"\n 30 day price forecast for {ticker}:")
    # Show first 5 days only (avoid cluttering output)
    for i, price in enumerate(future_prices_list[:5], 1):
        print(f"Day {i}: ${round(price, 2)}")
    # Indicate there are more predictions
    print(f" ...")

    # Return results as dictionary
    return {
        "ticker": ticker,  # Stock symbol
        "forecast_days": FORECAST_DAYS,  # Number of days forecasted
        "prices": [round(p, 2) for p in future_prices_list]  # All 30 predicted prices
    }
    
# Main execution block: only runs when script is executed directly (not imported)
if __name__ == "__main__":
    # Import sys module to modify Python path
    import sys
    # Add backend/data folder to Python search path
    sys.path.append("backend/data")

    # Import function to fetch stock data from cache
    from cache import get_stock_data
    # Set stock ticker to Apple Inc.
    ticker = "AAPL"

    # Print starting message
    print(f"Training LSTM MOdel for {ticker}")
    # Fetch historical stock data from cache
    df = get_stock_data(ticker)

    # Train model on the data, returns trained model, scaler, and error metric
    model, scaler, rmse = train_model(df, ticker)

    # Save the trained model and scaler to disk for future use
    save_model(model, scaler, ticker) 

    # Make 30-day price predictions using the trained model
    result = predict_next_30_days(df, ticker)

    # Print full forecast results
    print(f"Full 30 days forecast for {ticker}")
    # Loop through all 30 predicted prices and print them
    for i, price in enumerate(result["prices"], 1):
        # :2d formats day number with minimum 2 digits (e.g., " 1", " 2", "10")
        print(f" Days{i:2d}: ${price}")