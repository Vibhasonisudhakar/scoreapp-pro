import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const api = `${apiBaseUrl.replace(/\/$/, "")}/api/score`;

const defaultResponses = {
  leadership: 3,
  people: 3,
  innovation: 3,
  operations: 3,
  customer: 3,
};

function Dashboard() {
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
        const [methodologyRes, scenariosRes, distributionRes] = await Promise.all([
          axios.get(`${api}/methodology`),
          axios.get(`${api}/report/scenarios`),
          axios.get(`${api}/distribution`),
        ]);

        setMethodology(methodologyRes.data);
        setScenarioReport(scenariosRes.data.scenarios || []);
        setDistribution(distributionRes.data);
        setError("");
      } catch (loadError) {
        setError("Unable to load assessment data. Check deployed backend URL configuration.");
      }
    };

    loadData();
  }, []);

  const orderedCriteria = useMemo(
    () => methodology?.criteria || [],
    [methodology]
  );

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
      });

      setAssessment(data);
      setError("");
    } catch (runError) {
      setError("Assessment failed. Please verify backend is reachable.");
    }
  };

  const downloadSpreadsheet = () => {
    if (!methodology?.criteria?.length) {
      return;
    }

    const rows = [
      "criterion_id,criterion_title,weight,max_rating,example_rating,weighted_points",
    ];

    methodology.criteria.forEach((criterion) => {
      const exampleRating = responses[criterion.id] || 0;
      const weightedPoints = ((exampleRating / 5) * criterion.weight * 100).toFixed(2);
      rows.push(
        `${criterion.id},${criterion.title},${criterion.weight},5,${exampleRating},${weightedPoints}`
      );
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scoreapp_scoring_spreadsheet.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="kicker">Project 1 - ScoreApp Assessment</p>
        <h1>SA Excellency Model Interactive Assessment</h1>
        <p className="subtext">
          Rate your organization across key excellence metrics, then generate personalized
          results, scenario analysis, and score distribution insights.
        </p>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="panel">
        <h2>1. Assessment Inputs</h2>
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
              <label>
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
          <button className="btn ghost" onClick={downloadSpreadsheet}>
            Download Scoring Spreadsheet
          </button>
        </div>
      </section>

      {assessment && (
        <section className="panel result-panel">
          <h2>2. Personalized Result Page</h2>
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
        <h2>3. Scenario Evaluation Report</h2>
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
      </section>

      {distribution && (
        <section className="panel">
          <h2>4. Score Distribution Visualization</h2>
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
  );
}

export default Dashboard;