import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "";
const api = `${apiBaseUrl.replace(/\/$/, "")}/api/score`;

const defaultResponses = {
  leadership: 3,
  people: 3,
  innovation: 3,
  operations: 3,
  customer: 3,
};

const navigationItems = [
  { label: "Overview", detail: "Live assessment" },
  { label: "Results", detail: "Score breakdown" },
  { label: "Scenarios", detail: "What-if analysis" },
  { label: "Distribution", detail: "Maturity spread" },
];

function Dashboard({ token, onLogout }) {
  const [organizationName, setOrganizationName] = useState("Al Noor Services");
  const [methodology, setMethodology] = useState(null);
  const [responses, setResponses] = useState(defaultResponses);
  const [assessment, setAssessment] = useState(null);
  const [scenarioReport, setScenarioReport] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const authConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [methodologyRes, scenariosRes, distributionRes] = await Promise.all([
          axios.get(`${api}/methodology`, authConfig),
          axios.get(`${api}/report/scenarios`, authConfig),
          axios.get(`${api}/distribution`, authConfig),
        ]);

        setMethodology(methodologyRes.data);
        setScenarioReport(scenariosRes.data.scenarios || []);
        setDistribution(distributionRes.data);
        setError("");
      } catch (loadError) {
        if (loadError.response?.status === 401) {
          onLogout();
          return;
        }

        setError("Unable to load assessment data. Check deployed backend URL configuration.");
      }
    };

    loadData();
  }, [token, onLogout]);

  const orderedCriteria = useMemo(
    () => methodology?.criteria || [],
    [methodology]
  );

  const previewScore = useMemo(() => {
    if (!orderedCriteria.length) {
      return 0;
    }

    const total = orderedCriteria.reduce((sum, criterion) => {
      const rating = Number(responses[criterion.id] || 0);
      return sum + ((rating / 5) * criterion.weight * 100);
    }, 0);

    return Number(total.toFixed(1));
  }, [orderedCriteria, responses]);

  const completionRate = useMemo(() => {
    if (!orderedCriteria.length) {
      return 0;
    }

    const rated = orderedCriteria.filter((criterion) => Number(responses[criterion.id] || 0) > 0).length;
    return Math.round((rated / orderedCriteria.length) * 100);
  }, [orderedCriteria, responses]);

  const handleSliderChange = (id, value) => {
    setResponses((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const runAssessment = async () => {
    try {
      const { data } = await axios.post(`${api}/calculate`, {
        organizationName,
        responses,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssessment(data);
      setError("");
    } catch (runError) {
      setError("Assessment failed. Please verify backend is reachable.");
    }
  };

  const downloadSpreadsheet = (format = "xlsx") => {
    if (!methodology?.criteria?.length) {
      return;
    }

    const data = [
      {
        "Criterion ID": "criterion_id",
        "Title": "criterion_title",
        "Weight (%)": "weight_pct",
        "Max Rating": "max_rating",
        "Your Rating": "your_rating",
        "Weighted Points": "weighted_points",
      },
    ];

    methodology.criteria.forEach((criterion) => {
      const yourRating = responses[criterion.id] || 0;
      const weightedPoints = ((yourRating / 5) * criterion.weight * 100).toFixed(2);
      data.push({
        "Criterion ID": criterion.id,
        "Title": criterion.title,
        "Weight (%)": (criterion.weight * 100).toFixed(1),
        "Max Rating": 5,
        "Your Rating": yourRating,
        "Weighted Points": parseFloat(weightedPoints),
      });
    });

    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, "Scoring Data");
      XLSX.writeFile(wb, `scoreapp_assessment_${new Date().toISOString().split("T")[0]}.xlsx`);
    } else {
      const rows = [
        "Criterion ID,Title,Weight (%),Max Rating,Your Rating,Weighted Points",
      ];
      data.slice(1).forEach((row) => {
        rows.push(
          `${row["Criterion ID"]},${row["Title"]},${row["Weight (%):"]},${row["Max Rating"]},${row["Your Rating"]},${row["Weighted Points"]}`
        );
      });
      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `scoreapp_assessment_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>Score</span>App Studio
        </div>

        <div className="sidebar-nav">
          <p className="sidebar-nav-section">Workspace</p>
          {navigationItems.map((item, index) => (
            <div key={item.label} className={`nav-item ${index === 0 ? "active" : ""}`}>
              <div className="nav-copy">
                <span className="nav-title">{item.label}</span>
                <span className="nav-detail">{item.detail}</span>
              </div>
            </div>
          ))}

          <p className="sidebar-nav-section">Live Metrics</p>
          <div className="sidebar-spotlight">
            <span className="sidebar-spotlight-label">Composite score</span>
            <strong>{assessment?.score ?? previewScore}</strong>
            <p>Real-time scoring from weighted criteria and scenario analysis.</p>
          </div>

          <div className="sidebar-spotlight compact">
            <span className="sidebar-spotlight-label">Assessment progress</span>
            <strong>{completionRate}%</strong>
            <p>{assessment?.band || "Awaiting evaluation"}</p>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div>
            <p className="topbar-kicker">Public demo workspace</p>
            <div className="topbar-title">ScoreApp Studio</div>
          </div>

          <div className="topbar-actions">
            <div className="user-profile">
              <div className="avatar">SA</div>
              <div>
                <strong>Demo access</strong>
                <span>Hosted public build</span>
              </div>
            </div>
            <button className="btn ghost" onClick={onLogout}>Logout</button>
          </div>
        </header>

        <main className="content-area app-shell">
          <section className="hero">
            <div className="hero-top-row">
              <p className="kicker">Project 1 - ScoreApp Assessment</p>
              <button className="btn ghost" onClick={onLogout}>Logout</button>
            </div>
            <h1>SA Excellency Model Interactive Assessment</h1>
            <p className="subtext">
              Rate your organization across key excellence metrics, then generate personalized
              results, scenario analysis, and score distribution insights.
            </p>
            <div className="score-strip">
              <article className="score-tile">
                <p>Live Composite Score</p>
                <strong>{assessment?.score ?? previewScore}</strong>
              </article>
              <article className="score-tile">
                <p>Assessment Progress</p>
                <strong>{completionRate}%</strong>
              </article>
              <article className="score-tile">
                <p>Current Band</p>
                <strong>{assessment?.band || "Awaiting evaluation"}</strong>
              </article>
            </div>
            <div className="journey-nav" aria-label="Assessment journey">
              <span className="active">Assessment</span>
              <span>Results</span>
              <span>Scenarios</span>
              <span>Distribution</span>
            </div>
          </section>

          {error && <div className="error-banner">{error}</div>}

          <section className="panel methodology-panel">
            <div>
              <p className="kicker">Scoring Method</p>
              <h2>Weighted Excellency Framework</h2>
              <p className="subtext">
                Every criterion is rated from 0 to 5, normalized by weight, and rolled into a
                100-point maturity score that maps to an excellence band.
              </p>
            </div>
            <div className="methodology-badges">
              {(methodology?.bands || []).map((band) => (
                <span key={band.label}>{band.label}</span>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-header-row">
              <h2>1. Assessment Inputs</h2>
              <span className="step-chip">Step 1 of 4</span>
            </div>
            <label className="field-label">
              Organization Name
              <input
                className="text-input"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                placeholder="Enter organization name"
              />
            </label>

            <div className="criteria-grid">
              {orderedCriteria.map((criterion) => (
                <article key={criterion.id} className="criterion-card">
                  <h3>{criterion.title}</h3>
                  <p>{criterion.description}</p>
                  <p className="meta">Weight: {(criterion.weight * 100).toFixed(0)}%</p>
                  <label className="rating-row">
                    Rating: <strong>{responses[criterion.id] ?? 0}</strong> / 5
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={responses[criterion.id] ?? 0}
                      onChange={(event) => handleSliderChange(criterion.id, event.target.value)}
                    />
                  </label>
                </article>
              ))}
            </div>

            <div className="actions">
              <button className="btn primary" onClick={runAssessment}>
                Calculate Score
              </button>
              <button className="btn ghost" onClick={() => downloadSpreadsheet("xlsx")}>
                ⬇ Download as Excel
              </button>
              <button className="btn ghost" onClick={() => downloadSpreadsheet("csv")}>
                ⬇ Download as CSV
              </button>
            </div>
          </section>

          {assessment && (
            <section className="panel result-panel">
              <div className="section-header-row">
                <h2>2. Personalized Result Page</h2>
                <span className="step-chip">Step 2 of 4</span>
              </div>
              <div className="result-headline">
                <div>
                  <p className="kicker">{assessment.organizationName}</p>
                  <h3>{assessment.band}</h3>
                  <p>{assessment.summary}</p>
                </div>
                <div className="score-badge">{assessment.score}/100</div>
              </div>

              <div className="chips">
                <span>Strengths: {assessment.strengths?.join(", ") || "None yet"}</span>
                <span>Focus Areas: {assessment.focusAreas?.join(", ") || "None"}</span>
              </div>

              <div className="bars">
                {assessment.breakdown?.map((item) => (
                  <div key={item.id} className="bar-row">
                    <label>{item.title}</label>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${item.weightedScore}%` }}
                      />
                    </div>
                    <span>{item.weightedScore.toFixed(1)} pts</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="panel">
            <div className="section-header-row">
              <h2>3. Scenario Evaluation Report</h2>
              <span className="step-chip">Step 3 of 4</span>
            </div>
            <div className="report-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Scenario</th>
                    <th>Score</th>
                    <th>Band</th>
                    <th>Primary Focus Areas</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioReport.map((row) => (
                    <tr key={row.scenario}>
                      <td>{row.scenario}</td>
                      <td>{row.score}</td>
                      <td>{row.band}</td>
                      <td>{(row.focusAreas || []).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {distribution && (
            <section className="panel">
              <div className="section-header-row">
                <h2>4. Score Distribution Visualization</h2>
                <span className="step-chip">Step 4 of 4</span>
              </div>
              <div className="distribution-chart">
                {Object.entries(distribution.buckets || {}).map(([bucket, count]) => {
                  const max = Math.max(...Object.values(distribution.buckets), 1);
                  const ratio = (count / max) * 100;

                  return (
                    <div key={bucket} className="dist-bar-row">
                      <span>{bucket}</span>
                      <div className="dist-track">
                        <div className="dist-fill" style={{ width: `${ratio}%` }} />
                      </div>
                      <strong>{count}</strong>
                    </div>
                  );
                })}
              </div>
              <p className="meta">Sample size: {distribution.totalSamples}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;