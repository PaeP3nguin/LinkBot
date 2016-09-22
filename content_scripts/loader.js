var OPTIONS;

chrome.storage.sync.get(DEFAULT_OPTIONS, function(options) {
    OPTIONS = options;

    if (Object.keys(OPTIONS.excludedHostnames).length === 0) {
      OPTIONS.excludedHostnames = DEFAULT_EXCLUDED_HOSTNAMES;
    }

    // Only run if the current domain isn't excluded!
    if (!OPTIONS.excludedHostnames.hasOwnProperty(window.location.hostname)) {
        chrome.runtime.sendMessage({"inject": true});
    }
});