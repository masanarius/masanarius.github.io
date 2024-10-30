const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

// ハンバーガーボタンのクリックでメニューを開閉
hamburger.addEventListener('click', (event) => {
    event.stopPropagation(); // イベントのバブリングを防止
    if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        menu.style.height = '0';
    } else {
        menu.classList.add('open');
        menu.style.height = '100vh';  // 自動的に高さを調整
    }
});

// ハンバーガーボタン以外をクリックしたときにメニューを閉じる
document.addEventListener('click', (event) => {
    if (menu.classList.contains('open') && !menu.contains(event.target) && event.target !== hamburger) {
        menu.classList.remove('open');
        menu.style.height = '0';
    }
});
