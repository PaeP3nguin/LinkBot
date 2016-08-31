$(function() {
    var statusText = $('#status-text');
    var reLink = $('#re-link');
    var options = $('#options');

    reLink.click(linkCurrentPage);
    options.click(openOptions);

    // Send a message to the content script telling it to find links in the page again
    function linkCurrentPage() {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                link: 'all'
            }, function(response) {
                if (response) {
                    // Looked for links successfully
                    updateStatus(response.linksFound);
                } else {
                    // Didn't get a response, might be on chrome page or page loading
                    // Show no links found
                    updateStatus(0);
                }
            });
        });
    }

    // Timer handle for the fade-in of original button text
    var statusFade;

    function updateStatus(linksFound) {
        var linkText = ' ' + (linksFound ? linksFound : 'No') + ' link' + (linksFound === 1 ? '' : 's') + ' found';
        statusText.fadeOut(200, function() {
            statusText.text(linkText);
            statusText.fadeIn();
        });

        clearTimeout(statusFade);
        statusFade = setTimeout(function() {
            statusText.fadeOut(400, function() {
                statusText.text('Find links');
                statusText.fadeIn();
            });
        }, 2000);
    }
    
    function openOptions() {
        if (chrome.runtime.openOptionsPage) {
            // New way to open options pages, if supported (Chrome 42+).
            chrome.runtime.openOptionsPage();
        } else {
            // Reasonable fallback.
            window.open(chrome.runtime.getURL('options.html'));
        }
    }

});