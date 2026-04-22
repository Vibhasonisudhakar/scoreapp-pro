const express = require("express");
const router = express.Router();
const {
    calculateScore,
    getMethodology,
    getScenarioReport,
    getDistribution,
} = require("../controllers/scoreController");

router.post("/calculate", calculateScore);
router.get("/methodology", getMethodology);
router.get("/report/scenarios", getScenarioReport);
router.get("/distribution", getDistribution);

module.exports = router;