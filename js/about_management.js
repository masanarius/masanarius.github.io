document.addEventListener("DOMContentLoaded", () => {
    // 設定する変数
    const jsonFilePath = "json/about_management.json";
    const displayContainer = document.querySelector("#management-container"); // 表示するリストのコンテナ
    const toggleButton = document.querySelector("[data-key='about.show-more-management']"); // 表示切り替えボタン
    const initialDisplayCount = 3; // 初期表示数
    const dataKey = "array"; // JSONから取得する配列のキー
    let currentLanguage = localStorage.getItem("language") || "jp"; // 言語設定の取得

    // データを取得してリストに表示する関数
    function loadDataAndDisplay(lang) {
        fetch(jsonFilePath)
            .then(response => response.json())
            .then(data => {
                const items = data[dataKey];
                const initialItems = items.slice(0, initialDisplayCount);
                const remainingItems = items.slice(initialDisplayCount);

                // コンテナ内容をクリアしてから再描画
                displayContainer.innerHTML = "";

                // 初期表示分の項目のみ表示
                initialItems.forEach(item => {
                    const listItem = createListItem(item, lang);
                    displayContainer.appendChild(listItem);
                });

                toggleButton.style.display = remainingItems.length ? "block" : "none";
                toggleButton.onclick = () => {
                    remainingItems.forEach(item => {
                        const listItem = createListItem(item, lang);
                        displayContainer.appendChild(listItem);
                    });
                    toggleButton.style.display = "none";
                };
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    // 1項目を生成する関数（職位、会社、期間、説明を含む）
    function createListItem(item, lang) {
        const listItem = document.createElement("li");
        listItem.classList.add("management-list-item");

        const position = item.position?.[lang] || ""; // 各プロパティが存在するかチェック
        const organization = item.organization?.[lang] || "";
        const period = item.period?.[lang] || "";

        const content = `
            <p><strong>${position}</strong></p>
            <p>${organization}</p>
            <p class="period">${period}</p>
        `;

        listItem.innerHTML = content;
        return listItem;
    }

    // 初期言語でデータをロードして表示
    loadDataAndDisplay(currentLanguage);

    // 言語切り替え時のイベントをリッスン
    document.getElementById("lang-switch").addEventListener("click", () => {
        // 言語をトグル
        currentLanguage = currentLanguage === "en" ? "jp" : "en";
        localStorage.setItem("language", currentLanguage); // 言語設定を保存
        loadDataAndDisplay(currentLanguage); // 新しい言語で再表示
    });
});
