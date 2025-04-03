const labelColors = {
    journal: 'orange',
    international: 'blue',
    domestic: 'green',
    other: 'gray',
    award: 'yellow',
    fund: 'purple',
    thesis: 'pink'
};

function renderKeyWorks(data, containerId = 'key-works-list') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const keyWorks = data.filter(entry => parseInt(entry.key) > 0);
    keyWorks.sort((a, b) => parseInt(a.key) - parseInt(b.key));

    keyWorks.forEach(entry => {
        const labelColor = labelColors[entry.label?.trim()] || 'gray';

        const partsEn = [entry.conference_en, entry.book_en].filter(Boolean).join(', ');
        const partsJp = [entry.conference_jp, entry.book_jp].filter(Boolean).join(', ');
        const monthYear = [entry.month, entry.year].filter(Boolean).join(' ');
        const dateStr = monthYear ? ', ' + monthYear + (entry.year ? '.' : '') : '';

        const item = document.createElement('li');
        item.className = 'relative pl-4 mt-4 text-sm leading-tight list-none';

        //Category色の縦線
        const colorBar = document.createElement('div');
        colorBar.className = `absolute left-0 top-[0.1rem] bottom-[0.0rem] w-0.5 bg-gray-300`;
        item.appendChild(colorBar);

        const content = document.createElement('div');
        content.className = 'space-y-1';

        const title = document.createElement('h2');
        title.className = 'font-semibold text-base';
        title.innerHTML = `
        <span data-lang="ja">${entry.title_jp}</span>
        <span data-lang="en">${entry.title_en}</span>
      `;
        content.appendChild(title);

        const source = document.createElement('p');
        source.className = 'text-xs text-gray-700';
        source.innerHTML = `
        <span data-lang="ja">${partsJp}${dateStr}</span>
        <span data-lang="en">${partsEn}${dateStr}</span>
      `;

        if (entry.url) {
            const jaSpan = source.querySelector('span[data-lang="ja"]');
            const enSpan = source.querySelector('span[data-lang="en"]');
            const linkHtml = ` <a href="${entry.url}" target="_blank" class="text-gray-600 inline-flex items-center gap-1">URL <img src="img/popup.png" alt="popup icon" class="w-3 h-3"></a>`;
            // With linl
            // if (jaSpan) jaSpan.innerHTML += linkHtml;
            // if (enSpan) enSpan.innerHTML += linkHtml;
            //No Link
            if (jaSpan) jaSpan.innerHTML;
            if (enSpan) enSpan.innerHTML;
        }

        content.appendChild(source);
        item.appendChild(content);
        container.appendChild(item);
    });

    applyLang();
}


Papa.parse("csv/works.csv", {
    download: true,
    header: true,
    complete: function (results) {
        renderKeyWorks(results.data);
    }
});