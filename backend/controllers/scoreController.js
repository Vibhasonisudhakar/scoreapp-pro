const criteria = [
  {
    id: "leadership",
    title: "Leadership and Governance",
    description: "Clarity of vision, accountability, and strategic alignment.",
    weight: 0.22,
  },
  {
    id: "people",
    title: "People and Capability",
    description: "Talent development, engagement, and succession readiness.",
    weight: 0.18,
  },
  {
    id: "innovation",
    title: "Innovation and Improvement",
    description: "Continuous improvement, innovation pipeline, and adaptation.",
    weight: 0.2,
  },
  {
    id: "operations",
    title: "Operational Excellence",
    description: "Process reliability, delivery performance, and quality outcomes.",
    weight: 0.2,
  },
  {
    id: "customer",
    title: "Customer and Stakeholder Value",
    description: "Customer experience, stakeholder trust, and value creation.",
    weight: 0.2,
  },
];

const maxRating = 5;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getBand(score) {
  if (score >= 85) {
    return {
      label: "Excellency Leader",
      summary: "High maturity with repeatable and scalable excellence practices.",
    };
  }

  if (score >= 70) {
    return {
      label: "Strong Performer",
      summary: "Consistent delivery with clear opportunities to optimize outcomes.",
    };
  }

  if (score >= 55) {
    return {
      label: "Progressing",
      summary: "Core foundations exist, but major capability gaps still impact results.",
    };
  }

  return {
    label: "Needs Attention",
    summary: "Priority transformation needed across key excellence enablers.",
  };
}

function computeScore(responses = {}) {
  const breakdown = criteria.map((criterion) => {
    const rawRating = Math.max(0, Math.min(maxRating, toNumber(responses[criterion.id])));
    const normalized = rawRating / maxRating;
    const weightedScore = Number((normalized * criterion.weight * 100).toFixed(2));

    return {
      ...criterion,
      rating: rawRating,
      weightedScore,
    };
  });

  const score = Number(
    breakdown.reduce((sum, item) => sum + item.weightedScore, 0).toFixed(2)
  );
  const band = getBand(score);
  const lowestAreas = [...breakdown]
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 2)
    .map((item) => item.title);

  return {
    score,
    band: band.label,
    summary: band.summary,
    strengths: breakdown
      .filter((item) => item.rating >= 4)
      .map((item) => item.title),
    focusAreas: lowestAreas,
    breakdown,
  };
}

const sampleScenarios = [
  {
    name: "Public Service Accelerator",
    responses: { leadership: 5, people: 4, innovation: 4, operations: 4, customer: 5 },
  },
  {
    name: "Emerging Growth Organization",
    responses: { leadership: 3, people: 3, innovation: 4, operations: 3, customer: 4 },
  },
  {
    name: "Transformation Recovery Program",
    responses: { leadership: 2, people: 2, innovation: 3, operations: 2, customer: 2 },
  },
  {
    name: "Service Reliability Initiative",
    responses: { leadership: 4, people: 3, innovation: 3, operations: 5, customer: 4 },
  },
  {
    name: "Customer Experience Uplift",
    responses: { leadership: 3, people: 4, innovation: 4, operations: 3, customer: 5 },
  },
  {
    name: "Capability Building Pilot",
    responses: { leadership: 2, people: 4, innovation: 3, operations: 2, customer: 3 },
  },
];

exports.calculateScore = (req, res) => {
  const { organizationName = "Organization", responses = {} } = req.body;

  const assessment = computeScore(responses);
  res.json({
    organizationName,
    assessedAt: new Date().toISOString(),
    ...assessment,
  });
};

exports.getMethodology = (req, res) => {
  res.json({
    scale: {
      min: 0,
      max: maxRating,
      description: "Each criterion is rated from 0 to 5 and converted into a weighted 100-point score.",
    },
    criteria,
    bands: [
      { min: 85, max: 100, label: "Excellency Leader" },
      { min: 70, max: 84.99, label: "Strong Performer" },
      { min: 55, max: 69.99, label: "Progressing" },
      { min: 0, max: 54.99, label: "Needs Attention" },
    ],
  });
};

exports.getScenarioReport = (req, res) => {
  const report = sampleScenarios.map((scenario) => {
    const assessment = computeScore(scenario.responses);
    return {
      scenario: scenario.name,
      score: assessment.score,
      band: assessment.band,
      focusAreas: assessment.focusAreas,
    };
  });

  res.json({
    generatedAt: new Date().toISOString(),
    scenarios: report,
  });
};

exports.getDistribution = (req, res) => {
  const scenarios = sampleScenarios.map((scenario) => ({
    scenario: scenario.name,
    ...computeScore(scenario.responses),
  }));

  const buckets = {
    "0-54": 0,
    "55-69": 0,
    "70-84": 0,
    "85-100": 0,
  };

  scenarios.forEach((item) => {
    if (item.score >= 85) buckets["85-100"] += 1;
    else if (item.score >= 70) buckets["70-84"] += 1;
    else if (item.score >= 55) buckets["55-69"] += 1;
    else buckets["0-54"] += 1;
  });

  res.json({
    totalSamples: scenarios.length,
    buckets,
    scenarioScores: scenarios.map((item) => ({
      scenario: item.scenario,
      score: item.score,
      band: item.band,
    })),
  });
};
