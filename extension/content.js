(async function () {
    const data = await chrome.storage.local.get(['pendingCode', 'pendingExt']);


    if (data.pendingCode) {
        const sourceTextarea = document.getElementById('sourceCodeTextarea');
        const langSelect = document.querySelector('select[name="programTypeId"]');
        const submitButton = document.getElementById('singlePageSubmitButton');

        if (sourceTextarea) {
            sourceTextarea.value = data.pendingCode;

            // triger event to update visual textarea
            sourceTextarea.dispatchEvent(new Event('change', { bubbles: true }));

            if (langSelect) {
                switch (data.pendingExt) {
                    case "cpp":
                        langSelect.value = "89"; // C++20 (GCC 13-64)
                        break;
                    case "py":
                        langSelect.value = "70"; // PyPy 3.10
                        break;
                }
                langSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            if (submitButton) {

                setTimeout(() => { submitButton.click() }, 100);
            }
        }
    }

    // clean up old data even if injecting fails
    await chrome.storage.local.remove(['pendingCode', 'pendingExt', 'pendingUrl']);
})();
