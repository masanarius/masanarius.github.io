// =========================
// Parameters
// =========================

const COL = ["amb", "blu", "cob", "grn", "yel"];
const PAT = ["dot", "grd", "str"];
const SHP = ["cir", "pnt", "tri", "squ"];

const MAX_TRIAL = 30;
const SHOW_TOTAL_SCORE = true;
const REFRESH_SCORE = 0;

// Player ID % X
const PLAYER_MOD_BASE = 4;

// =========================
// Google Forms
// =========================

const ENABLE_GOOGLE_FORMS = true;

const GOOGLE_FORM_ACTION_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSe6judp3oDNOHDpBNW22eaB9JiwuvnuwCBJ8tvHWUiOdhFqmw/formResponse";

const FORM_ENTRIES = {
    time: "entry.1571500214",
    session_id: "entry.1437906042",
    player_id: "entry.1675133863",
    trial: "entry.1673476348",
    refreshing: "entry.1384988083",
    event: "entry.2001340447",

    l_img: "entry.1538485900",
    c_img: "entry.1353722818",
    r_img: "entry.40212684",

    l_img_pts: "entry.103761169",
    c_img_pts: "entry.1387556079",
    r_img_pts: "entry.1571065213",

    l_pos_pts: "entry.1984614365",
    c_pos_pts: "entry.1602656512",
    r_pos_pts: "entry.891595214",

    l_sum_pts: "entry.782728472",
    c_sum_pts: "entry.1810463804",
    r_sum_pts: "entry.2121136899",

    selected_img: "entry.1193759899",
    selected_pos: "entry.1916842762",
    selected_img_pts: "entry.1382321511",
    selected_pos_pts: "entry.1313096228",
    delta_score: "entry.333867801",
    total_score: "entry.453560264"
};

// =========================
// State
// =========================

let currentTrial = 0;
let totalScore = 0;
let refreshCountInTrial = 0;

const imageList = [];
let currentImages = [];

// =========================
// Scores
// =========================

const colorScore = {
    grn: -1,
    blu: 0,
    yel: 1,
    cob: 1,
    amb: 0
};

const shapeScore = {
    tri: -1,
    cir: 0,
    squ: 1,
    pnt: 0
};

const patternScore = {
    str: 1,
    dot: -1,
    grd: 0
};

const positionScore = {
    left: 0,
    center: 2,
    right: 0
};

const positionNames = ["left", "center", "right"];
const positionNamesForLog = ["LEFT", "CENTER", "RIGHT"];

const shapeScale = {
    cir: 1.00,
    tri: 1.15,
    squ: 0.95,
    pnt: 1.30
};

// Player ID % 4 ごとの非表示ルール
const hiddenRuleByPlayerMod = {
    0: {
        COL: ["cob", "amb"],
        SHP: ["cir"],
        PAT: []
    },
    1: {
        COL: ["cob", "amb"],
        SHP: ["pnt"],
        PAT: []
    },
    2: {
        COL: ["yel", "blu"],
        SHP: ["cir"],
        PAT: []
    },
    3: {
        COL: ["yel", "blu"],
        SHP: ["pnt"],
        PAT: []
    }
};

// Player ID % 4 ごとの「得点表示を ? にする」ルール
const hiddenFeedbackRuleByPlayerMod = {
    0: {
        COL: [],
        PAT: ["str"],
        SHP: []
    },
    1: {
        COL: [],
        PAT: ["dot"],
        SHP: []
    },
    2: {
        COL: [],
        PAT: [],
        SHP: ["tri"]
    },
    3: {
        COL: [],
        PAT: [],
        SHP: ["squ"]
    }
};

// =========================
// Initialize Selects
// =========================

function initializeSelects() {
    const sessionSelect = document.getElementById("sessionSelect");
    const playerSelect = document.getElementById("playerSelect");

    const defaultSessionOption = document.createElement("option");
    defaultSessionOption.value = "";
    defaultSessionOption.textContent = "選択";
    defaultSessionOption.selected = true;
    defaultSessionOption.disabled = true;
    sessionSelect.appendChild(defaultSessionOption);

    const defaultPlayerOption = document.createElement("option");
    defaultPlayerOption.value = "";
    defaultPlayerOption.textContent = "選択";
    defaultPlayerOption.selected = true;
    defaultPlayerOption.disabled = true;
    playerSelect.appendChild(defaultPlayerOption);

    for (let i = 1; i <= 20; i++) {
        const sessionOption = document.createElement("option");
        sessionOption.value = i;
        sessionOption.textContent = i;
        sessionSelect.appendChild(sessionOption);

        const playerOption = document.createElement("option");
        playerOption.value = i;
        playerOption.textContent = i;
        playerSelect.appendChild(playerOption);
    }
}

