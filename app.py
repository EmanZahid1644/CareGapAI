
# ...existing code...


from flask import Flask, render_template, request, jsonify, send_file
import json
import pandas as pd
import pickle

app = Flask(__name__)

# Load ML model and label encoder
with open("rf_model.pkl", "rb") as f:
    rf = pickle.load(f)
with open("le_gender.pkl", "rb") as f:
    le = pickle.load(f)

# Load data
df = pd.read_csv("data/patient_data_realistic.csv")

@app.route("/")
def index():
    # Send patient IDs to frontend
    patient_ids = df["PatientID"].unique().tolist()
    return render_template("index.html", patient_ids=patient_ids)

@app.route("/get_patient_data", methods=["POST"])
def get_patient_data():
    patient_id = int(request.json["patient_id"])
    patient_data = df[df["PatientID"] == patient_id].copy()

    # Encode Gender in-place (overwrite original column)
    patient_data["Gender"] = le.transform(patient_data["Gender"])

    features = ["Age", "Gender", "ChronicCondition", "HbA1c", "Cholesterol", "FollowUpDone"]
    X_patient = patient_data[features]

    # Predict risk
    patient_data["RiskScore"] = rf.predict_proba(X_patient)[:,1]
    patient_data["RiskLevel"] = patient_data["RiskScore"].apply(
        lambda x: "High" if x>0.7 else ("Medium" if x>0.4 else "Low")
    )

    # Care gap warning
    patient_data["CareGap"] = patient_data.apply(
        lambda row: "⚠️ Missed follow-up" if row["FollowUpDone"]==0 and (row["HbA1c"]>6.5 or row["Cholesterol"]>240) else "",
        axis=1
    )

    # Convert to JSON
    patient_json = patient_data[[
        "VisitDate","HbA1c","Cholesterol","FollowUpDone","Outcome","RiskScore","RiskLevel","CareGap"
    ]].to_dict(orient="records")

    return jsonify(patient_json)
# ...existing code...

@app.route("/predict_new_user", methods=["POST"])
def predict_new_user():
    data = request.json
    # Prepare single row for ML
    gender_encoded = le.transform([data["Gender"]])[0]
    chronic = 1 if data["ChronicCondition"].lower() == "yes" else 0
    followup_done = 1 if data["FollowUpDone"].lower() == "yes" else 0

    X_user = [[
        int(data["Age"]),
        gender_encoded,
        chronic,
        float(data["HbA1c"]),
        float(data["Cholesterol"]),
        followup_done
    ]]

    # Predict ML risk score
    risk_score = rf.predict_proba(X_user)[0][1]

    # Lab penalty adjustment for demo
    lab_penalty = 0.5 * ((float(data["HbA1c"])/10) + (float(data["Cholesterol"])/300))
    risk_score = min(risk_score + lab_penalty, 1.0)  # cap at 1.0

    # Risk level after adjustment
    risk_level = "High" if risk_score > 0.7 else ("Medium" if risk_score > 0.4 else "Low")

    # Care gap warning
    care_gap = ""
    if followup_done == 0 and (float(data["HbA1c"]) > 6.5 or float(data["Cholesterol"]) > 240):
        care_gap = "⚠️ Missed follow-up"
    elif float(data["HbA1c"]) > 7 or float(data["Cholesterol"]) > 250:
        care_gap = "⚠️ Lab values abnormal"

    return jsonify({
        "RiskScore": round(risk_score,2),
        "RiskLevel": risk_level,
        "CareGap": care_gap
    })

if __name__ == "__main__":
    print("Starting CareGap AI Flask server on http://127.0.0.1:5000 ...")
    app.run(debug=True)
