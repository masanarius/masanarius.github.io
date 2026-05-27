const STORAGE_KEY = "image_task_state";

// =========================
// Save
// =========================

function saveGameState() {

    const data = {

        currentTrial,
        totalScore,
        refreshCountInTrial,

        currentImages,
        historyData,

        sessionID: getSessionID(),
        playerID: getPlayerID(),

        sessionLocked:
            document.getElementById("sessionSelect").disabled,

        playerLocked:
            document.getElementById("playerSelect").disabled
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}

// =========================
// Load
// =========================

function loadGameState() {

    const raw =
        localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        return false;
    }

    const data = JSON.parse(raw);

    currentTrial =
        data.currentTrial || 0;

    totalScore =
        data.totalScore || 0;

    refreshCountInTrial =
        data.refreshCountInTrial || 0;

    currentImages =
        data.currentImages || [];

    historyData =
        data.historyData || [];

    const sessionSelect =
        document.getElementById("sessionSelect");

    if (data.sessionID) {
        sessionSelect.value =
            data.sessionID;
    }

    if (data.sessionLocked) {
        sessionSelect.disabled = true;
        sessionSelect.classList.add("bg-gray-200");
    }

    const playerSelect =
        document.getElementById("playerSelect");

    if (data.playerID) {
        playerSelect.value =
            data.playerID;
    }

    if (data.playerLocked) {
        playerSelect.disabled = true;
        playerSelect.classList.add("bg-gray-200");
    }

    // 重要：リロード後も抽選用リストを復元する
    if (data.playerID) {
        rebuildImageList();
    }

    updateTrialCounter();
    updateTotalScoreArea();

    restoreImages();
    restoreHistory();

    return true;
}

// =========================
// Restore Images
// =========================

function restoreImages() {

    if (currentImages.length === 0) {
        hideImages();
        return;
    }

    const imageIDs =
        ["img1", "img2", "img3"];

    currentImages.forEach((path, index) => {

        const img =
            document.getElementById(imageIDs[index]);

        const { shp } =
            getImageInfo(path);

        img.src = path;

        img.classList.remove("hidden");

        const scale =
            shapeScale[shp] || 1.0;

        img.style.maxWidth = "92%";
        img.style.maxHeight = "92%";
        img.style.transform =
            `scale(${scale})`;
    });
}

// =========================
// Restore History
// =========================

function restoreHistory() {

    const historyList =
        document.getElementById("historyList");

    historyList.innerHTML = "";

    [...historyData]
        .reverse()
        .forEach((item) => {

            addHistoryRow(
                item.trial,
                item.image
            );
        });
}

// =========================
// Reset
// =========================

function clearGameState() {

    localStorage.removeItem(
        STORAGE_KEY
    );
}