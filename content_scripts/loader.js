var OPTIONS;

chrome.storage.sync.get(DEFAULT_OPTIONS, function(options) {
    OPTIONS = options;

    // Only run if the current domain isn't excluded!
    if (!OPTIONS.excludedHostnames.hasOwnProperty(window.location.hostname)) {
        chrome.runtime.sendMessage({"inject": true});
    }
});