function lockSessionID() {
    const select = document.getElementById("sessionSelect");

    if (select.value === "") {
        return;
    }

    select.disabled = true;
    select.classList.add("bg-gray-200");

    startGameIfReady();
}

function lockPlayerID() {
    const select = document.getElementById("playerSelect");

    if (select.value === "") {
        return;
    }

    select.disabled = true;
    select.classList.add("bg-gray-200");

    startGameIfReady();
}

// =========================
// Game Start
// =========================

function isReadyToStart() {
    const sessionSelect = document.getElementById("sessionSelect");
    const playerSelect = document.getElementById("playerSelect");

    return (
        sessionSelect.disabled &&
        playerSelect.disabled &&
        sessionSelect.value !== "" &&
        playerSelect.value !== ""
    );
}

function startGameIfReady() {
    if (!isReadyToStart()) {
        return;
    }

    if (currentImages.length === 0) {
        rebuildImageList();
        setRandomImages();
    }
}

function showNotReadyMessage() {
    alert("Session ID と Player ID を設定してください");
}

// =========================
// UI
// =========================

function updateTrialCounter() {
    const counter = document.getElementById("trialCounter");
    counter.textContent = `Trial ${currentTrial}/${MAX_TRIAL}`;
}

function updateTotalScoreArea() {
    const scoreArea = document.getElementById("totalScoreArea");

    if (!SHOW_TOTAL_SCORE) {
        scoreArea.classList.add("hidden");
        return;
    }

    scoreArea.classList.remove("hidden");
    scoreArea.textContent = `Score ${totalScore}`;
}

function hideImages() {
    ["img1", "img2", "img3"].forEach((id) => {
        const img = document.getElementById(id);

        img.removeAttribute("src");
        img.classList.add("hidden");
    });
}

// =========================
// Image Utility
// =========================

function rebuildImageList() {
    imageList.length = 0;

    const playerID = Number(getPlayerID());

    if (!playerID) {
        return;
    }

    const mod = playerID % PLAYER_MOD_BASE;
    const rule = hiddenRuleByPlayerMod[mod] || {
        COL: [],
        SHP: [],
        PAT: []
    };

    for (const col of COL) {
        for (const pat of PAT) {
            for (const shp of SHP) {
                if (rule.COL.includes(col)) {
                    continue;
                }

                if (rule.PAT.includes(pat)) {
                    continue;
                }

                if (rule.SHP.includes(shp)) {
                    continue;
                }

                imageList.push(`images/${col}_${pat}_${shp}.png`);
            }
        }
    }
}

function getRandomImages(list, count) {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function getImageName(path) {
    return path.split("/").pop().replace(".png", "");
}

function getImageInfo(path) {
    const fileName = getImageName(path);
    const [col, pat, shp] = fileName.split("_");

    return { col, pat, shp };
}

function calculateImageScore(path) {
    const { col, pat, shp } = getImageInfo(path);

    return colorScore[col] + patternScore[pat] + shapeScore[shp];
}

function calculateScore(path, position) {
    return calculateImageScore(path) + positionScore[position];
}

function shouldHideFeedback(path) {
    const playerID = Number(getPlayerID());
    const mod = playerID % PLAYER_MOD_BASE;

    const rule = hiddenFeedbackRuleByPlayerMod[mod] || {
        COL: [],
        PAT: [],
        SHP: []
    };

    const { col, pat, shp } = getImageInfo(path);

    return (
        rule.COL.includes(col) ||
        rule.PAT.includes(pat) ||
        rule.SHP.includes(shp)
    );
}

function formatScore(score) {
    return score >= 0 ? `+${score}` : `${score}`;
}

// =========================
// User Info
// =========================

function getCurrentTrialNumber() {
    return currentTrial + 1;
}

function getSessionID() {
    return document.getElementById("sessionSelect").value;
}

function getPlayerID() {
    return document.getElementById("playerSelect").value;
}

// =========================
// Google Forms
// =========================

function sendLogToGoogleForms(logData) {
    if (!ENABLE_GOOGLE_FORMS) return;

    const formData = new FormData();

    Object.keys(logData).forEach((key) => {
        const entryID = FORM_ENTRIES[key];

        if (entryID) {
            formData.append(entryID, logData[key]);
        }
    });

    fetch(GOOGLE_FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
    });
}

