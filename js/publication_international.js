document.addEventListener("DOMContentLoaded", () => {
    const jsonFilePath = "json/publication_international.json";
    const displayContainer = document.querySelector("#international-container"); // Container for publications
    const showMoreButton = document.querySelector("[data-key='publication.show-more-international']");
    const initialDisplayCount = 3; // Initial display count
    const dataKey = "array"; // JSON key for publications
    let currentLanguage = localStorage.getItem("language") || "jp"; // Default language setting

    // Function to load and display publication data
    function loadDataAndDisplay(lang) {
        fetch(jsonFilePath)
            .then(response => response.json())
            .then(data => {
                const items = data[dataKey];
                const initialItems = items.slice(0, initialDisplayCount);
                const remainingItems = items.slice(initialDisplayCount);

                // Clear container and create a new ordered list
                displayContainer.innerHTML = "";
                const orderedList = document.createElement("ol");

                // Display initial items
                initialItems.forEach(item => {
                    const listItem = createPublicationListItem(item, lang);
                    orderedList.appendChild(listItem);
                });
                displayContainer.appendChild(orderedList);

                // Display remaining items on button click
                if (remainingItems.length > 0) {
                    showMoreButton.style.display = "block";
                    showMoreButton.onclick = () => {
                        remainingItems.forEach(item => {
                            const listItem = createPublicationListItem(item, lang);
                            orderedList.appendChild(listItem);
                        });
                        showMoreButton.style.display = "none";
                    };
                } else {
                    showMoreButton.style.display = "none";
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Function to create each publication list item with gray formatting for certain fields
    function createPublicationListItem(item, lang) {
        const listItem = document.createElement("li");
        listItem.classList.add("publication-list-item");

        const title = item.title[0][lang];
        const author = item.author[0][lang];
        const conference = item.conference[0][lang] || "";
        const book = item.book[0][lang] || "";
        const vol = item.vol || "";
        const no = item.no || "";
        const page = item.page || "";
        const month = item.month || "";
        const year = item.year || "";

        // Gray elements with commas where needed, all within the <span> tags
        const review = item.review[0][lang] ? `<span style="color: #aaaaaa;">${item.review[0][lang]}</span>` : "";
        const presentation = item.presentation[0][lang] ? `<span style="color: #aaaaaa;">${item.presentation[0][lang]}</span>` : "";
        const location = item.location[0][lang] ? `<span style="color: #aaaaaa;">${item.location[0][lang]}</span>` : "";
        const misc = item.misc[0][lang] ? `<span style="color: #aaaaaa;">${item.misc[0][lang]}</span>` : "";

        // Concatenate gray items with commas directly inside the <span> elements
        const supplementaryDetails = [review, presentation, location, misc]
            .filter(Boolean)
            .join('<span style="color: #aaaaaa;">, </span>');

        const mainDetails = [
            conference,
            book,
            vol,
            no,
            page,
            [month, year].filter(Boolean).join(" ") + (year ? "." : "")
        ].filter(Boolean).join(", ");

        listItem.innerHTML = `
            <p><strong>${title}</strong></p>
            <p>${author}</p>
            <p>${mainDetails}</p>
            <p>${supplementaryDetails}</p>
        `;
        return listItem;
    }

    loadDataAndDisplay(currentLanguage);

    document.getElementById("lang-switch").addEventListener("click", () => {
        currentLanguage = currentLanguage === "en" ? "jp" : "en";
        localStorage.setItem("language", currentLanguage);
        loadDataAndDisplay(currentLanguage);
    });
});
