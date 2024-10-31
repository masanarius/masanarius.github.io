let currentLanguage = "jp"; // 初期設定は日本語

// 言語を適用する関数
async function applyLanguage(lang) {
    try {
        // JSONデータをフェッチ
        const response = await fetch(`./json/general.json`);
        const texts = await response.json();

        // data-key 属性を基に一括でテキストを更新
        document.querySelectorAll("[data-key]").forEach(element => {
            const key = element.getAttribute("data-key");
            const [mainKey, subKey] = key.split('.');

            let value;
            if (mainKey === "lang-switch") {
                value = texts["lang-switch"][0][lang];
            } else if (texts[mainKey] && texts[mainKey][subKey]) {
                value = texts[mainKey][subKey][0][lang]; // publication のような配列アクセス
            }

            if (value) {
                element.innerHTML = value;
            } else {
                console.warn(`Warning: '${key}' is not defined in the JSON file.`);
            }
        });

        // 言語切り替えボタンのラベルを更新
        const langSwitch = texts["lang-switch"][0];
        document.getElementById("lang-switch").innerText = langSwitch[lang];
    } catch (error) {
        console.error("言語ファイルの読み込みに失敗しました:", error);
    }
}

// 言語をトグルして適用する関数
function toggleLanguage() {
    currentLanguage = currentLanguage === "en" ? "jp" : "en";
    localStorage.setItem("language", currentLanguage);
    applyLanguage(currentLanguage);
}

// ページ読み込み時に前回の言語設定を適用
window.onload = () => {
    const savedLanguage = localStorage.getItem("language") || "jp";
    currentLanguage = savedLanguage;
    applyLanguage(currentLanguage);
};

// 言語切り替えボタンのクリックイベントを設定
document.getElementById("lang-switch").addEventListener("click", toggleLanguage);


const pagetopButton = document.querySelector(".pagetop");

// ページロード時に最上部なら非表示に
window.addEventListener("load", () => {
    if (window.scrollY === 0) {
        pagetopButton.style.opacity = "0";
        pagetopButton.style.visibility = "hidden";
    }
});

// スクロール時に表示・非表示を切り替え
window.addEventListener("scroll", () => {
    if (window.scrollY === 0) {
        pagetopButton.style.transition = "opacity 1s ease";
        pagetopButton.style.opacity = "0";
        pagetopButton.style.visibility = "hidden";
    } else {
        pagetopButton.style.transition = "opacity 1s ease";
        pagetopButton.style.opacity = "1";
        pagetopButton.style.visibility = "visible";
    }
});




