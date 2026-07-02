initializeSelects();

const loaded =
    loadGameState();

updateTrialCounter();

updateTotalScoreArea();

updateCooldownArea();

updateRefreshButton();

if (!loaded) {
    hideImages();
}