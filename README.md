# AI-Powered Student Dropout Prediction & Intervention System

A complete, production-grade full-stack web application designed for early identification of at-risk college students using Machine Learning (Random Forest Classification) and automated rule-based intervention workflows.

---

## 📌 Project Overview

College dropout rates remain a critical concern in higher education. The **AI-Powered Student Dropout Prediction & Intervention System** provides academic institution administrators and faculty mentors with actionable early-warning insights. By evaluating key academic indicators—such as attendance percentage, current GPA, GPA trajectory, active backlogs, assignment completion, internal assessment scores, and tuition fee status—the system calculates a precise **Dropout Risk Score (0–100%)** and classifies students into **LOW**, **MEDIUM**, or **HIGH** risk categories.

Additionally, the system features an automated **Intervention Recommendation Engine** that matches at-risk students with targeted remedial programs (e.g., faculty mentoring, remedial classes, attendance monitoring, assignment assistance, financial advisory) and assigns faculty mentors with deadline tracking.

---

## 🚀 Technology Stack

### **Frontend**
* **Framework:** React.js (v18) + Vite
* **Styling:** Tailwind CSS (v3) + Glassmorphism aesthetic
* **Icons:** Lucide React
* **Data Visualization:** Recharts
* **HTTP Client:** Axios
* **Routing:** React Router DOM (v6)

### **Backend**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose (with embedded `mongodb-memory-server` auto-fallback for zero-dependency local execution)
* **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing
* **Architecture:** Controller-Service-Model RESTful API pattern

### **AI / Machine Learning Service**
* **Framework:** Python 3.12 + FastAPI
* **ML Library:** scikit-learn (`RandomForestClassifier`), pandas, numpy
* **Model Serialization:** joblib
* **Server:** Uvicorn ASGI

---

## 📁 Project Structure

```
student-dropout-system/
│
├── frontend/                     # React + Vite Frontend Application
│   ├── src/
│   │   ├── components/           # Reusable UI (StatCard, RiskBadge, Navbar, Sidebar, Modals)
│   │   ├── context/              # AuthContext (JWT session management)
│   │   ├── layouts/              # DashboardLayout & AuthLayout
│   │   ├── pages/                # AdminDashboard, StudentList, StudentProfile, Interventions, etc.
│   │   ├── services/             # Axios API service integrations
│   │   ├── App.jsx               # Protected route definitions
│   │   ├── index.css             # Tailwind & glassmorphic styling
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                      # Express.js REST API Server
│   ├── src/
│   │   ├── config/               # Database connection (MongoDB / Memory Server)
│   │   ├── controllers/          # Business logic handlers
│   │   ├── middleware/          # JWT protection & role authorization
│   │   ├── models/               # Mongoose schemas (User, Student, Prediction, Intervention, etc.)
│   │   ├── routes/               # API route definitions
│   │   ├── services/             # ML service HTTP wrapper & Intervention Rule Engine
│   │   ├── seed.js               # Database seeding script
│   │   └── server.js             # Express application entry point
│   ├── package.json
│   └── .env.example
│
├── ml-service/                   # Python FastAPI ML Prediction Engine
│   ├── models/                   # Serialized Random Forest model artifact (.pkl)
│   ├── data/                     # Synthetic student dataset generator
│   ├── train_model.py            # Model training & scikit-learn evaluation script
│   ├── predict.py                # Model loader & risk factor calculator
│   ├── main.py                   # FastAPI REST server (/predict, /health)
│   ├── requirements.txt
│   └── .env.example
│
├── docker-compose.yml            # Multi-container orchestration config
├── README.md                     # Comprehensive documentation
└── .gitignore
```

---

## 🔑 Key Features

1. **Dual Role-Based Authentication:**
   * **Admin Access:** Full system control, student CRUD management, AI prediction execution, intervention creation, analytics dashboard, faculty mentor assignment, and audit report generation.
   * **Student Access:** Individual profile portal displaying GPA trajectory, attendance status, calculated dropout risk level, personalized risk factors, recommendations, and assigned interventions.

2. **AI Dropout Risk Prediction Model:**
   * Trained on academic indicators using `RandomForestClassifier`.
   * Evaluates feature metrics: Attendance, Current GPA, Previous GPA, Backlogs, Assignment Completion, Internal Marks, Semester Marks, Participation, and Fee Status.
   * Categorizes risk into exact standard brackets:
     * `0% - 39%` → **LOW RISK** (Green)
     * `40% - 69%` → **MEDIUM RISK** (Amber)
     * `70% - 100%` → **HIGH RISK** (Red/Rose)

