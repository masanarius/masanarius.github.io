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
        table.className = "text-sm text-gray-700 mt-1 border-separate border-spacing-y-1";

        lines.forEach(line => {
            const [start, end, title_ja, title_en] = line.split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);

            // 日本語行
            const rowJa = document.createElement("tr");
            rowJa.setAttribute("data-lang", "ja");
            const dateCellJa = document.createElement("td");
            dateCellJa.className = "align-top pr-4 whitespace-nowrap font-semibold";
            dateCellJa.textContent = formatLatestDate(end, 'ja');
            const titleCellJa = document.createElement("td");
            titleCellJa.textContent = title_ja.replace(/^"|"$/g, '').replace(/""/g, '"');
            rowJa.appendChild(dateCellJa);
            rowJa.appendChild(titleCellJa);

            // 英語行
            const rowEn = document.createElement("tr");
            rowEn.setAttribute("data-lang", "en");
            rowEn.classList.add("hidden");
            const dateCellEn = document.createElement("td");
            dateCellEn.className = "align-top pr-4 whitespace-nowrap font-semibold";
            dateCellEn.textContent = formatLatestDate(end, 'en');
            const titleCellEn = document.createElement("td");
            titleCellEn.textContent = title_en.replace(/^"|"$/g, '').replace(/""/g, '"');
            rowEn.appendChild(dateCellEn);
            rowEn.appendChild(titleCellEn);

            table.appendChild(rowJa);
            table.appendChild(rowEn);
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
