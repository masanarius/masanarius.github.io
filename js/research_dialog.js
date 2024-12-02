document.addEventListener("DOMContentLoaded", () => {
    const jsonFilePath = "json/research_dialog.json";
    const displayContainer = document.querySelector("#dialog-container"); // Container for dialog items
    const showMoreButton = document.querySelector("[data-key='research.show-more-dialog']");
    const initialDisplayCount = 2; // Initial display count
    let currentLanguage = localStorage.getItem("language") || "jp"; // Default language setting

    // Function to load and display dialog data
    function loadDataAndDisplay(lang) {
        fetch(jsonFilePath)
            .then(response => response.json())
            .then(data => {
                const items = data.array;
                const initialItems = items.slice(0, initialDisplayCount);
                const remainingItems = items.slice(initialDisplayCount);

                // Clear container
                displayContainer.innerHTML = "";

                // Display initial items
                initialItems.forEach(item => {
                    const element = createElement(item, lang);
                    displayContainer.appendChild(element);
                });

                // Display remaining items on button click
                if (remainingItems.length > 0) {
                    showMoreButton.style.display = "block";
                    showMoreButton.onclick = () => {
                        remainingItems.forEach(item => {
                            const dialogElement = createElement(item, lang);
                            displayContainer.appendChild(dialogElement);
                        });
                        showMoreButton.style.display = "none";
                    };
                } else {
                    showMoreButton.style.display = "none";
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    // Function to create each dialog item
    function createElement(item, lang) {
        const container = document.createElement("div");
        container.classList.add("item");

        // Figure as img
        if (item.figure && item.figure[lang]) {
            const figure = document.createElement("img");
            figure.src = item.figure[lang];
            figure.alt = `Figure for ${item.title[lang]}`;
            container.appendChild(figure);
        }

        // Text container for h3 and p
        const textContainer = document.createElement("div");
        textContainer.classList.add("text-container");

        // Title as h3
        const title = document.createElement("h3");
        title.textContent = item.title[lang];
        textContainer.appendChild(title);

        // Content as p
        const content = document.createElement("p");
        content.innerHTML = item.content[lang];
        textContainer.appendChild(content);

        container.appendChild(textContainer);

        // Apply flex styles dynamically
        applyFlexStyles(container);

        return container;
    }

    // Function to apply flex styles dynamically
    function applyFlexStyles(container) {
        container.style.display = "flex"; // 基本的なフレックスボックス設定
    }

    // Initial load
    loadDataAndDisplay(currentLanguage);

    // Language switch
    document.getElementById("lang-switch").addEventListener("click", () => {
        currentLanguage = currentLanguage === "en" ? "jp" : "en";
        localStorage.setItem("language", currentLanguage);
        loadDataAndDisplay(currentLanguage);
    });
});