function createLogData(eventType, selectedIndex, deltaScore) {
    const leftPath = currentImages[0];
    const centerPath = currentImages[1];
    const rightPath = currentImages[2];

    const imgPts = [
        calculateImageScore(leftPath),
        calculateImageScore(centerPath),
        calculateImageScore(rightPath)
    ];

    const posPts = [
        positionScore.left,
        positionScore.center,
        positionScore.right
    ];

    const sumPts = [
        imgPts[0] + posPts[0],
        imgPts[1] + posPts[1],
        imgPts[2] + posPts[2]
    ];

    return {
        time: new Date().toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo"
        }),

        session_id: getSessionID(),
        player_id: getPlayerID(),

        trial: getCurrentTrialNumber(),
        refreshing: refreshCountInTrial,

        event: eventType,

        l_img: getImageName(leftPath),
        c_img: getImageName(centerPath),
        r_img: getImageName(rightPath),

        l_img_pts: imgPts[0],
        c_img_pts: imgPts[1],
        r_img_pts: imgPts[2],

        l_pos_pts: posPts[0],
        c_pos_pts: posPts[1],
        r_pos_pts: posPts[2],

        l_sum_pts: sumPts[0],
        c_sum_pts: sumPts[1],
        r_sum_pts: sumPts[2],

        selected_img:
            eventType === "REFRESH"
                ? "REFRESH"
                : getImageName(currentImages[selectedIndex]),

        selected_pos:
            eventType === "REFRESH"
                ? "REFRESH"
                : positionNamesForLog[selectedIndex],

        selected_img_pts:
            eventType === "REFRESH"
                ? REFRESH_SCORE
                : imgPts[selectedIndex],

        selected_pos_pts:
            eventType === "REFRESH"
                ? 0
                : posPts[selectedIndex],

        delta_score: deltaScore,
        total_score: totalScore
    };
}

// =========================
// Set Images
// =========================

function setRandomImages() {
    currentImages = getRandomImages(imageList, 3);

    const imageIDs = ["img1", "img2", "img3"];
    const scoreIDs = ["score1", "score2", "score3"];

    currentImages.forEach((path, index) => {
        const img = document.getElementById(imageIDs[index]);
        const popup = document.getElementById(scoreIDs[index]);

        const { shp } = getImageInfo(path);

        img.src = path;
        img.classList.remove("hidden");

        const scale = shapeScale[shp] || 1.0;
        const baseSize = 72;

        img.style.maxWidth = `${baseSize}%`;
        img.style.maxHeight = `${baseSize}%`;
        img.style.transform = `scale(${scale})`;
        img.style.transition = "transform 0.2s";

        popup.classList.add("hidden");
    });
}

// =========================
// Refresh
// =========================

function refreshImages() {
    if (!isReadyToStart()) {
        showNotReadyMessage();
        return;
    }

    if (currentTrial >= MAX_TRIAL) {
        return;
    }

    refreshCountInTrial++;

    totalScore += REFRESH_SCORE;
    updateTotalScoreArea();

    const logData = createLogData("REFRESH", null, REFRESH_SCORE);
    sendLogToGoogleForms(logData);

    setRandomImages();
}

// =========================
// Select Image
// =========================

function selectImage(index) {
    if (!isReadyToStart()) {
        showNotReadyMessage();
        return;
    }

    if (currentTrial >= MAX_TRIAL) {
        return;
    }

    const path = currentImages[index];
    const position = positionNames[index];

    const score = calculateScore(path, position);

    totalScore += score;
    updateTotalScoreArea();

    const logData = createLogData("SELECT", index, score);
    sendLogToGoogleForms(logData);

    const popup = document.getElementById(`score${index + 1}`);
    const textBox = popup.firstElementChild;

    textBox.textContent = shouldHideFeedback(path)
        ? "?"
        : formatScore(score);

    popup.classList.remove("hidden");

    currentTrial++;
    updateTrialCounter();

    setTimeout(() => {
        popup.classList.add("hidden");

        refreshCountInTrial = 0;

        if (currentTrial < MAX_TRIAL) {
            setRandomImages();
        } else {
            alert("Finished!");
        }
    }, 700);
}

// =========================
// Tabs
// =========================

function showTab(tab) {
    const mainTab = document.getElementById("mainTab");
    const historyTab = document.getElementById("historyTab");

    const mainContent = document.getElementById("mainContent");
    const historyContent = document.getElementById("historyContent");

    if (tab === "main") {
        mainContent.classList.remove("hidden");
        historyContent.classList.add("hidden");

        mainTab.className =
            "border-b-2 border-blue-600 px-4 py-2 font-semibold text-blue-600";

        historyTab.className =
            "border-b-2 border-transparent px-4 py-2 font-semibold text-gray-500";
    } else {
        mainContent.classList.add("hidden");
        historyContent.classList.remove("hidden");

        mainTab.className =
            "border-b-2 border-transparent px-4 py-2 font-semibold text-gray-500";

        historyTab.className =
            "border-b-2 border-blue-600 px-4 py-2 font-semibold text-blue-600";
    }
}

// =========================
// Initial
// =========================

initializeSelects();
updateTrialCounter();
updateTotalScoreArea();
hideImages();