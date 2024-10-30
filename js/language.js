let currentLanguage = "jp"; // 初期設定は日本語

// 言語を適用する関数
async function applyLanguage(lang) {
    try {
        // JSONデータをフェッチ
        const response = await fetch(`./json/${lang}.json`);
        const texts = await response.json();

        // data-key 属性を基に一括でテキストを更新
        document.querySelectorAll("[data-key]").forEach(element => {
            const key = element.getAttribute("data-key");
            const value = key.split('.').reduce((obj, keyPart) => obj?.[keyPart], texts);
            if (value !== undefined) {
                element.innerHTML = value;
            }
        });

        // 言語切り替えボタンのラベルを更新
        document.getElementById("lang-switch").innerText = texts["lang-switch"];
    } catch (error) {
        console.error("言語ファイルの読み込みに失敗しました:", error);
    }
}

// 言語をトグルして適用する関数
function toggleLanguage() {
    // 言語をトグルし、localStorageに保存
    currentLanguage = currentLanguage === "en" ? "jp" : "en";
    localStorage.setItem("language", currentLanguage);

    // 選択した言語を適用
    applyLanguage(currentLanguage);
}

// ページ読み込み時に前回の言語設定を適用
window.onload = () => {
    const savedLanguage = localStorage.getItem("language") || "jp";
    currentLanguage = savedLanguage;
    applyLanguage(currentLanguage); // トグルせずに適用のみ
};

// 言語切り替えボタンのクリックイベントを設定
document.getElementById("lang-switch").addEventListener("click", toggleLanguage);
