// js/renderLatestNews.js

function formatLatestDate(dateStr, lang) {
    const date = new Date(dateStr.trim());
    if (lang === 'en') {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } else {
        const [y, m, d] = dateStr.split(/[\/\-]/);
        return `${y}.${m.padStart(2, '0')}.${d.padStart(2, '0')}`;
    }
}

async function renderLatestNews() {
    try {
        const response = await fetch("csv/news.csv");
        const text = await response.text();
        const lines = text.trim().split("\n").slice(1, 3); // 最新2件のみ取得

        const table = document.createElement("table");
        table.className = "w-full border-collapse";

        lines.forEach(line => {
            const [start, end, title_ja, title_en, ,] = line.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);

            const row = document.createElement("tr");
            row.className = "border-none";

            // 日付（日本語）
            const dateCellJa = document.createElement("td");
            dateCellJa.className = "text-sm text-gray-600 leading-loose px-2 pr-4 w-[6.5rem] whitespace-nowrap";
            dateCellJa.setAttribute("data-lang", "ja");
            dateCellJa.textContent = formatLatestDate(end, 'ja');

            // 日付（英語）
            const dateCellEn = document.createElement("td");
            dateCellEn.className = "text-sm text-gray-600 leading-loose px-2 pr-4 w-[8.5rem] whitespace-nowrap hidden";
            dateCellEn.setAttribute("data-lang", "en");
            dateCellEn.textContent = formatLatestDate(end, 'en');

            // タイトル（日本語）
            const titleCellJa = document.createElement("td");
            titleCellJa.className = "text-sm";
            titleCellJa.setAttribute("data-lang", "ja");
            titleCellJa.textContent = title_ja.trim().replace(/^"|"$/g, "").replace(/""/g, '"');

            // タイトル（英語）
            const titleCellEn = document.createElement("td");
            titleCellEn.className = "text-sm hidden";
            titleCellEn.setAttribute("data-lang", "en");
            titleCellEn.textContent = title_en.trim().replace(/^"|"$/g, "").replace(/""/g, '"');

            row.appendChild(dateCellJa);
            row.appendChild(dateCellEn);
            row.appendChild(titleCellJa);
            row.appendChild(titleCellEn);

            table.appendChild(row);
        });

        const headings = Array.from(document.querySelectorAll("h3[data-lang='ja']"));
        const latestHeading = headings.find(h => h.textContent.trim() === "最新の活動");
        if (latestHeading) {
            const wrapper = latestHeading.closest("div.w-full");
            if (wrapper) {
                const existingTables = wrapper.querySelectorAll("table");
                existingTables.forEach(t => t.remove());
                wrapper.appendChild(table);
            }
        }

    } catch (err) {
        console.error("[renderLatestNews.js] Error:", err);
    }
}

document.addEventListener("DOMContentLoaded", renderLatestNews);
