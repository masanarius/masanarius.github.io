function isReadyToStart() {

    return (
        document.getElementById("sessionSelect").disabled &&
        document.getElementById("playerSelect").disabled
    );
}

function startGameIfReady() {

    if (!isReadyToStart()) {
        return;
    }

    rebuildImageList();

    setRandomImages();
}

function getSessionID() {
    return document
        .getElementById("sessionSelect")
        .value;
}

function getPlayerID() {
    return document
        .getElementById("playerSelect")
        .value;
}

function refreshImages() {

    if (isRefreshCoolingDown) {
        return;
    }

    if (!ENABLE_REFRESH_DURING_SELECT_COOLDOWN &&
        isSelectCoolingDown) {
        return;
    }

    if (!isReadyToStart()) {
        return;
    }

    startRefreshCooldown();

    refreshCountInTrial++;

    totalScore += REFRESH_SCORE;

    updateTotalScoreArea();

    setRandomImages();

    saveGameState();
}

function selectImage(index) {

    if (isSelectCoolingDown) {
        return;
    }

    if (!isReadyToStart()) {
        return;
    }

    if (currentTrial >= MAX_TRIAL) {
        return;
    }

    const path = currentImages[index];

    const imageName =
        getImageName(path);

    const { col, pat, shp } =
        getImageInfo(path);

    const position =
        positionNames[index];

    const score =
        calculateScore(path, position);

    totalScore += score;

    updateTotalScoreArea();

    const popup =
        document.getElementById(`score${index + 1}`);

    const textBox =
        popup.firstElementChild;

    textBox.textContent =
        shouldHideFeedback(path)
            ? "?"
            : formatScore(score);

    popup.classList.remove("hidden");

    sendLogToGoogleForms({
        time: new Date().toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo"
        }),

        session_id: getSessionID(),
        player_id: getPlayerID(),
        trial: currentTrial + 1,
        refreshing: refreshCountInTrial,
        event: "SELECT",

        l_img: getImageName(currentImages[0]),
        c_img: getImageName(currentImages[1]),
        r_img: getImageName(currentImages[2]),

        l_img_pts: calculateImageScore(currentImages[0]),
        c_img_pts: calculateImageScore(currentImages[1]),
        r_img_pts: calculateImageScore(currentImages[2]),

        l_pos_pts: positionScore.left,
        c_pos_pts: positionScore.center,
        r_pos_pts: positionScore.right,

        l_sum_pts: calculateScore(currentImages[0], "left"),
        c_sum_pts: calculateScore(currentImages[1], "center"),
        r_sum_pts: calculateScore(currentImages[2], "right"),

        selected_img: imageName,
        selected_pos: position,

        selected_img_shape: shp,
        selected_img_color: col,
        selected_img_pattern: pat,

        selected_img_shape_pts: shapeScore[shp],
        selected_img_color_pts: colorScore[col],
        selected_img_pattern_pts: patternScore[pat],

        selected_img_pts: calculateImageScore(path),
        selected_pos_pts: positionScore[position],
        delta_score: score,
        total_score: totalScore
    });

    historyData.push({
        trial: currentTrial + 1,
        image: imageName
    });

    addHistoryRow(
        currentTrial + 1,
        imageName
    );

    currentTrial++;

    startSelectCooldown();

    updateTrialCounter();

    setTimeout(() => {

        popup.classList.add("hidden");

        refreshCountInTrial = 0;

        if (currentTrial < MAX_TRIAL) {
            setRandomImages();
            saveGameState();
        } else {
            clearGameState();
        }

    }, 700);
}

function resetGame() {

    clearGameState();

    location.reload();
}

function startSelectCooldown() {

    isSelectCoolingDown = true;

    cooldownRemainingSec =
        SELECT_COOLDOWN_SEC;

    updateCooldownArea();
    updateRefreshButton();

    if (cooldownTimer) {
        clearInterval(cooldownTimer);
    }

    cooldownTimer = setInterval(() => {

        cooldownRemainingSec--;

        updateCooldownArea();

        if (cooldownRemainingSec <= 0) {

            clearInterval(cooldownTimer);

            cooldownTimer = null;

            isSelectCoolingDown = false;

            updateCooldownArea();
            updateRefreshButton();
        }

    }, 1000);
}

function startRefreshCooldown() {

    isRefreshCoolingDown = true;

    refreshCooldownRemainingSec =
        REFRESH_COOLDOWN_SEC;

    updateRefreshButton();

    if (refreshCooldownTimer) {
        clearInterval(refreshCooldownTimer);
    }

    refreshCooldownTimer = setInterval(() => {

        refreshCooldownRemainingSec--;

        updateRefreshButton();

        if (refreshCooldownRemainingSec <= 0) {

            clearInterval(refreshCooldownTimer);

            refreshCooldownTimer = null;

            isRefreshCoolingDown = false;

            updateRefreshButton();
        }

    }, 1000);
}