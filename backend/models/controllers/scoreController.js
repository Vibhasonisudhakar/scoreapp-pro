// SIMPLE scoring logic

exports.calculateScore = (req, res) => {
    const { leadership, innovation, execution } = req.body;

    let score = 0;

    score += leadership;
    score += innovation;
    score += execution;

    let result = "";

    if (score > 50) result = "Excellent";
    else if (score > 30) result = "Good";
    else result = "Needs Improvement";

    res.json({ score, result });
};