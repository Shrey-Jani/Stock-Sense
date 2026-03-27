import numpy as np
import pandas as pd
import joblib
import os

from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

from sklearn.preprocessing import MinMaxScaler

SEQUENCE_LENGTH = 60

FORECAST_DAYS = 30
EPOCHS = 50
BATCH_SIZE = 32

def prepare_sequences(df: pd.DataFrame):
    close_prices = df["Close"].squeeze().values

    close_prices = close_prices.reshape(-1, 1)

    scaler = MinMaxScaler(feature_range=(0,1))
    scaled_prices = scaler.fit_transform(close_prices)

    X = []
    Y = []
    
    for i in range(SEQUENCE_LENGTH, len(scaled_prices)):
        X.append(scaled_prices[i - SEQUENCE_LENGTH:i, 0])
        Y.append(scaled_prices[i, 0])

    X = np.array(X)
    Y = np.array(Y)

    X = X.reshape(X.shape[0], X.shape[1], 1)

    print(f"Created {len(X)} sequences of {SEQUENCE_LENGTH} days each for training.")
    return X, Y, scaler

# Build the LSTM model
def build_model():
    model = Sequential()

    model.add(LSTM(
        units=100,
        return_sequences=True,
        input_shape=(SEQUENCE_LENGTH, 1)
    ))

    model.add(Dropout(0,2))

    model.add(LSTM(
        units=100,
        return_sequences=False
    ))

    model.add(Dropout(0.2))

    model.add(Dense(units=50))

    model.add(Dense(units=1))

    model.compile(optimizer="adam", loss="mse")

    print("LSTM model architecture built successfully!")
    print(model.summary())

    return model

def train_model(df: pd.DataFrame, ticker: str = "STOCK"):
    print(f"\n Starting LSTM training for {ticker}")
    print(f"This may take a few minutes, LSTM is a deep learning model")

    X, Y, scaler = prepare_sequences(df)

    split_index = int(len(X) * 0.8)
    X_train, X_test = X[:split_index:]
    Y_train, Y_test = Y[:split_index:] 

    print(f"Training on {len(X_train)} sequences")
    print(f" Testing on {len(X_test)} sequences")

    model = build_model()

    early_stopping = EarlyStopping(
        monitor = "val_loss",
        patience=10,
        restore_best_weights=True
    )

    history = model.fit(
        X_train, Y_train,
        epochs=EPOCHS,
        batch_size = BATCH_SIZE,
        validation_split = 0.1,
        callbacks=[early_stopping],
        verbose=1
    )

    test_predictions = model.predict(X_test)

    test_predictions_real = scaler.inverse_transform(test_predictions)
    Y_test_real = scaler.inverse_transform(Y_test.reshape(-1,1))

    #rmse = Root Mean Squared Error
    rmse = np.sqrt(np.mean((test_predictions_real - Y_test_real) ** 2))
    print(f"\nLSTM Test RMSE: ${round(rmse, 2)}")
    print(f" (On average, predictions are ${round(rmse, 2)} away from real price)")

    return model, scaler, rmse

