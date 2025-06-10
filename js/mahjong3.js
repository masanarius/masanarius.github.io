// script.js

const scoreTable = {

    1: {
        30: { parent: { ron: 1500, tsumo: 800 }, child: { ron: 1000, tsumo: [500, 700] }, rank: "" },
        40: { parent: { ron: 2000, tsumo: 1000 }, child: { ron: 1300, tsumo: [600, 900] }, rank: "" },
        50: { parent: { ron: 2400, tsumo: 1200 }, child: { ron: 1600, tsumo: [600, 1000] }, rank: "" },
        60: { parent: { ron: 2900, tsumo: 1500 }, child: { ron: 2000, tsumo: [800, 1300] }, rank: "" },
        70: { parent: { ron: 3400, tsumo: 1700 }, child: { ron: 2300, tsumo: [900, 1500] }, rank: "" }
    },
    2: {
        20: { parent: { ron: 2000, tsumo: 1000 }, child: { ron: 1300, tsumo: [500, 900] }, rank: "平和" },
        25: { parent: { ron: 2400, tsumo: 1200 }, child: { ron: 1600, tsumo: [600, 1000] }, rank: "七対" },
        30: { parent: { ron: 2900, tsumo: 1500 }, child: { ron: 2000, tsumo: [800, 1300] }, rank: "" },
        40: { parent: { ron: 3900, tsumo: 2000 }, child: { ron: 2600, tsumo: [1100, 1700] }, rank: "" },
        50: { parent: { ron: 4800, tsumo: 2400 }, child: { ron: 3200, tsumo: [1200, 2000] }, rank: "" },
        60: { parent: { ron: 5800, tsumo: 2900 }, child: { ron: 3900, tsumo: [1500, 2500] }, rank: "" },
        70: { parent: { ron: 6800, tsumo: 3400 }, child: { ron: 4500, tsumo: [1800, 2900] }, rank: "" }
    },
    3: {
        20: { parent: { ron: 3900, tsumo: 2000 }, child: { ron: 2600, tsumo: [1100, 1700] }, rank: "平和" },
        25: { parent: { ron: 4800, tsumo: 2400 }, child: { ron: 3200, tsumo: [1200, 2000] }, rank: "七対" },
        30: { parent: { ron: 5800, tsumo: 2900 }, child: { ron: 3900, tsumo: [1500, 2500] }, rank: "" },
        40: { parent: { ron: 7700, tsumo: 3900 }, child: { ron: 5200, tsumo: [2000, 3300] }, rank: "" },
        50: { parent: { ron: 9600, tsumo: 4800 }, child: { ron: 6400, tsumo: [2400, 4000] }, rank: "" },
        60: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" },
        70: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" }
    },
    4: {
        20: { parent: { ron: 7700, tsumo: 3900 }, child: { ron: 5200, tsumo: [2000, 3300] }, rank: "平和" },
        25: { parent: { ron: 9600, tsumo: 4800 }, child: { ron: 6400, tsumo: [2400, 4000] }, rank: "七対" },
        30: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" },
        40: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" },
        50: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" },
        60: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" },
        70: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" }
    },
    5: {
        all: { parent: { ron: 12000, tsumo: 6000 }, child: { ron: 8000, tsumo: [3000, 5000] }, rank: "満貫" }
    },
    6: {
        all: { parent: { ron: 18000, tsumo: 9000 }, child: { ron: 12000, tsumo: [4500, 7500] }, rank: "跳満" }
    },
    7: {
        all: { parent: { ron: 18000, tsumo: 9000 }, child: { ron: 12000, tsumo: [4500, 7500] }, rank: "跳満" }
    },
    8: {
        all: { parent: { ron: 24000, tsumo: 12000 }, child: { ron: 16000, tsumo: [6000, 10000] }, rank: "倍満" }
    },
    9: {
        all: { parent: { ron: 24000, tsumo: 12000 }, child: { ron: 16000, tsumo: [6000, 10000] }, rank: "倍満" }
    },
    10: {
        all: { parent: { ron: 24000, tsumo: 12000 }, child: { ron: 16000, tsumo: [6000, 10000] }, rank: "倍満" }
    },
    11: {
        all: { parent: { ron: 36000, tsumo: 18000 }, child: { ron: 24000, tsumo: [9000, 15000] }, rank: "三倍満" }
    },
    12: {
        all: { parent: { ron: 36000, tsumo: 18000 }, child: { ron: 24000, tsumo: [9000, 15000] }, rank: "三倍満" }
    },
    13: {
        all: { parent: { ron: 48000, tsumo: 24000 }, child: { ron: 32000, tsumo: [12000, 20000] }, rank: "役満" }
    },
    26: {
        all: { parent: { ron: 96000, tsumo: 48000 }, child: { ron: 64000, tsumo: [24000, 40000] }, rank: "ダブル役満" }
    },
    39: {
        all: { parent: { ron: 144000, tsumo: 96000 }, child: { ron: 96000, tsumo: [36000, 60000] }, rank: "トリプル役満" }
    }
};

