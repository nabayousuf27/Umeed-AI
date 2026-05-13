import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def generate_synthetic_data(samples=100):
    """
    Generate synthetic borrower data for demonstration purposes.
    Features: loan_amount, monthly_income, age, existing_loans, dependents
    Target: is_default (1 if default, 0 if healthy)
    """
    np.random.seed(42)
    
    # Feature generation
    loan_amount = np.random.randint(5000, 50000, samples)
    monthly_income = np.random.randint(20000, 150000, samples)
    age = np.random.randint(18, 70, samples)
    existing_loans = np.random.randint(0, 5, samples)
    dependents = np.random.randint(0, 6, samples)
    
    # Synthetic logic for default (simplified)
    # Default risk increases with higher loan/income ratio and existing loans
    noise = np.random.normal(0, 0.1, samples)
    risk_score = (loan_amount / monthly_income) * 2 + (existing_loans * 0.2) + noise
    is_default = (risk_score > 0.8).astype(int)
    
    df = pd.DataFrame({
        'loan_amount': loan_amount,
        'monthly_income': monthly_income,
        'age': age,
        'existing_loans': existing_loans,
        'dependents': dependents,
        'is_default': is_default
    })
    
    return df

def train_baseline_model():
    """
    Train a baseline Logistic Regression model to predict loan default risk.
    """
    print("Generating synthetic borrower data...")
    df = generate_synthetic_data(200)
    
    # Features and target
    X = df.drop('is_default', axis=1)
    y = df['is_default']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Preprocessing
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Training
    print("Training Logistic Regression model...")
    model = LogisticRegression(random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Evaluation
    y_pred = model.predict(X_test_scaled)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model and scaler
    os.makedirs('ml/models', exist_ok=True)
    joblib.dump(model, 'ml/models/risk_model.pkl')
    joblib.dump(scaler, 'ml/models/scaler.pkl')
    print("Model and scaler saved to ml/models/")

if __name__ == "__main__":
    train_baseline_model()
