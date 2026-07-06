function initializeSelects() {

    const sessionSelect =
        document.getElementById("sessionSelect");

    const playerSelect =
        document.getElementById("playerSelect");

    ["選択"].forEach((label) => {

        const s =
            document.createElement("option");

        s.value = "";
        s.textContent = label;
        s.selected = true;
        s.disabled = true;

        sessionSelect.appendChild(s);

        const p =
            document.createElement("option");

        p.value = "";
        p.textContent = label;
        p.selected = true;
        p.disabled = true;

        playerSelect.appendChild(p);
    });

    for (let i = 1; i <= 20; i++) {

        const s =
            document.createElement("option");

        s.value = i;
        s.textContent = i;

        sessionSelect.appendChild(s);

        const p =
            document.createElement("option");

        p.value = i;
        p.textContent = i;

        playerSelect.appendChild(p);
    }
}

function lockSessionID() {

    const select =
        document.getElementById("sessionSelect");

    select.disabled = true;

    select.classList.add("bg-gray-200");

    startGameIfReady();
}

function lockPlayerID() {

    const select =
        document.getElementById("playerSelect");

    select.disabled = true;

    select.classList.add("bg-gray-200");

    startGameIfReady();
}

function updateTrialCounter() {

    const counter =
        document.getElementById("trialCounter");

    counter.textContent =
        `Trial ${currentTrial}/${MAX_TRIAL}`;
}

function updateTotalScoreArea() {

    const scoreArea =
        document.getElementById("totalScoreArea");

    if (!SHOW_TOTAL_SCORE) {

        scoreArea.classList.add("hidden");

        return;
    }

    scoreArea.textContent =
        `Score ${totalScore}`;
}

function showTab(tab) {

    const mainTab =
        document.getElementById("mainTab");

    const historyTab =
        document.getElementById("historyTab");

    const settingTab =
        document.getElementById("settingTab");

    const mainContent =
        document.getElementById("mainContent");

    const historyContent =
        document.getElementById("historyContent");

    const settingContent =
        document.getElementById("settingContent");

    mainContent.classList.add("hidden");
    historyContent.classList.add("hidden");
    settingContent.classList.add("hidden");

    mainTab.className =
        "border-b-2 border-transparent px-4 py-2 font-semibold text-gray-500";

    historyTab.className =
        "border-b-2 border-transparent px-4 py-2 font-semibold text-gray-500";

    settingTab.className =
        "border-b-2 border-transparent px-4 py-2 font-semibold text-gray-500";

    if (tab === "main") {

        mainContent.classList.remove("hidden");

        mainTab.className =
            "border-b-2 border-blue-600 px-4 py-2 font-semibold text-blue-600";

    } else if (tab === "history") {

        historyContent.classList.remove("hidden");

        historyTab.className =
            "border-b-2 border-blue-600 px-4 py-2 font-semibold text-blue-600";

    } else if (tab === "setting") {

        settingContent.classList.remove("hidden");

        settingTab.className =
            "border-b-2 border-blue-600 px-4 py-2 font-semibold text-blue-600";
    }
}

function addHistoryRow(trial, imageName) {

    const historyList =
        document.getElementById("historyList");

    const row =
        document.createElement("div");

    row.className =
        "grid grid-cols-[80px_1fr] items-center border-t border-gray-200 px-4 py-3";

    row.innerHTML = `
    <div class="text-sm font-semibold">
      ${trial}
    </div>

    <div class="flex items-center justify-center">
      <img
        src="images/${imageName}.png"
        class="h-20 w-20 object-contain"
      />
    </div>
  `;

    historyList.prepend(row);
}

function updateCooldownArea() {

    const area =
        document.getElementById("cooldownArea");

    area.className =
        "w-full text-center text-lg font-bold";

    if (!isSelectCoolingDown) {

        area.textContent =
            "図形を1つ選択せよ";

        return;
    }

    area.textContent =
        `図形が選択できるまで ${cooldownRemainingSec}秒`;
}

function updateRefreshButton() {

    const button =
        document.getElementById("refreshButton");

    if (!button) {
        return;
    }

    // Selectクールダウン中はRefresh禁止
    if (
        !ENABLE_REFRESH_DURING_SELECT_COOLDOWN &&
        isSelectCoolingDown
    ) {

        button.disabled = true;

        button.textContent = "3枚を再抽選する";

        return;
    }

    // Refreshクールダウン中
    if (isRefreshCoolingDown) {

        button.disabled = true;

        button.textContent =
            `再抽選できるまで ${refreshCooldownRemainingSec}秒`;

        return;
    }

    // 押せる状態
    button.disabled = false;

    button.textContent = "3枚を再抽選する";
}