from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import joblib
import json
import numpy as np
from datetime import datetime

# ==============================
# FastAPI Setup
# ==============================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Database Setup (SQLite)
# ==============================

DATABASE_URL = "sqlite:///./predictions.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)

class PredictionHistory(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    prediction = Column(String)
    confidence = Column(Float)
    timestamp = Column(String)

Base.metadata.create_all(bind=engine)

# ==============================
# Load ML Model
# ==============================

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

with open("metrics.json", "r") as f:
    metrics = json.load(f)

# ==============================
# Request Schema
# ==============================

class NewsRequest(BaseModel):
    text: str

# ==============================
# Important Words Function
# ==============================

def get_important_words(text):
    feature_names = vectorizer.get_feature_names_out()
    tfidf_vector = vectorizer.transform([text])

    sorted_indices = np.argsort(tfidf_vector.toarray()).flatten()[::-1]
    top_words = [feature_names[i] for i in sorted_indices[:5]]

    return top_words

# ==============================
# Prediction Endpoint
# ==============================

@app.post("/predict")
def predict(news: NewsRequest):

    db = SessionLocal()

    text = news.text
    transformed_text = vectorizer.transform([text])

    prediction = model.predict(transformed_text)[0]
    probability = model.predict_proba(transformed_text)[0]

    confidence = round(np.max(probability) * 100, 2)
    result_label = "Real News" if prediction == 1 else "Fake News"

    important_words = get_important_words(text)

    # Save to Database
    new_entry = PredictionHistory(
        text=text,
        prediction=result_label,
        confidence=confidence,
        timestamp=str(datetime.now())
    )

    db.add(new_entry)
    db.commit()
    db.close()

    return {
        "prediction": result_label,
        "confidence": confidence,
        "important_words": important_words
    }

# ==============================
# Metrics Endpoint
# ==============================

@app.get("/metrics")
def get_metrics():
    return metrics

# ==============================
# History Endpoint
# ==============================

@app.get("/history")
def get_history():
    db = SessionLocal()
    records = db.query(PredictionHistory).order_by(PredictionHistory.id.desc()).limit(5).all()
    db.close()

    return [
        {
            "text": r.text[:100] + "...",
            "prediction": r.prediction,
            "confidence": r.confidence,
            "timestamp": r.timestamp
        }
        for r in records
    ]