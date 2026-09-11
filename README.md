# 🧠 Mental Health Score Predictor

A full-stack machine learning application that predicts a student's
**Mental Health Score (0--10)** using lifestyle, academic, sleep,
stress, and social-media usage patterns.

The project combines a **Random Forest regression model** with a
**FastAPI backend** and a responsive frontend.

## 🌐 Live Demo

https://mental-health-predictor-1-mgts.onrender.com

## ✨ Features

-   Predicts a student's mental health score from 0--10
-   Random Forest regression model
-   Data preprocessing and feature engineering pipeline
-   Country grouping for high-cardinality categorical data
-   Input validation using Pydantic
-   FastAPI REST API
-   Responsive and animated frontend
-   Interactive score gauge and result visualization
-   CORS support for frontend-backend communication

## 🛠️ Tech Stack

**Machine Learning** - Python - Pandas - NumPy - Scikit-learn - Joblib

**Backend** - FastAPI - Uvicorn - Pydantic

**Frontend** - HTML5 - CSS3 - JavaScript

**Deployment** - Render

## 🤖 Machine Learning Pipeline

### 1. Data Preparation

-   Removed duplicate records
-   Handled invalid physical activity values
-   Explored missing values, distributions, correlations, and outliers

### 2. Feature Engineering

-   Grouped countries into the top 10 countries and `Other`
-   Applied log transformation to `Study_Hours`
-   Encoded ordinal `Stress_Level`
-   One-hot encoded categorical features

### 3. Preprocessing

  Feature Type           Processing
  ---------------------- --------------------------
  Study Hours            `log1p` + StandardScaler
  Numerical Features     StandardScaler
  Stress Level           OrdinalEncoder
  Categorical Features   OneHotEncoder

### 4. Model

A `RandomForestRegressor` is used inside a Scikit-learn `Pipeline`,
keeping preprocessing and prediction together.

### 5. Performance

The tuned Random Forest achieved:

**Test R²: 0.8794**

  Model                      Test R²      MAE         RMSE
  --------------------- ------------ -------- ------------
  Linear Regression           0.7398   0.5362       0.6760
  Random Forest               0.8776   0.3472       0.4637
  Tuned Random Forest     **0.8794**   0.3480   **0.4603**

## 🔌 API

### `POST /predict`

Example request:

``` json
{
  "age": 21,
  "gender": "Male",
  "country": "India",
  "academic_level": "Undergraduate",
  "most_used_platform": "Instagram",
  "purpose_of_use": "Entertainment",
  "avg_daily_usage_hours": 4.5,
  "daily_unlocks": 65,
  "study_hours": 5,
  "physical_activity_hours": 1,
  "sleep_hours_per_night": 7,
  "stress_level": "Medium"
}
```

Example response:

``` json
{
  "predicted_mental_health_score": 7.42
}
```

## 📁 Project Structure

``` text
Mental-Health-Score-Predictor/
│
├── Mental_Health_Model.pkl
├── Mental_Health_Score_Predictor.ipynb
├── Student Social Media And Mental Health Impact.csv
├── README.md
│
├── index.html
├── style.css
├── script.js
│
├── main.py
└── requirements.txt
```

> `__pycache__/` may appear locally as a Python-generated cache
> directory and is not required for the application.

## 🚀 Run Locally

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd Mental-Health-Score-Predictor
```

### 2. Create a virtual environment

``` bash
python -m venv venv
```

Activate it:

**Windows**

``` bash
venv\Scripts\activate
```

**Linux/macOS**

``` bash
source venv/bin/activate
```

### 3. Install dependencies

``` bash
pip install -r requirements.txt
```

### 4. Start FastAPI

``` bash
uvicorn main:app --reload
```

The API will be available at:

``` text
http://127.0.0.1:8000
```

### 5. Open the frontend

Open `index.html` in a browser.

If the frontend is hosted separately, make sure `script.js` points to
the deployed FastAPI backend URL.

## ⚠️ Model Compatibility

The saved `.pkl` model should be loaded with the compatible Scikit-learn
version used when the model was created.

The current model was saved using:

``` text
scikit-learn==1.6.1
```

Therefore, use the same version when running the application unless the
model is retrained and saved again with a newer version.

## 📌 Disclaimer

This project is intended for **educational and research purposes**. The
predicted score is a machine-learning estimate and should not be
considered a medical diagnosis or professional mental-health assessment.
