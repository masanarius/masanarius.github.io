function getImageName(path) {
    return path
        .split("/")
        .pop()
        .replace(".png", "");
}

function rebuildImageList() {

    imageList.length = 0;

    const playerID = Number(getPlayerID());

    const mod = playerID % PLAYER_MOD_BASE;

    const rule =
        hiddenRuleByPlayerMod[mod];

    for (const col of COL) {
        for (const pat of PAT) {
            for (const shp of SHP) {

                if (rule.COL.includes(col)) {
                    continue;
                }

                if (rule.PAT.includes(pat)) {
                    continue;
                }

                if (rule.SHP.includes(shp)) {
                    continue;
                }

                imageList.push(
                    `images/${col}_${pat}_${shp}.png`
                );
            }
        }
    }
}

function getRandomImages(list, count) {
    const shuffled =
        [...list].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, count);
}

function hideImages() {

    ["img1", "img2", "img3"].forEach((id) => {

        const img = document.getElementById(id);

        img.removeAttribute("src");

        img.classList.add("hidden");

    });
}

function preloadImages(paths, callback) {

    let loadedCount = 0;

    paths.forEach((path) => {

        const img = new Image();

        img.onload = img.onerror = () => {

            loadedCount++;

            if (loadedCount === paths.length) {
                callback();
            }
        };

        img.src = path;
    });
}

function setRandomImages() {

    if (imageList.length === 0) {
        rebuildImageList();
    }

    let nextImages = [];

    do {
        nextImages =
            getRandomImages(imageList, 3);
    } while (
        imageList.length > 3 &&
        currentImages.length === 3 &&
        nextImages.every((path, index) => path === currentImages[index])
    );

    preloadImages(nextImages, () => {

        currentImages =
            nextImages;

        const imageIDs =
            ["img1", "img2", "img3"];

        const scoreIDs =
            ["score1", "score2", "score3"];

        currentImages.forEach((path, index) => {

            const img =
                document.getElementById(imageIDs[index]);

            const popup =
                document.getElementById(scoreIDs[index]);

            const { shp } =
                getImageInfo(path);

            img.src =
                path;

            img.classList.remove("hidden");

            const scale =
                shapeScale[shp] || 1.0;

            img.style.maxWidth = "92%";
            img.style.maxHeight = "92%";
            img.style.transform =
                `scale(${scale})`;

            popup.classList.add("hidden");
        });
    });
}