function executeScript(tabId, details) {
    return new Promise(function (resolve, reject) {
        chrome.tabs.executeScript(tabId, details, resolve);
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.inject) {
        // Inject all code at document_idle
        executeScript(sender.tab.id, {file: "/lib/jquery-3.1.0.slim.min.js"}).then(function() {
            executeScript(sender.tab.id, {file: "/content_scripts/regex.js"});
        }).then(function() {
            executeScript(sender.tab.id, {file: "/content_scripts/main.js"});
        });
    }
});