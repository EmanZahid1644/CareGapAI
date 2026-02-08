## 🏥 CareGap-AI: Patient Risk & Care Gap Analytics

CareGap-AI is a healthcare machine learning dashboard designed to predict patient health risk and identify potential care gaps using clinical data and follow-up behavior.
The system helps clinicians and care teams detect high-risk patients early and intervene before missed care leads to disease progression or adverse outcomes.

## 🚀 Problem Statement

- Modern healthcare systems generate large volumes of patient data, yet:

- High-risk patients are often identified too late

- Missed follow-ups and abnormal lab values go unnoticed

- Clinicians lack clear, explainable insights into patient risk

* CareGap-AI addresses this by combining machine learning risk prediction with care gap detection and explainable analytics.

## 🧠 Solution Overview

# CareGap-AI analyzes:

- Laboratory trends (HbA1c, cholesterol)

- Follow-up behavior

- Chronic condition status

- Patient demographics

- Using this data, the system:

- Predicts a Risk Score (0–1)

- Classifies Risk Level (Low / Medium / High)

- Flags Care Gaps such as missed follow-ups or abnormal labs

- Explains predictions through Feature Importance

* Both existing patient journeys and new patient simulations are supported.

## ✨ Key Features
# 👤 Existing Patient Analytics

- Select a patient ID

- View historical visits and outcomes

- Risk trend visualization over time

- Feature importance derived from model behavior

# 🩺 New Patient (What-If Analysis)

- Simulate a new patient using clinical inputs

- Instant risk prediction

- Care gap warnings for unsafe patterns

- Global feature importance for explainability

## 📊 Interactive Dashboard

- Risk summary tiles (Risk Score, Risk Level, Care Gap)

- Animated charts using Chart.js

- Color-coded patient visit table

- Healthcare-friendly UI with clear visual hierarchy

## 📈 Explainable AI

- CareGap-AI emphasizes responsible and transparent AI:

- Feature Importance highlights which factors most influence predictions

* Differentiates between:

- Patient-level trends (existing patients)

- Global model behavior (new patients)

- Helps clinicians trust and interpret model outputs

- Feature importance reflects model influence, not medical causation.

## 🛠️ Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript

- Backend: Flask (Python)

- Machine Learning: Scikit-learn

- Visualization: Chart.js

* Data: Synthetic but realistic patient data

## 🧪 Data & Ethics

- Uses synthetic healthcare data to ensure privacy

- Designed with ethical AI principles:

- Transparency

- Safety alerts

- Explainability

* Suitable for educational, research, and prototype demonstrations