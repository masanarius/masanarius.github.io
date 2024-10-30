document.addEventListener("DOMContentLoaded", () => {
    // Constants
    const jsonFilePath = "json/about_profile.json"; // JSON file path
    const displayTable = document.querySelector("#profile-table tbody"); // Table to display data
    const toggleButton = document.querySelector("[data-key='about.show-more-profile']"); // Button to show more
    const initialDisplayCount = 5; // Initial number of items to display
    const dataKey = "array"; // Key for JSON data
    let currentLanguage = localStorage.getItem("language") || "jp"; // Default language setting

    // Function to load data and display it in the table
    function loadDataAndDisplay(lang) {
        fetch(jsonFilePath) // Fetch data from JSON file
            .then(response => response.json())
            .then(data => {
                const items = data[dataKey]; // Get data array from JSON
                const initialItems = items.slice(0, initialDisplayCount); // Initial items to display
                const remainingItems = items.slice(initialDisplayCount); // Remaining items to display on click

                // Clear table content before re-drawing
                displayTable.innerHTML = "";

                // Display initial items
                initialItems.forEach(item => {
                    const row = createTableRow(item.label[lang], item.content[lang]);
                    displayTable.appendChild(row);
                });

                // Toggle button functionality to display remaining items
                toggleButton.style.display = remainingItems.length ? "block" : "none"; // Show button only if more items
                toggleButton.onclick = () => {
                    remainingItems.forEach(item => {
                        const row = createTableRow(item.label[lang], item.content[lang]);
                        displayTable.appendChild(row);
                    });
                    toggleButton.style.display = "none"; // Hide button after displaying all items
                };
            })
            .catch(error => console.error("Error fetching data:", error));
    }

    // Function to create table rows with label and content
    function createTableRow(label, content) {
        const row = document.createElement("tr");
        const labelCell = document.createElement("td");
        const contentCell = document.createElement("td");

        labelCell.innerHTML = `<strong>${label}</strong>`;
        contentCell.innerHTML = content;

        row.appendChild(labelCell);
        row.appendChild(contentCell);
        return row;
    }

    // Initial load of data with default language
    loadDataAndDisplay(currentLanguage);

    // Event listener for language switch button
    document.getElementById("lang-switch").addEventListener("click", () => {
        currentLanguage = currentLanguage === "en" ? "jp" : "en"; // Toggle language
        localStorage.setItem("language", currentLanguage); // Save language setting
        loadDataAndDisplay(currentLanguage); // Re-display data in the selected language
    });
});
