$(function() {
  var toggleExcludeButton = $('#toggle-exclude');
  var excludeIcon = $('#exclude-icon');
  var excludeText = $('#exclude-text');
  var statusText = $('#status-text');
  var reLink = $('#re-link');
  var options = $('#options');
  var help = $('#help');

  var OPTIONS;
  var hostname;

  chrome.storage.sync.get(DEFAULT_OPTIONS, function(loaded) {
    OPTIONS = loaded;

    if (Object.keys(OPTIONS.excludedHostnames).length === 0) {
      OPTIONS.excludedHostnames = DEFAULT_EXCLUDED_HOSTNAMES;
    }

    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'hostname'
      }, function(response) {
        if (response) {
          hostname = response.hostname;

          setToggleExcludeButtonState(OPTIONS.excludedHostnames[hostname] === undefined);

          toggleExcludeButton.click(toggleExclude);
          toggleExcludeButton.show();

          reLink.click(linkCurrentPage);
        } else {
          reLink.hide();
        }

        options.click(openOptions);
        help.click(openHelp);
      });
    });
  });

  function toggleExclude() {
      if (OPTIONS.excludedHostnames.hasOwnProperty(hostname)) {
        // Currently excluded
        delete OPTIONS.excludedHostnames[hostname];
        chrome.storage.sync.set(OPTIONS, function() {
          setToggleExcludeButtonState(true, true);
        });
      } else {
        // Currently not excluded
        OPTIONS.excludedHostnames[hostname] = true;
        chrome.storage.sync.set(OPTIONS, function() {
          setToggleExcludeButtonState(false, true);
        });
      }
  }

  function setToggleExcludeButtonState(exclude, animate) {
    if (animate) {
      excludeIcon.hide();
      excludeText.hide();
    }
    excludeIcon.attr('src', exclude ? '/img/close/close-white-24.png' : '/img/check/check-white-24.png');
    excludeText.text(exclude ? "Don't run on this site" : "Run on this site");
    if (animate) {
      excludeIcon.fadeIn();
      excludeText.fadeIn();
    }
  }

  // Send a message to the content script telling it to find links in the page again
  function linkCurrentPage() {
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'link'
      }, function(response) {
        if (response) {
          // Looked for links successfully
          updateStatus(response.linkCount);
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

  function updateStatus(linkCount) {
    var linkText = ' ' + (linkCount ? linkCount : 'No') + ' link' + (linkCount === 1 ? '' : 's') + ' found';
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

  function openHelp() {
    // TODO: replace with actual ID when extension published
    window.open('https://chrome.google.com/webstore/detail/chnfcfcbnhloogdohcmjogkklghefofm/support');
  }
});