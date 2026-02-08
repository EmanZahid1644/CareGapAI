import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Parameters
num_patients = 100          # 100 patients
entries_per_patient = 5     # 5 visits each → total ~500 rows
start_date = datetime(2025, 1, 1)

# Initialize lists
data = []

for pid in range(1, num_patients + 1):
    age = random.randint(25, 80)
    gender = random.choice(["Male", "Female"])
    chronic = random.choice([0, 1])  # 0 = no chronic, 1 = chronic condition
    last_visit = start_date
    
    for _ in range(entries_per_patient):
        # Visit date
        last_visit += timedelta(days=random.randint(20, 100))
        visit_date = last_visit.strftime("%Y-%m-%d")
        
        # Lab results
        hbA1c = round(random.uniform(4.5, 10.0), 1)
        cholesterol = random.randint(150, 300)
        
        # Follow-up
        follow_up_done = random.choices([0, 1], weights=[0.3, 0.7])[0]
        
        # Outcome: worsened if abnormal + missed follow-up
        outcome = "Worsened" if ((hbA1c > 6.5 or cholesterol > 240) and follow_up_done == 0) else "Stable"
        
        data.append([
            pid, age, gender, chronic, visit_date, hbA1c, cholesterol, follow_up_done, outcome
        ])

# Create DataFrame
df = pd.DataFrame(data, columns=[
    "PatientID", "Age", "Gender", "ChronicCondition",
    "VisitDate", "HbA1c", "Cholesterol", "FollowUpDone", "Outcome"
])

# Save to CSV
df.to_csv("data/patient_data_realistic.csv", index=False)
print("Realistic synthetic patient data generated: data/patient_data_realistic.csv")
