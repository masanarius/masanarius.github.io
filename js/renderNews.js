function formatDateJa(dateStr) {
    const [year, month, day] = dateStr.trim().split(/[\/\-]/);
    return {
        year,
        month: month.padStart(2, '0'),
        day: day.padStart(2, '0'),
        full: `${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`
    };
}

function formatDateEn(dateStr) {
    const date = new Date(dateStr.trim());
    return {
        year: date.getFullYear(),
        month: date.toLocaleString("en-US", { month: "short" }),
        monthNum: (date.getMonth() + 1).toString().padStart(2, '0'),
        day: date.getDate().toString().padStart(2, '0'),
        full: date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    };
}

function formatDateJaRange(startStr, endStr) {
    const s = formatDateJa(startStr);
    const e = formatDateJa(endStr);

    if (s.year !== e.year) {
        return `${s.full} - ${e.full}`;
    } else if (s.month !== e.month) {
        return `${s.full} - ${e.month}.${e.day}`;
    } else if (s.day !== e.day) {
        return `${s.full} - ${e.day}`;
    } else {
        return s.full;
    }
}

function formatDateEnRange(startStr, endStr) {
    const s = formatDateEn(startStr);
    const e = formatDateEn(endStr);

    if (s.year !== e.year) {
        return `${s.full} - ${e.full}`;
    } else if (s.month !== e.month) {
        return `${s.month} ${s.day} - ${e.month} ${e.day}, ${s.year}`;
    } else if (s.day !== e.day) {
        return `${s.month} ${s.day} - ${e.day}, ${s.year}`;
    } else {
        return s.full;
    }
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

        lines.slice(1).forEach(line => {
            const [start, end, , , event_ja, event_en] = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (start && end && event_ja && event_en) {
                const row = document.createElement("tr");
                row.className = "border-b";

                const dateCellJa = document.createElement("td");
                dateCellJa.className = "text-sm text-gray-600 leading-loose px-2 py-6 pr-4 w-[6.5rem] whitespace-nowrap";

                dateCellJa.setAttribute("data-lang", "ja");
                dateCellJa.textContent = formatDateJaRange(start, end);

                const dateCellEn = document.createElement("td");
                dateCellEn.className = "text-sm text-gray-600 leading-loose px-2 py-6 pr-4 w-[8.5rem] whitespace-nowrap hidden";


                dateCellEn.setAttribute("data-lang", "en");
                dateCellEn.textContent = formatDateEnRange(start, end);

                const eventCellJa = document.createElement("td");
                eventCellJa.className = "text-sm py-2";
                eventCellJa.setAttribute("data-lang", "ja");
                eventCellJa.textContent = event_ja.trim().replace(/^"|"$/g, "").replace(/""/g, '"');

                const eventCellEn = document.createElement("td");
                eventCellEn.className = "text-sm py-2 hidden";
                eventCellEn.setAttribute("data-lang", "en");
                eventCellEn.textContent = event_en.trim().replace(/^"|"$/g, "").replace(/""/g, '"');

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

loadNews();
