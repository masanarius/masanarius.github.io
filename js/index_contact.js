// ボタンと表示するコンテンツの要素を取得
const showContactButton = document.getElementById('show-contact-detail');
const contactDetailTable = document.getElementById('table-contact-detail');

// 初期状態は非表示に設定
contactDetailTable.style.display = 'none';

// ボタンをクリックするとコンテンツを表示し、ボタンを非表示にする
showContactButton.addEventListener('click', () => {
    contactDetailTable.style.display = 'block'; // コンテンツを表示
    showContactButton.style.display = 'none';   // ボタンを非表示にする
});