for (let i = 14; i <= 25; i++) {
    scoreTable[i] = { all: scoreTable[13].all };
}
for (let i = 27; i <= 38; i++) {
    scoreTable[i] = { all: scoreTable[26].all };
}
for (let i = 40; i <= 51; i++) {
    scoreTable[i] = { all: scoreTable[39].all };
}

let selectedYakus = [];

function toggleHan(name, hanPair, buttonElement) {
    const isOpen = document.getElementById("isOpenHand").value === "true";
    const han = isOpen ? hanPair[1] : hanPair[0];
    const index = selectedYakus.findIndex(y => y.name === name);
    if (index >= 0) {
        selectedYakus.splice(index, 1);
        buttonElement.classList.remove("active");
    } else {
        selectedYakus.push({ name, hanPair, han });
        buttonElement.classList.add("active");
    }
    updateTotalHan();
}

function reevaluateYakus() {
    const isOpen = document.getElementById("isOpenHand").value === "true";
    selectedYakus.forEach(yaku => {
        if (yaku.hanPair) {
            yaku.han = isOpen ? yaku.hanPair[1] : yaku.hanPair[0];
        }
    });
}

function addHan(name, han, buttonId, color) {
    const y = selectedYakus.find(y => y.name === name);
    if (y) {
        y.han += han;
    } else {
        selectedYakus.push({ name, han });
    }
    updateAdditiveButton(name, buttonId, color);
    updateTotalHan();
}

function updateAdditiveButton(name, buttonId, color) {
    const yaku = selectedYakus.find(y => y.name === name);
    const count = yaku ? yaku.han : 0;
    const button = document.getElementById(buttonId);
    const countSpan = button.querySelector("span:last-child");
    if (countSpan) countSpan.textContent = ` ${count}`;
    const intensity = Math.min(count * 0.1, 1.0);
    const rgb = count === 0 ? '#eee' :
        color === "red" ? `rgba(255, 0, 0, ${intensity})` :
            color === "blue" ? `rgba(0, 0, 255, ${intensity})` :
                color === "green" ? `rgba(0, 255, 0, ${intensity})` :
                    `rgba(0, 0, 0, ${intensity})`;
    button.style.backgroundColor = rgb;
}

function updateTotalHan() {
    const total = selectedYakus.reduce((sum, yaku) => sum + yaku.han, 0);
    document.getElementById("han").value = total;
    document.getElementById("totalHan").textContent = total;
    showScores();
}

function showScores() {
    const winner = document.getElementById("winner").value;
    const han = parseInt(document.getElementById("han").value);
    const honba = parseInt(document.getElementById("honba").value);
    const resultList = document.getElementById("resultList");
    const rankLabelEl = document.getElementById("rankLabel");
    resultList.innerHTML = "";
    rankLabelEl.textContent = "";

    const entries = scoreTable[han];
    const winnerLabel = winner === "parent" ? "親" : "子";

    if (!entries) {
        resultList.innerHTML = "<li>データなし</li>";
        return;
    }

    if (entries.all) {
        const d = entries.all[winner];
        const rank = entries.all.rank || "-";
        const ron = d.ron + 300 * honba;
        const tsumo = Array.isArray(d.tsumo)
            ? `${d.tsumo[0] + 100 * honba} / ${d.tsumo[1] + 100 * honba}`
            : d.tsumo + 300 * honba;
        rankLabelEl.textContent = `${rank}`;
        resultList.innerHTML = `<li>${winnerLabel} ${rank}：${ron} ( ${tsumo} )</li>`;
        return;
    }

    for (const fu in entries) {
        const d = entries[fu][winner];
        const ron = d.ron + 300 * honba;
        const tsumoArray = Array.isArray(d.tsumo)
            ? [d.tsumo[0] + 100 * honba, d.tsumo[1] + 100 * honba]
            : d.tsumo + 300 * honba;
        const tsumo = Array.isArray(tsumoArray)
            ? `${tsumoArray[0]} / ${tsumoArray[1]}`
            : tsumoArray;
        const rank = entries[fu].rank || "　　";
        const label = `${winnerLabel} ${fu}符（${rank}）： ${ron} ( ${tsumo} )`;
        const li = document.createElement("li");
        li.textContent = label;
        resultList.appendChild(li);
    }
}

