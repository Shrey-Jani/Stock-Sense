import numpy as np
import pandas as pd
import joblib
import os

from xgboost import XGBClassifier

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler

#Prepare data for training
def prepare_data(df: pd.DataFrame):
    feature_columns = ["MA20", "MA50", "RSI", "MACD", "MACD_Signal", "Volume_Change"]

    close = df["Close"].squeeze()

    df["Tomorrow_Close"] = close.shift(-1)

    df["Label"] = (df["Tomorrow_Close"].squeeze() > close).astype(int)
    
    df = df.dropna()

    X = df[feature_columns]
    Y = df["Label"]

    print(f"Total rows available for training: {len(df)}")
    print(f"Days price went Up:  {Y.sum()} ({round(Y.mean()*100, 1)}%)")
    print(f"Days Price went Down: {(Y==0).sum()} ({round((1-Y.mean())*100, 1)}%)")

    return X, Y

# Train the Model
def train_model(df: pd.DataFrame, ticker: str = "STOCK"):
    print(f"\n Starting XGBoost training for {ticker}")

    X, Y = prepare_data(df)

    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y, test_size = 0.2, shuffle = False
    )
    print(f"Training on {len(X_train)} days of data")
    print(f"Testing on {len(X_test)} days of data")


    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = XGBClassifier(
        n_estimators = 200,
        max_depth = 4,
        learning_rate = 0.05,
        random_state = 42,
        eval_metric = "logloss",
        verbosity = 0
    )

    model.fit(X_train_scaled, Y_train)
    print("Model training complete!")

    predictions = model.predict(X_test_scaled)
    accuracy = accuracy_score(Y_test, predictions)
    print(classification_report(Y_test, predictions, target_names=["DOWN", "UP"]))

    feature_names = ["MA20", "MA50", "RSI", "MACD", "MACD_Signal", "Volume_Change"]
    impotance_scores = model.feature_importances_

    feature_importance = dict(zip(feature_names, impotance_scores))

    print("\n Feature Importance (higher = more useful for prediction):")
    for feature, score in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
        bar = "█" * int(score*50)
        print(f" {feature:<20} {bar} {round(score, 4)}")
    
    return model, scaler, accuracy

# Save the Model

def save_model(model, scaler, ticker: str):
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    save_folder = os.path.join(base_dir, "saved")
    os.makedirs(save_folder, exist_ok = True)

    model_path = os.path.join(save_folder, f"{ticker}_xgb_model.pkl")
    scaler_path = os.path.join(save_folder, f"{ticker}_xgb_scaler.pkl")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"\n Model Saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")

# Load a Saved Model

def load_model(ticker: str):
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    save_folder = os.path.join(base_dir, "saved")
    model_path = f"{save_folder}/{ticker}_xgb_model.pkl"
    scaler_path = f"{save_folder}/{ticker}_xgb_scaler.pkl"

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No saved model found for {ticker}")
    
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    print(f"Loaded saved model for {ticker}")
    return model, scaler

# Make a Prediction
def predict_next_day(df: pd.DataFrame, ticker: str):
    model, scaler = load_model(ticker)

    feature_columns = ["MA20", "MA50", "RSI", "MACD", "MACD_Signal", "Volume_Change"]
    latest_data = df[feature_columns].tail(1)

    latest_scaled = scaler.transform(latest_data)

    prediction = model.predict(latest_scaled)[0]

    confidence = model.predict_proba(latest_scaled)[0][prediction]

    direction = "UP" if prediction == 1 else "DOWN"

    print(f"\n Prediction for {ticker} tomorrow:")
    print(f" Direction {direction}")
    print(f" Confidence: {round(confidence * 100, 1)}%")

    return {
        "ticker": ticker,
        "direction": direction,
        "confidence": round(confidence * 100, 1),
        "prediction": prediction
    }

if __name__ == "__main__":
    import sys
    sys.path.append("backend/data")

    from fetcher import fetch_stock_data
    from features import add_indicators
    from cache import get_stock_data

    ticker = "AAPL"

    print(f"Training XGBoost model for {ticker}")

    df = get_stock_data(ticker)
    model, scaler, accuracy = train_model(df, ticker)
    save_model(model, scaler, ticker)

    result = predict_next_day(df, ticker)

    print(f"Final Result")
    print(f"{ticker} is predicted to go {result['direction']} tomorrow")
    print(f"Confidence: {result['confidence']}%")