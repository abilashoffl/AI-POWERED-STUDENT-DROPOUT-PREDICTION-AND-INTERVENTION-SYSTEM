import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from predict import predict_student_dropout, get_loaded_model

app = FastAPI(
    title="AI Student Dropout Risk Prediction Service",
    description="Machine Learning service for early-warning student dropout risk assessment",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentPredictRequest(BaseModel):
    attendance: float = Field(..., ge=0, le=100, description="Attendance percentage")
    currentGpa: float = Field(..., ge=0, le=10, description="Current GPA")
    previousGpa: Optional[float] = Field(None, ge=0, le=10, description="Previous GPA")
    backlogs: int = Field(0, ge=0, description="Number of active backlogs")
    assignmentCompletion: float = Field(100, ge=0, le=100, description="Assignment completion percentage")
    internalMarks: float = Field(100, ge=0, le=100, description="Internal marks percentage")
    semesterMarks: Optional[float] = Field(100, ge=0, le=100, description="Semester exam marks percentage")
    participation: Optional[float] = Field(80, ge=0, le=100, description="Class participation level")
    feeStatus: Optional[int] = Field(1, description="Fee status (1: Paid, 0: Pending)")

class PredictionResponse(BaseModel):
    riskScore: int
    riskLevel: str
    factors: List[str]

@app.get("/health")
def health_check():
    model_loaded = get_loaded_model() is not None
    return {
        "status": "healthy",
        "service": "Student Dropout ML Service",
        "modelLoaded": model_loaded
    }

@app.post("/predict", response_model=PredictionResponse)
def predict(request: StudentPredictRequest):
    try:
        data = request.model_dump()
        result = predict_student_dropout(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
