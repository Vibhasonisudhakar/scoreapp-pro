const express = require("express");
const router = express.Router();
const { calculateScore } = require("../controllers/scoreController");

router.post("/calculate", calculateScore);

module.exports = router;