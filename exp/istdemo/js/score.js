function getImageInfo(path) {
    const fileName = getImageName(path);

    const [col, pat, shp] = fileName.split("_");

    return { col, pat, shp };
}

function calculateImageScore(path) {
    const { col, pat, shp } = getImageInfo(path);

    return (
        colorScore[col] +
        patternScore[pat] +
        shapeScore[shp]
    );
}

function calculateScore(path, position) {
    return (
        calculateImageScore(path) +
        positionScore[position]
    );
}

function shouldHideFeedback(path) {

    const playerID = Number(getPlayerID());

    const mod = playerID % PLAYER_MOD_BASE;

    const rule =
        hiddenFeedbackRuleByPlayerMod[mod];

    const { col, pat, shp } =
        getImageInfo(path);

    return (
        rule.COL.includes(col) ||
        rule.PAT.includes(pat) ||
        rule.SHP.includes(shp)
    );
}

function formatScore(score) {
    return score >= 0
        ? `+${score}`
        : `${score}`;
}