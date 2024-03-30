document.getElementById('btnJa').addEventListener('click', function() {
    changeLanguage('ja');
});
  
document.getElementById('btnEn').addEventListener('click', function() {
    changeLanguage('en');
});
  
function changeLanguage(language) {
    const elements = document.querySelectorAll('.lang');
    elements.forEach(element => {
        if (element.dataset.lang === language) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}