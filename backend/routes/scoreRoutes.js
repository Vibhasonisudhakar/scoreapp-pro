const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    calculateScore,
    getMethodology,
    getScenarioReport,
    getDistribution,
} = require("../controllers/scoreController");

router.post("/calculate", auth, calculateScore);
router.get("/methodology", auth, getMethodology);
router.get("/report/scenarios", auth, getScenarioReport);
router.get("/distribution", auth, getDistribution);

module.exports = router;