// Dashboard Interactivity
document.addEventListener("DOMContentLoaded", function(){
    // Modal logic
    const modal = document.getElementById("newPatientModal");
    const openModalBtn = document.getElementById("newPatientBtn");
    const closeModalBtn = document.getElementById("closeModal");
    openModalBtn.onclick = () => { modal.style.display = "flex"; };
    closeModalBtn.onclick = () => { modal.style.display = "none"; };
    window.onclick = function(event) {
        if(event.target === modal) modal.style.display = "none";
    };

    // Footer quotes rotation
    const quotes = [
        "Prevention is better than cure.",
        "Early detection saves lives.",
        "Data-driven care leads to better outcomes.",
        "Care gaps can be closed with timely follow-up.",
        "AI empowers clinicians to act early."
    ];
    let quoteIdx = 0;
    setInterval(() => {
        quoteIdx = (quoteIdx+1)%quotes.length;
        document.getElementById("footerQuote").innerText = quotes[quoteIdx];
    }, 4000);

    // Risk summary update
    function updateSummary(riskScore, riskLevel, careGap) {
        const scoreElem = document.getElementById("summaryRiskScoreValue");
        const levelElem = document.getElementById("summaryRiskLevelValue");
        const gapElem = document.getElementById("summaryCareGapValue");
        scoreElem.innerText = riskScore;
        levelElem.innerText = riskLevel;
        gapElem.innerText = careGap || "None";
        // Color classes
        scoreElem.className = riskLevel.toLowerCase();
        levelElem.className = riskLevel.toLowerCase();
        gapElem.className = (careGap && careGap !== "None") ? "warning" : "none";
    }


    // Global fallback feature importance (for new user and fail-safe)
    const GLOBAL_FEATURE_IMPORTANCE = {
      "Follow-up Done": 0.40,
      "HbA1c": 0.32,
      "Cholesterol": 0.15,
      "Chronic Condition": 0.08,
      "Age": 0.05
    };

    // Render feature importance chart (always visible, two modes)
    function renderFeatureImportance(mode, backendData) {
        let features, importances, subtitle;
        if (mode === "existing" && backendData && backendData.features && backendData.importances && backendData.importances.length) {
            features = backendData.features;
            importances = backendData.importances;
            subtitle = "Feature importance derived from historical patient data.";
        } else {
            // fallback to global
            features = Object.keys(GLOBAL_FEATURE_IMPORTANCE);
            importances = Object.values(GLOBAL_FEATURE_IMPORTANCE);
            subtitle = "Feature importance reflects overall model behavior, not individual causality.";
        }
        // Normalize importances
        const total = importances.reduce((a,b) => a+b, 0);
        importances = importances.map(v => v/total);
        // Highlight top 2
        let sorted = importances.map((v,i) => ({name: features[i], value: v, idx: i})).sort((a,b) => b.value-a.value);
        let topIdxs = [sorted[0].idx, sorted[1].idx];
        let colors = importances.map((v,i) => topIdxs.includes(i) ? 'rgba(231, 76, 60, 0.8)' : 'rgba(52, 152, 219, 0.6)');
        const ctx = document.getElementById('featureChart').getContext('2d');
        if(window.featureChartInstance) window.featureChartInstance.destroy();
        window.featureChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: features,
                datasets: [{
                    label: 'Importance',
                    data: importances,
                    backgroundColor: colors
                }]
            },
            options: {
                indexAxis: 'y',
                animation: { duration: 1200 },
                scales: {
                    x: { beginAtZero: true, max: 1 }
                }
            }
        });
        // Update subtitle
        document.querySelector('.feature-card .subtitle').innerText = subtitle;
    }

    // Risk timeline chart
    let riskTimelineChart;
    function renderRiskTimeline(visits, scores) {
        const ctx = document.getElementById('riskTimeline').getContext('2d');
        if(riskTimelineChart) riskTimelineChart.destroy();
        riskTimelineChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: visits,
                datasets: [{
                    label: "Risk Score",
                    data: scores,
                    borderColor: "#E74C3C",
                    backgroundColor: "rgba(231,76,60,0.08)",
                    fill: false,
                    tension: 0.2,
                    pointRadius: 5,
                    pointBackgroundColor: scores.map(s => s > 0.7 ? '#E74C3C' : (s > 0.4 ? '#FFC107' : '#2FBF9B'))
                }]
            },
            options: {
                animation: { duration: 1200 },
                scales: { y: { min: 0, max: 1 } },
                plugins: { legend: { display: true } }
            }
        });
    }

    // Patient visit table
    function renderVisitTable(data) {
        let html = "<table><tr><th>VisitDate</th><th>HbA1c</th><th>Cholesterol</th><th>FollowUp</th><th>Outcome</th><th>RiskScore</th><th>RiskLevel</th><th>Care Gap</th></tr>";
        data.forEach(row => {
            let riskEmoji = row.RiskLevel === "High" ? "🔴" : (row.RiskLevel === "Medium" ? "🟡" : "🟢");
            let riskClass = row.RiskLevel === "High" ? "high-risk" : (row.RiskLevel === "Medium" ? "medium-risk" : "low-risk");
            html += `<tr class="${riskClass}">
                <td>${row.VisitDate}</td>
                <td>${row.HbA1c}</td>
                <td>${row.Cholesterol}</td>
                <td>${row.FollowUpDone}</td>
                <td>${row.Outcome}</td>
                <td>${riskEmoji} ${row.RiskScore.toFixed(2)}</td>
                <td>${row.RiskLevel}</td>
                <td class="${row.CareGap ? 'warning':''}">${row.CareGap}</td>
            </tr>`;
        });
        html += "</table>";
        document.getElementById("timeline").innerHTML = html;
    }

    // Existing patient analytics
    function loadPatientAnalytics(pid) {
        fetch("/get_patient_data", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({patient_id: pid})
        })
        .then(response => response.json())
        .then(data => {
            // Risk summary
            let last = data[data.length-1];
            updateSummary(last.RiskScore.toFixed(2), last.RiskLevel, last.CareGap);
            // Timeline chart
            renderRiskTimeline(data.map(r=>r.VisitDate), data.map(r=>r.RiskScore));
            // Table
            renderVisitTable(data);
            // Feature importance: try backend, fallback to global
            fetch("/feature_importance")
                .then(r => r.json())
                .then(backendData => {
                    renderFeatureImportance("existing", backendData);
                })
                .catch(() => {
                    renderFeatureImportance("existing");
                });
        });
    }

    // New patient simulation
    document.getElementById("predictBtn").onclick = function() {
        const age = document.getElementById("ageInput").value;
        const gender = document.getElementById("genderInput").value;
        const chronic = document.getElementById("chronicInput").value;
        const hbA1c = document.getElementById("hbA1cInput").value;
        const cholesterol = document.getElementById("cholesterolInput").value;
        const followup = document.getElementById("followupInput").value;
        fetch("/predict_new_user", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                Age: age,
                Gender: gender,
                ChronicCondition: chronic,
                HbA1c: hbA1c,
                Cholesterol: cholesterol,
                FollowUpDone: followup
            })
        })
        .then(response => response.json())
        .then(data => {
            modal.style.display = "none";
            // Update summary
            updateSummary(data.RiskScore, data.RiskLevel, data.CareGap);
            // Simulate timeline chart
            renderRiskTimeline(["Previous","Current"], [0.3, parseFloat(data.RiskScore)]);
            // Simulate table
            renderVisitTable([
                {VisitDate:"Current", HbA1c:hbA1c, Cholesterol:cholesterol, FollowUpDone:followup, Outcome:"-", RiskScore:parseFloat(data.RiskScore), RiskLevel:data.RiskLevel, CareGap:data.CareGap}
            ]);
            // Feature importance: always use global for new user
            renderFeatureImportance("new");
        });
    };

    // Existing patient submit
    document.getElementById("existingSubmit").onclick = function() {
        const pid = document.getElementById("patientSelect").value;
        loadPatientAnalytics(pid);
    };

    // Initial load: show first patient
    loadPatientAnalytics(document.getElementById("patientSelect").value);
});
