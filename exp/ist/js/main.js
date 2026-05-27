initializeSelects();

const loaded =
    loadGameState();

updateTrialCounter();

updateTotalScoreArea();

updateCooldownArea();

if (!loaded) {
    hideImages();
}