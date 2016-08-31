$(function() {
    var reLink = $('#re-link');
    var statusText = $('#status-text');

    reLink.click(linkCurrentPage);
    statusText.hide();

    // Send a message to the content script telling it to find links in the page again
    function linkCurrentPage() {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                link: 'all'
            }, function(response) {
                if (response.success) {
                    updateStatus();
                }
            });
        });
    }

    function updateStatus(linksFound) {
        var linkText = ' ' + (linksFound ? linksFound : 'No') + ' link' + (linksFound === 1 ? '' : 's') + ' found.';
        statusText.text('Done!' + linkText);
        statusText.fadeIn();
        setTimeout(function() {
            statusText.fadeOut();
        }, 2000);
    }
});