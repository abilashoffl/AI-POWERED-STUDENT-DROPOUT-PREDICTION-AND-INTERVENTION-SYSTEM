import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def generate_sample_data(num_samples=1200):
    np.random.seed(42)
    
    attendance = np.random.uniform(30, 100, num_samples)
    current_gpa = np.random.uniform(3.5, 10.0, num_samples)
    previous_gpa = np.clip(current_gpa + np.random.normal(0, 0.8, num_samples), 3.5, 10.0)
    backlogs = np.random.choice([0, 1, 2, 3, 4, 5], size=num_samples, p=[0.5, 0.2, 0.15, 0.08, 0.04, 0.03])
    assignment_completion = np.random.uniform(20, 100, num_samples)
    internal_marks = np.random.uniform(25, 100, num_samples)
    semester_marks = np.random.uniform(30, 100, num_samples)
    participation = np.random.uniform(10, 100, num_samples)
    fee_status = np.random.choice([0, 1], size=num_samples, p=[0.15, 0.85]) # 1: Paid, 0: Pending
    
    # Calculate synthetic dropout risk probability formula based on academic factors
    risk_score_raw = (
        (100 - attendance) * 0.30 +
        (10 - current_gpa) * 6.5 +
        backlogs * 10 +
        (100 - assignment_completion) * 0.15 +
        (100 - internal_marks) * 0.15 +
        (100 - semester_marks) * 0.10 +
        (100 - participation) * 0.10 +
        (1 - fee_status) * 15
    )
    
    # Add minor noise
    noise = np.random.normal(0, 5, num_samples)
    risk_score = np.clip(risk_score_raw + noise, 0, 100)
    
    # Binary classification: High risk of dropout if risk score >= 60
    dropout_target = (risk_score >= 60).astype(int)
    
    df = pd.DataFrame({
        'attendance': np.round(attendance, 1),
        'currentGpa': np.round(current_gpa, 2),
        'previousGpa': np.round(previous_gpa, 2),
        'backlogs': backlogs,
        'assignmentCompletion': np.round(assignment_completion, 1),
        'internalMarks': np.round(internal_marks, 1),
        'semesterMarks': np.round(semester_marks, 1),
        'participation': np.round(participation, 1),
        'feeStatus': fee_status,
        'dropout': dropout_target,
        'calculatedRiskScore': np.round(risk_score, 1)
    })
    
    return df

def train_and_save_model():
    os.makedirs('data', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    data_path = 'data/student_dropout_dataset.csv'
    df = generate_sample_data(1200)
    df.to_csv(data_path, index=False)
    print(f"Sample dataset saved to {data_path} with {len(df)} records.")
    
    feature_cols = [
        'attendance', 'currentGpa', 'previousGpa', 'backlogs',
        'assignmentCompletion', 'internalMarks', 'semesterMarks',
        'participation', 'feeStatus'
    ]
    
    X = df[feature_cols]
    y = df['dropout']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print("--- MODEL EVALUATION METRICS ---")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("Confusion Matrix:")
    print(cm)
    print("---------------------------------")
    
    model_artifact = {
        'model': model,
        'scaler': scaler,
        'feature_cols': feature_cols,
        'metrics': {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1)
        }
    }
    
    model_save_path = 'models/dropout_model.pkl'
    joblib.dump(model_artifact, model_save_path)
    print(f"Trained model artifact saved successfully to {model_save_path}")

if __name__ == '__main__':
    train_and_save_model()
