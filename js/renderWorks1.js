const labelColors = {
    journal: 'orange',
    international: 'blue',
    domestic: 'green',
    other: 'gray',
    award: 'yellow',
    fund: 'purple',
    thesis: 'pink'
};

const sectionHeadings = {
    journal: { ja: '原著論文', en: 'Journal Papers' },
    international: { ja: '国際会議での発表', en: 'Presentation at International Conferences' },
    domestic: { ja: '国内会議での発表', en: 'Presentation at Domestic Conferences' },
    other: { ja: 'その他の発表', en: 'Other Presentations' },
    award: { ja: '受賞', en: 'Awards' },
    fund: { ja: '助成金等', en: 'Funding' },
    thesis: { ja: '学位論文', en: 'Theses' }
};

const headingClassBase = 'text-xl font-bold mt-12 mb-4 pb-1 flex items-center gap-2 scroll-mt-24';

window.currentLang = window.currentLang || 'ja';

function applyLang() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.getAttribute('data-lang') === window.currentLang ? 'block' : 'none';
    });
    document.querySelectorAll('.lang-toggle').forEach(btn => {
        btn.textContent = window.currentLang === 'ja' ? 'English' : '日本語';
    });
}

function toggleLang() {
    window.currentLang = window.currentLang === 'ja' ? 'en' : 'ja';
    applyLang();
}


function createCategoryIndex(containerId = 'category-index') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const displayOrder = ['journal', 'international', 'domestic', 'other', 'award', 'fund', 'thesis'];

    displayOrder.forEach(label => {
        const color = labelColors[label] || 'gray';
        const heading = sectionHeadings[label];
        if (!heading) return;
        const link = document.createElement('a');
        link.href = `#section-${label}`;
        link.className = `text-sm text-gray-700 mr-4 mb-2 inline-flex items-center gap-2`;
        link.innerHTML = `
        <span class="inline-block w-3 h-3 bg-${color}-500 rounded"></span>
        <span data-lang="ja">${heading.ja}</span>
        <span data-lang="en">${heading.en}</span>
      `;
        container.appendChild(link);
    });
    applyLang();
}

function createCard(entry) {
    const labelColor = labelColors[entry.label?.trim()] || 'gray';
    const tagStyle = `bg-gray-100 text-xs px-2 py-1 rounded-md`;
    const labelStyle = `text-${labelColor}-600 border border-${labelColor}-500 text-xs px-2 py-1 rounded-md bg-transparent`;

    const tagElems = [];
    for (let i = 1; i <= 5; i++) {
        const tagEn = entry[`tag${i}_en`];
        const tagJp = entry[`tag${i}_jp`];
        if (tagJp && tagJp.trim()) {
            tagElems.push(`<span class="${tagStyle}" data-lang="ja">${tagJp.trim()}</span>`);
        }
        if (tagEn && tagEn.trim()) {
            tagElems.push(`<span class="${tagStyle}" data-lang="en">${tagEn.trim()}</span>`);
        }
    }

    if (entry.url) {
        tagElems.push(`
        <span class="${tagStyle} flex items-center gap-1">
          <a href="${entry.url}" target="_blank" class="flex items-center gap-1">
            URL <img src="img/popup.png" alt="popup icon" class="w-3 h-3">
          </a>
        </span>
      `);
    }

    const partsEn = [entry.conference_en, entry.book_en, entry.issue, entry.vol, entry.no, entry.page].filter(x => x && x.trim()).join(', ');
    const partsJp = [entry.conference_jp, entry.book_jp, entry.issue, entry.vol, entry.no, entry.page].filter(x => x && x.trim()).join(', ');

    const monthYear = [entry.month, entry.year].filter(Boolean).join(' ');
    const dateStr = monthYear ? ', ' + monthYear + (entry.year ? '.' : '') : '';

    return `
      <div class="border rounded-lg shadow p-4 space-y-2 mt-4">
        <div class="flex flex-wrap gap-2">
          <span class="${labelStyle}" data-lang="ja">${entry.category_jp}</span>
          <span class="${labelStyle}" data-lang="en">${entry.category_en}</span>
        </div>
        <h2 class="font-bold text-lg">
          <span data-lang="ja">${entry.title_jp}</span>
          <span data-lang="en">${entry.title_en}</span>
        </h2>
        <p class="text-sm text-gray-700">
          <span data-lang="ja">${entry.author_jp}</span>
          <span data-lang="en">${entry.author_en}</span>
        </p>
        <p class="text-sm text-gray-700">
          <span data-lang="ja">${partsJp}${dateStr}</span>
          <span data-lang="en">${partsEn}${dateStr}</span>
        </p>
        ${entry.note_jp || entry.note_en ? `
          <p class="text-sm text-gray-700">
            <span data-lang="ja">${entry.note_jp || ''}</span>
            <span data-lang="en">${entry.note_en || ''}</span>
          </p>
        ` : ''}
        <div class="flex flex-wrap gap-2 pt-2">${tagElems.join('\n')}</div>
      </div>
    `;
}




function renderCards(data, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const grouped = {};
    data.forEach(entry => {
        const label = entry.label?.trim() || 'unknown';
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(entry);
    });

    const displayOrder = ['journal', 'international', 'domestic', 'other', 'award', 'fund', 'thesis'];

    displayOrder.forEach(label => {
        const entries = grouped[label];
        if (!entries) return;

        const headingJp = sectionHeadings[label]?.ja || '';
        const headingEn = sectionHeadings[label]?.en || '';
        const color = labelColors[label] || 'gray';

        const sectionId = `section-${label}`;
        const buttonId = `button-${label}`;

        const sectionWrapper = document.createElement('div');

        const headingJpElem = document.createElement('h2');
        headingJpElem.className = `${headingClassBase} border-b border-${color}-300`;
        headingJpElem.setAttribute('data-lang', 'ja');
        headingJpElem.id = sectionId;
        headingJpElem.innerHTML = `<span class="inline-block w-3 h-3 bg-${color}-500"></span> ${headingJp}`;

        const headingEnElem = document.createElement('h2');
        headingEnElem.className = `${headingClassBase} border-b border-${color}-300`;
        headingEnElem.setAttribute('data-lang', 'en');
        headingEnElem.id = sectionId;
        headingEnElem.innerHTML = `<span class="inline-block w-3 h-3 bg-${color}-500"></span> ${headingEn}`;

        const section = document.createElement('div');
        section.className = 'space-y-4';

        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'flex justify-center mt-2';

        const button = document.createElement('button');
        button.id = buttonId;
        button.className = `mt-2 text-sm font-semibold text-${color}-700 bg-${color}-100 hover:bg-${color}-200 px-4 py-1 rounded transition`;
        button.innerHTML = 'Show more <span class="ml-1">▼</span>';

        let visibleCount = 3;
        function renderSection(showAll = false) {
            const count = showAll ? entries.length : visibleCount;
            section.innerHTML = entries.slice(0, count).map(createCard).join('\n');
            if (count >= entries.length) button.style.display = 'none';
            applyLang();
        }

        button.addEventListener('click', () => {
            renderSection(true);
        });

        renderSection();

        sectionWrapper.appendChild(headingJpElem);
        sectionWrapper.appendChild(headingEnElem);
        sectionWrapper.appendChild(section);

        buttonWrapper.appendChild(button);

        sectionWrapper.appendChild(buttonWrapper);

        container.appendChild(sectionWrapper);
    });


    applyLang();
}

Papa.parse("csv/works.csv", {
    download: true,
    header: true,
    complete: function (results) {
        createCategoryIndex();
        renderCards(results.data, 'card-container');
    }
});