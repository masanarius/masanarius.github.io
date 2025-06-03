function formatDateDot(startStr, endStr) {
    const format = (dateStr) => {
        const [y, m, d] = dateStr.trim().split(/[\/\-]/);
        return `${y}.${m.padStart(2, '0')}.${d.padStart(2, '0')}`;
    };

    const s = format(startStr);
    const e = format(endStr);

    if (s === e) return s;

    return `<span class="hidden sm:inline">${s} - ${e}</span><span class="sm:hidden block">${s} -<br>${e}</span>`;
}

async function loadNews() {
    try {
        const response = await fetch("csv/news.csv");
        if (!response.ok) throw new Error("CSVの読み込みに失敗しました");

        const text = await response.text();
        const lines = text.trim().split("\n");
        const container = document.getElementById("news-container");
        container.innerHTML = "";

        const table = document.createElement("table");
        table.className = "w-full border-collapse";

        // ヘッダー行をスキップして処理
        lines.slice(1).forEach(line => {
            const [start, end, , , event_ja, event_en] = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (start && end && event_ja && event_en) {
                const row = document.createElement("tr");
                row.className = "border-b";

                const dateRangeHTML = formatDateDot(start, end);

                const clean = s => s.trim().replace(/^"|"$/g, "").replace(/""/g, '"');

                // HTML内の <a> タグに Tailwind の class を追加
                const addLinkClass = (html) =>
                    html.replace(/<a(?![^>]*class=)/g, '<a class="text-blue-500"')  // classなしに付ける
                        .replace(/<a class="([^"]*)"/g, '<a class="$1 text-blue-500"'); // 既存classに追加

                let jaText = addLinkClass(clean(event_ja));
                let enText = addLinkClass(clean(event_en));

                const dateCellJa = document.createElement("td");
                dateCellJa.className = "text-sm text-gray-600 leading-loose px-2 py-6 pr-4 align-top";
                dateCellJa.setAttribute("data-lang", "ja");
                dateCellJa.innerHTML = dateRangeHTML;

                const dateCellEn = document.createElement("td");
                dateCellEn.className = "text-sm text-gray-600 leading-loose px-2 py-6 pr-4 hidden align-top";
                dateCellEn.setAttribute("data-lang", "en");
                dateCellEn.innerHTML = dateRangeHTML;

                const eventCellJa = document.createElement("td");
                eventCellJa.className = "text-sm py-2";
                eventCellJa.setAttribute("data-lang", "ja");
                eventCellJa.innerHTML = jaText;

                const eventCellEn = document.createElement("td");
                eventCellEn.className = "text-sm py-2 hidden";
                eventCellEn.setAttribute("data-lang", "en");
                eventCellEn.innerHTML = enText;

                row.appendChild(dateCellJa);
                row.appendChild(dateCellEn);
                row.appendChild(eventCellJa);
                row.appendChild(eventCellEn);

                table.appendChild(row);
            }
        });

        container.appendChild(table);
    } catch (err) {
        console.error("エラー:", err);
        document.getElementById("news-container").textContent = "ニュースの読み込みに失敗しました．";
    }
}

function applyLanguageSetting() {
    const lang = localStorage.getItem("lang") || "ja";

    const elements = document.querySelectorAll("[data-lang]");
    elements.forEach(el => {
        el.classList.toggle("hidden", el.getAttribute("data-lang") !== lang);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadNews().then(applyLanguageSetting);
});