function setIsOpenHand(value) {
    document.getElementById("isOpenHand").value = value;
    document.querySelectorAll("#isOpenHandToggle button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.value === String(value));
    });
    reevaluateYakus();
    updateTotalHan();
}

function changeHonba(delta) {
    const honbaInput = document.getElementById("honba");
    let value = parseInt(honbaInput.value);
    value = Math.min(10, Math.max(0, value + delta));
    honbaInput.value = value;
    document.getElementById("honbaValue").textContent = value;
    showScores();
}

function setWinner(value) {
    document.getElementById("winner").value = value;
    document.querySelectorAll("#winnerToggle button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.value === value);
    });
    showScores();
}

function resetAll() {
    selectedYakus = [];
    document.querySelectorAll(".yakuButtons button").forEach(btn => btn.classList.remove("active"));
    updateAdditiveButton("ドラ", "doraButton", "red");
    updateAdditiveButton("役牌", "yakuhaiButton", "blue");
    updateAdditiveButton("ローカル", "localButton", "yellow");
    updateTotalHan();
    window.scrollTo(0, 0);
}

function getHanPair(name) {
    const hanMap = {
        "門前摸和": [1, 0], "立直": [1, 0], "一発": [1, 0], "断幺九": [1, 1],
        "平和": [1, 0], "一盃口": [1, 0], "槍槓": [1, 1], "嶺上開花": [1, 1],
        "海底撈月": [1, 1], "河底撈魚": [1, 1], "ダブル立直": [2, 2],
        "七対子": [2, 2], "対々和": [2, 2], "三暗刻": [2, 2], "三色同刻": [2, 2],
        "三色同順": [2, 1], "混老頭": [2, 2], "一気通貫": [2, 1], "混全帯": [2, 1],
        "小三元": [2, 2], "三槓子": [2, 2], "混一色": [3, 2], "純全帯": [3, 2],
        "二盃口": [3, 0], "流し満貫": [5, 5], "清一色": [6, 5],
        "天和": [13, 13], "地和": [13, 13], "人和": [13, 13], "緑一色": [13, 13],
        "大三元": [13, 13], "小四喜": [13, 13], "字一色": [13, 13], "国士無双": [13, 13],
        "九蓮宝燈": [13, 13], "四暗刻": [13, 13], "清老頭": [13, 13], "四槓子": [13, 13],
        "四暗刻単騎": [26, 26], "大四喜": [26, 26], "純正九蓮宝燈": [26, 26],
        "国士無双十三面待ち": [26, 26]
    };
    return hanMap[name] || null;
}

window.addEventListener("DOMContentLoaded", () => {
    setWinner("parent");
    setIsOpenHand(false);
    document.getElementById("honba").value = 0;
    document.getElementById("honbaValue").textContent = "0";
    resetAll();

    document.getElementById("resetButton").addEventListener("click", () => {
        window.scrollTo(0, 0);
        resetAll();
    });

    document.querySelectorAll("#winnerToggle button").forEach(btn => {
        btn.addEventListener("click", () => setWinner(btn.dataset.value));
    });

    document.querySelectorAll("#isOpenHandToggle button").forEach(btn => {
        btn.addEventListener("click", () => setIsOpenHand(btn.dataset.value === "true"));
    });

    const honbaButtons = document.querySelectorAll("#honbaCounter button");
    honbaButtons[0].addEventListener("click", () => changeHonba(-1));
    honbaButtons[1].addEventListener("click", () => changeHonba(1));

    document.querySelectorAll(".yakuButtons button").forEach(btn => {
        const name = btn.dataset.name;
        if (!name) return;
        if (btn.id === "yakuhaiButton") {
            btn.addEventListener("click", () => addHan("役牌", 1, "yakuhaiButton", "blue"));
        } else if (btn.id === "doraButton") {
            btn.addEventListener("click", () => addHan("ドラ", 1, "doraButton", "red"));
        } else if (btn.id === "localButton") {
            btn.addEventListener("click", () => addHan("ローカル", 1, "localButton", "green"));
        } else {
            const hanPair = getHanPair(name);
            if (hanPair) {
                btn.addEventListener("click", () => toggleHan(name, hanPair, btn));
            }
        }
    });
});