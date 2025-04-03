console.log('[langToggle.js] loaded');

// langToggle.js
window.currentLang = localStorage.getItem('lang') || 'ja';

function applyLang() {
    console.log('[langToggle.js] applyLang called. Current lang:', window.currentLang);
    document.querySelectorAll('[data-lang]').forEach(el => {
        const lang = el.getAttribute('data-lang');
        const isVisible = lang === window.currentLang;

        if (el.tagName === 'TD' || el.tagName === 'TH') {
            el.style.display = isVisible ? 'table-cell' : 'none';
        } else {
            el.style.display = isVisible ? 'block' : 'none';
        }
    });

    document.querySelectorAll('.lang-toggle').forEach(btn => {
        btn.textContent = window.currentLang === 'ja' ? 'English' : '日本語';
    });
}

function toggleLang() {
    window.currentLang = window.currentLang === 'ja' ? 'en' : 'ja';
    localStorage.setItem('lang', window.currentLang);
    console.log('[langToggle.js] toggleLang called. New lang:', window.currentLang);
    applyLang();

    const menu = document.getElementById("menu");
    if (menu && !menu.classList.contains("hidden")) {
        menu.classList.add("hidden");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[langToggle.js] DOMContentLoaded fired.');
    applyLang();
});
