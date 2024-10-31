document.addEventListener("DOMContentLoaded", () => {
    const jsonFilePath = "json/news.json"; // JSON file path
    const displayContainer = document.querySelector("#news-table tbody"); // News display table's tbody
    const showMoreButton = document.querySelector("[data-key='news.show-more-news']"); // "Show More" button
    const initialDisplayCount = 3; // Initial display count
    const dataKey = "array"; // JSON key
    let currentLanguage = localStorage.getItem("language") || "jp"; // Default language setting

    // Function to load and display news data
    function loadDataAndDisplay(lang) {
        fetch(jsonFilePath)
            .then(response => response.json())
            .then(data => {
                const items = data[dataKey];
                const initialItems = items.slice(0, initialDisplayCount);
                const remainingItems = items.slice(initialDisplayCount);

                // Clear container and add new rows
                displayContainer.innerHTML = "";

                // Display initial items
                initialItems.forEach(item => {
                    const tableRow = createNewsTableRow(item, lang);
                    displayContainer.appendChild(tableRow);
                });

                // Display remaining items on button click
                // if (remainingItems.length > 0) {
                //     showMoreButton.style.display = "block";
                //     showMoreButton.onclick = () => {
                //         remainingItems.forEach(item => {
                //             const tableRow = createNewsTableRow(item, lang);
                //             displayContainer.appendChild(tableRow);
                //         });
                //         showMoreButton.style.display = "none";
                //     };
                // } else {
                //     showMoreButton.style.display = "none";
                // }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Function to create each news row
    function createNewsTableRow(item, lang) {
        const tableRow = document.createElement("tr");
        const dateCell = document.createElement("td");
        const eventCell = document.createElement("td");

        // Set font weight to normal
        dateCell.style.fontWeight = "normal";
        eventCell.style.fontWeight = "normal";

        // Set date and event text based on selected language
        dateCell.textContent = item.date[lang];
        eventCell.innerHTML = item.event[0][lang]; // Event content in selected language

        tableRow.appendChild(dateCell);
        tableRow.appendChild(eventCell);
        return tableRow;
    }

    // Load initial data with default language
    loadDataAndDisplay(currentLanguage);

    // Language switch button click event
    document.getElementById("lang-switch").addEventListener("click", () => {
        currentLanguage = currentLanguage === "en" ? "jp" : "en";
        localStorage.setItem("language", currentLanguage);
        loadDataAndDisplay(currentLanguage);
    });
});
