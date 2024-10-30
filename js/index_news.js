document.addEventListener("DOMContentLoaded", () => {
    const jsonFilePath = "json/news.json"; // JSONファイルのパス
    const displayContainer = document.querySelector("#news-table tbody"); // ニュースを表示するテーブルのtbody
    // const showMoreButton = document.querySelector("[data-key='news.show-more-news']"); // "Show More"ボタン
    const initialDisplayCount = 3; // 初期表示数
    const dataKey = "array"; // JSON内のキー
    let currentLanguage = localStorage.getItem("language") || "jp"; // デフォルトの言語設定

    // ニュースデータをロードして表示する関数
    function loadDataAndDisplay(lang) {
        fetch(jsonFilePath)
            .then(response => response.json())
            .then(data => {
                const items = data[dataKey];
                const initialItems = items.slice(0, initialDisplayCount);
                const remainingItems = items.slice(initialDisplayCount);

                // コンテナをクリアして新しい行を追加
                displayContainer.innerHTML = "";

                // 初期のアイテムを表示
                initialItems.forEach(item => {
                    const tableRow = createNewsTableRow(item, lang);
                    displayContainer.appendChild(tableRow);
                });

                // // ボタンで残りのアイテムを表示
                // if (remainingItems.length > 0) {
                //     showMoreButton.style.display = "block";
                //     showMoreButton.onclick = () => {
                //         remainingItems.forEach(item => {
                //             const tableRow = createNewsTableRow(item, lang);
                //             displayContainer.appendChild(tableRow);
                //         });
                //         showMoreButton.style.display = "none";
                //     };
                // } else {
                //     showMoreButton.style.display = "none";
                // }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // 各ニュース行を作成する関数
    function createNewsTableRow(item, lang) {
        const tableRow = document.createElement("tr");
        const dateCell = document.createElement("td");
        const eventCell = document.createElement("td");

        // 書体の太さを通常に設定
        dateCell.style.fontWeight = "normal";
        eventCell.style.fontWeight = "normal";

        dateCell.textContent = item.date;
        eventCell.innerHTML = item.event[0][lang]; // 選択された言語でのニュース内容

        tableRow.appendChild(dateCell);
        tableRow.appendChild(eventCell);
        return tableRow;
    }

    // デフォルト言語で初期データを読み込む
    loadDataAndDisplay(currentLanguage);

    // 言語切替ボタンのクリックイベント
    document.getElementById("lang-switch").addEventListener("click", () => {
        currentLanguage = currentLanguage === "en" ? "jp" : "en";
        localStorage.setItem("language", currentLanguage);
        loadDataAndDisplay(currentLanguage);
    });
});
