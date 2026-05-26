function sendLogToGoogleForms(logData) {

    if (!ENABLE_GOOGLE_FORMS) {
        return;
    }

    const formData = new FormData();

    Object.keys(logData).forEach((key) => {

        const entryID = FORM_ENTRIES[key];

        if (entryID) {
            formData.append(entryID, logData[key]);
        }

    });

    fetch(GOOGLE_FORM_ACTION_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
    });
}