3. **Automated Intervention Recommendation Engine:**
   * Rule-based algorithm triggers tailored recommendations based on risk metrics:
     * Attendance `< 65%` → Attendance Monitoring
     * Backlogs `>= 3` → Academic Counselling & Backlog Remediation
     * Assignment Completion `< 50%` → Assignment Support
     * GPA Decline → Faculty Mentorship
     * Multiple risk triggers → Multi-factor Comprehensive Counselling

4. **Interactive Data Analytics Dashboard:**
   * 6 Summary Stat Cards (Total Students, High Risk, Medium Risk, Low Risk, Active Interventions, Needs Attention).
   * 6 Recharts visualization graphs (Risk Distribution Donut Chart, Department Risk Bar Chart, Attendance vs Risk Scatter Plot, GPA vs Risk Correlation, Monthly Risk Trend Area Chart, Intervention Status Bar Chart).

5. **Reports & Data Export:**
   * One-click CSV dataset export for high-risk student lists and intervention logs.
   * Styled printable PDF report views formatted for academic committee reviews.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `admin123` | Full System Access |
| **High-Risk Student** | `alex.vance@student.college.edu` | `student123` | Student View (88% Risk) |
| **Low-Risk Student** | `emily.w@student.college.edu` | `student123` | Student View (12% Risk) |

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student_dropout_db
JWT_SECRET=supersecret_student_dropout_prediction_key_2026
ML_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

### `ml-service/.env`
```env
PORT=8000
HOST=0.0.0.0
```

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🛠️ Step-by-Step Local Setup Instructions

### **Prerequisites**
* **Node.js:** v18+ or v20+
* **Python:** 3.10+ or 3.12+
* **MongoDB:** Local MongoDB instance OR let the backend automatically launch the embedded `mongodb-memory-server`.

---

### **1. Setup ML Service (Python FastAPI)**

```bash
cd ml-service

# Install Python packages
pip install -r requirements.txt

# Train the Random Forest ML Model
python train_model.py

# Start the FastAPI ML Server
python main.py
```
*FastAPI ML Service will start on `http://localhost:8000`*

---

### **2. Setup Backend Server (Express + MongoDB)**

```bash
cd backend

# Install Node dependencies
npm install

# Seed the Database with Demo Records & Users
npm run seed

# Start Backend Development Server
npm run dev
```
*Backend API Server will start on `http://localhost:5000`*

---

### **3. Setup Frontend Web Application (React + Vite)**

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server
npm run dev
```
*Frontend application will launch on `http://localhost:3000`*

---

## 🐳 Docker Setup

To run all 4 containers (MongoDB, ML Service, Backend API, Frontend Web App) via Docker Compose:

```bash
docker-compose up --build
```

Access services at:
* **Frontend UI:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`
* **ML Service API:** `http://localhost:8000`

---

## 📡 REST API Documentation

### **Authentication**
* `POST /api/auth/login` - Authenticate user & issue JWT token
* `POST /api/auth/register` - Register user account
* `GET /api/auth/me` - Get current session profile

### **Students**
* `GET /api/students` - Retrieve all students (supports `search`, `department`, `riskLevel`, `year`, `sortBy`)
* `GET /api/students/:id` - Retrieve single student with predictions, interventions & recommendations
* `POST /api/students` - Enroll new student (automatically triggers ML prediction)
* `PUT /api/students/:id` - Update student metrics (recalculates risk score)
* `DELETE /api/students/:id` - Delete student record

### **Predictions (ML Service Integration)**
* `POST /api/predictions` - Generate and save new risk prediction
* `GET /api/predictions/student/:studentId` - Get prediction trajectory history for a student

### **Interventions**
* `GET /api/interventions` - List interventions (supports status filter)
* `POST /api/interventions` - Create and assign intervention
* `PUT /api/interventions/:id` - Update status or notes
* `DELETE /api/interventions/:id` - Remove intervention

### **Analytics & Reports**
* `GET /api/analytics/overview` - Dashboard summary cards count
* `GET /api/analytics/risk` - Risk distribution & scatter metrics
* `GET /api/analytics/departments` - Department-wise breakdown

---

## 🛡️ License & Project Notice

This application is built for college demonstration and educational research purposes. The predictions generated by the Random Forest model provide early-warning risk scores to assist academic counseling and are not deterministic guarantees.
