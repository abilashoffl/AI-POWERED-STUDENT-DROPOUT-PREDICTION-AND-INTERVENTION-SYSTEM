import os
import joblib
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'dropout_model.pkl')

def get_loaded_model():
    if os.path.exists(MODEL_PATH):
        try:
            return joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Error loading model from {MODEL_PATH}: {e}")
    return None

def compute_risk_factors(data):
    factors = []
    
    attendance = float(data.get('attendance', 100))
    current_gpa = float(data.get('currentGpa', 10))
    previous_gpa = float(data.get('previousGpa', current_gpa))
    backlogs = int(data.get('backlogs', 0))
    assignment_completion = float(data.get('assignmentCompletion', 100))
    internal_marks = float(data.get('internalMarks', 100))
    semester_marks = float(data.get('semesterMarks', 100))
    participation = float(data.get('participation', 100))
    fee_status = int(data.get('feeStatus', 1))

    if attendance < 65:
        factors.append("Low attendance percentage (<65%)")
    elif attendance < 75:
        factors.append("Moderate attendance deficit (<75%)")
        
    if backlogs >= 3:
        factors.append("Critical backlog count (3 or more)")
    elif backlogs >= 1:
        factors.append("Active academic backlogs")
        
    if assignment_completion < 50:
        factors.append("Low assignment completion (<50%)")
        
    if current_gpa < 5.5:
        factors.append("Low academic GPA (<5.5)")
    elif current_gpa < previous_gpa - 0.5:
        factors.append("Declining GPA trend compared to previous term")
        
    if internal_marks < 50:
        factors.append("Poor performance in internal assessments")
        
    if semester_marks < 50:
        factors.append("Low end-semester exam score")
        
    if fee_status == 0:
        factors.append("Pending tuition fee payment")
        
    if participation < 40:
        factors.append("Low classroom participation")
        
    if not factors:
        factors.append("Satisfactory academic progress & attendance")
        
    return factors

def predict_student_dropout(data: dict):
    model_artifact = get_loaded_model()
    
    attendance = float(data.get('attendance', 80))
    current_gpa = float(data.get('currentGpa', 7.0))
    previous_gpa = float(data.get('previousGpa', 7.0))
    backlogs = int(data.get('backlogs', 0))
    assignment_completion = float(data.get('assignmentCompletion', 80))
    internal_marks = float(data.get('internalMarks', 75))
    semester_marks = float(data.get('semesterMarks', 75))
    participation = float(data.get('participation', 70))
    fee_status = int(data.get('feeStatus', 1))

    if model_artifact and 'model' in model_artifact:
        model = model_artifact['model']
        scaler = model_artifact['scaler']
        feature_cols = model_artifact['feature_cols']
        
        input_list = [
            attendance, current_gpa, previous_gpa, backlogs,
            assignment_completion, internal_marks, semester_marks,
            participation, fee_status
        ]
        
        X_input = np.array([input_list])
        X_scaled = scaler.transform(X_input)
        
        proba = model.predict_proba(X_scaled)[0][1]
        risk_score = int(round(proba * 100))
    else:
        # Fallback accurate analytical score computation if model file not compiled yet
        raw_score = (
            (100 - attendance) * 0.28 +
            (10 - current_gpa) * 6.0 +
            backlogs * 9.5 +
            (100 - assignment_completion) * 0.15 +
            (100 - internal_marks) * 0.12 +
            (100 - semester_marks) * 0.10 +
            (100 - participation) * 0.08 +
            (1 - fee_status) * 12
        )
        risk_score = int(round(max(0, min(100, raw_score))))
        
    # Enforce exact requirement thresholds: 0-39 LOW, 40-69 MEDIUM, 70-100 HIGH
    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
        
    factors = compute_risk_factors(data)
    
    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "factors": factors
    }
