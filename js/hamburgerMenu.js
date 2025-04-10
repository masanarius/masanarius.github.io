document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
    const toggleBtn = document.getElementById("hamburgerToggle");

    // トグルボタンでメニュー開閉
    toggleBtn.addEventListener("click", (event) => {
        event.stopPropagation(); // メニュー外クリック処理を防ぐ
        menu.classList.toggle("hidden");
    });

    // 外をクリックしたらメニューを閉じる
    document.addEventListener("click", (event) => {
        if (
            !menu.classList.contains("hidden") &&             // メニューが表示中で
            !menu.contains(event.target) &&                   // クリックがメニューの中でもなく
            !toggleBtn.contains(event.target)                 // トグルボタンでもない
        ) {
            menu.classList.add("hidden");
        }
    });

    // Escapeキーで閉じる（任意）
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            menu.classList.add("hidden");
        }
    });
});
