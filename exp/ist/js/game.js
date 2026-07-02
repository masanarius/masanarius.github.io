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