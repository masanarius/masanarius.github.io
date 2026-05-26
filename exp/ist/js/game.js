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

    if (!isReadyToStart()) {
        return;
    }

    refreshCountInTrial++;

    totalScore += REFRESH_SCORE;

    updateTotalScoreArea();

    setRandomImages();
}

function selectImage(index) {

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

    updateTrialCounter();

    setTimeout(() => {

        popup.classList.add("hidden");

        refreshCountInTrial = 0;

        if (currentTrial < MAX_TRIAL) {
            setRandomImages();
        }

    }, 700);
}