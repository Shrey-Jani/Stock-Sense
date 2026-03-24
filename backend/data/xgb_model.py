import numpy as np
import pandas as pd
import joblib
import os

from xgboost import XGBClassifier

from sklearn.model_selection import train_test_spilt
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler

#Prepare data for training
def prepare_data(df: pd.DataFram):
    feature_columns = ["MA20", "MA50", "RSI", "MACD", "MACD_Signal", "Volume_Change"]

    df["Tomorrow_Close"] = df['Close'].shift(-1)

    df["Label"] = (df["Tomorrow_Close"] > df["Close"]).astype(int)

    df = df.dropna()

    X = df[feature_columns]
    Y = df["Label"]

    print(f"Total rows available for training: {len(df)}")
    print(f"Days price went Up:  {y.sum()} ({round(y.mean()*100, 1)}%)")
    print(f"Days Price went Down: {(y==0).sum()} ({round((1-y.mean())*100, 1)}%)")

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
    save_folder = "backend/model/saved"
    os.markedirs(save_folder, exist_ok = True)

    model_path = f"{save_folder}/{ticker}_xgb_model.pkl"
    scaler_path = f"{save_folder}/{ticker}_xgb_scaler.pkl"

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"\n Model Saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
