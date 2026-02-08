import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle

# Load dataset
df = pd.read_csv("data/patient_data_realistic.csv")

# Features
features = ["Age", "Gender", "ChronicCondition", "HbA1c", "Cholesterol", "FollowUpDone"]
X = df[features]

# Encode Gender
le = LabelEncoder()
X["Gender"] = le.fit_transform(X["Gender"])

# Target
y = df["Outcome"].map({"Stable": 0, "Worsened": 1})

# Train model
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X, y)


# Save model for Flask
with open("rf_model.pkl", "wb") as f:
    pickle.dump(rf, f)

with open("le_gender.pkl", "wb") as f:
    pickle.dump(le, f)

# Save feature importances for dashboard
importances = rf.feature_importances_
feature_names = X.columns.tolist()
import json
with open("feature_importance.json", "w") as f:
    json.dump({"features": feature_names, "importances": importances.tolist()}, f)

print("Model and feature importances saved!")
