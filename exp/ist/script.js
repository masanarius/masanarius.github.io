// =========================
// Parameters
// =========================

const COL = ["amb", "blu", "cob", "grn", "yel"];
const PAT = ["dot", "grd", "str"];
const SHP = ["cir", "pnt", "tri", "squ"];

// 試行回数
const MAX_TRIAL = 30;

// 合計点エリアを表示するか
const SHOW_TOTAL_SCORE = true;

// =========================
// Trial / Score
// =========================

let currentTrial = 0;
let totalScore = 0;

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

// =========================
// Shape Scale
// =========================

const shapeScale = {
    cir: 1.00,
    tri: 1.15,
    squ: 0.95,
    pnt: 1.30
};

// =========================
// Generate Image List
// =========================

const imageList = [];
let currentImages = [];

for (const col of COL) {
    for (const pat of PAT) {
        for (const shp of SHP) {
            imageList.push(`images/${col}_${pat}_${shp}.png`);
        }
    }
}

// =========================
// Initialize Selects
// =========================

function initializeSelects() {
    const sessionSelect = document.getElementById("sessionSelect");
    const playerSelect = document.getElementById("playerSelect");

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

    select.disabled = true;
    select.classList.add("bg-gray-200");
}

function lockPlayerID() {
    const select = document.getElementById("playerSelect");

    select.disabled = true;
    select.classList.add("bg-gray-200");
}

// =========================
// Counters
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

// =========================
// Random Select
// =========================

function getRandomImages(list, count) {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// =========================
// Parse Filename
// =========================

function getImageInfo(path) {
    const fileName = path
        .split("/")
        .pop()
        .replace(".png", "");

    const [col, pat, shp] = fileName.split("_");

    return { col, pat, shp };
}

// =========================
// Score
// =========================

function calculateScore(path, position) {
    const { col, pat, shp } = getImageInfo(path);

    return (
        colorScore[col] +
        patternScore[pat] +
        shapeScore[shp] +
        positionScore[position]
    );
}

function formatScore(score) {
    return score >= 0 ? `+${score}` : `${score}`;
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
// Select Image
// =========================

function selectImage(index) {
    if (currentTrial >= MAX_TRIAL) {
        return;
    }

    const path = currentImages[index];
    const position = positionNames[index];

    const score = calculateScore(path, position);

    totalScore += score;
    updateTotalScoreArea();

    const popup = document.getElementById(`score${index + 1}`);
    const textBox = popup.firstElementChild;

    textBox.textContent = formatScore(score);
    popup.classList.remove("hidden");

    currentTrial++;
    updateTrialCounter();

    setTimeout(() => {
        popup.classList.add("hidden");

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
setRandomImages();