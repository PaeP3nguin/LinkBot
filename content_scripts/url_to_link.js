// Temporary placeholder for potentially conflicting email substitution
var TEMP_CHAR = '\uFFFF';
var TEMP_CHAR_REGEX = /\uFFFF/gi;

// A collection of tags to not replace text inside of
var EXCLUDED_TAGS = {
  // Already clickable
  A: true,
  BUTTON: true,
  OPTION: true,

  // May cause issues if we replace things
  IFRAME: true,
  NOSCRIPT: true,
  SCRIPT: true,
  STYLE: true,
  META: true,
  EMBED: true,

  // Better UX if we don't, tags may be user input or contain HTML
  CITE: true,
  TITLE: true,
  TEXTAREA: true,
  INPUT: true,
  PRE: true,
  CODE: true,
};

var userOptions;

// Execution starts here!
// Get options, then run convert links as needed
chrome.storage.sync.get({
  linkOnLoad: true,
  linkOnChange: true,
  linkEmails: true
}, function(options) {
  userOptions = options;

  if (userOptions.linkOnLoad) {
    recursiveLink(document.body);
  }

  if (userOptions.linkOnChange) {
    var observerOptions = {
      subtree: true,
      characterData: true,
      childList: true
    };

    // Delay observer starts to allow webpage js to run and prevent infinite loops
    var startWatching = function() {
      setTimeout(function() {
        // Start watching again
        observer.observe(document.body, observerOptions);
      }, 10);
    };

    // Watch for DOM changes
    var observer = new MutationObserver(function(mutations) {
      // Stop watching so we don't see mutations that we're causing
      observer.disconnect();
      mutations.forEach(function(m) {
        if (m.type === "characterData") {
          // Actual text node itself changed
          linkSingleNode(m.target);
        } else if (m.type === "childList") {
          // Added or removed stuff somewhere
          m.addedNodes.forEach(linkSingleNode);
        }
      });
      startWatching();
    });

    startWatching();
  }
});

// Listen to messages from the browser action
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.link === 'all') {
      var linksFound = recursiveLink(document.body);
      sendResponse({
        'linksFound': linksFound
      });
    }
  });

// Link a single node, checking if any of its parents are excluded
function linkSingleNode(node) {
  if (areParentsExcluded(node)) {
    return;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    linkTextNode(node);
  } else {
    recursiveLink(node);
  }
}

// Function to test if any of the parents of a node are in EXCLUDED_TAGS
function areParentsExcluded(node) {
  var parent = node.parentNode;
  while (parent !== null) {
    if (EXCLUDED_TAGS.hasOwnProperty(parent.tagName)) {
      return true;
    } else {
      parent = parent.parentNode;
    }
  }

  return false;
}

// Function to convert all links under a root node
// Returns an approximate lower bound of links found
function recursiveLink(root) {
  var linksFound = 0;

  // Initialize a TreeWalker to start looking at text from the root node
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
    acceptNode: nodeFilter
  }, false);

  var prev;
  var node = walker.nextNode();
  while (node !== null) {
    // Advance the walker past the current node to prevent
    // seeing the same text nodes twice due to our own DOM changes
    prev = node;
    node = walker.nextNode();
    if (linkTextNode(prev)) {
      // Links found
      linksFound++;
    }
  }

  return linksFound;
}

// Filter for TreeWalker to determine which nodes to return
function nodeFilter(node) {
  // Skip node and all descendants of any excluded tags
  if (EXCLUDED_TAGS.hasOwnProperty(node.tagName)) {
    return NodeFilter.FILTER_REJECT;
  }

  // Skip nodes that aren't text
  if (node.nodeType !== Node.TEXT_NODE) {
    return NodeFilter.FILTER_SKIP;
  }

  // Skip if text is too short to be a link
  // Shortest possible link is something like g.co
  if (node.data.trim().length <= 4) {
    return NodeFilter.FILTER_SKIP;
  }

  return NodeFilter.FILTER_ACCEPT;
}

// Find links in a text node. Returns true if any links are found
function linkTextNode(node) {
  // Email saving variables and functions
  var emails = [];
  var i = 0;

  // Save the text to compare with later
  var oldText = node.data;
  var newText = oldText;

  if (userOptions.linkEmails) {
    // Save emails and replace with a temporary, noncharacter Unicode character
    // We'll put the emails back in later
    // Why? Because otherwise the part after the @ sign will be recognized and replaced as a URL!
    newText = newText.replace(EMAIL_REGEX, function() {
      emails.push('<a href="mailto:' + email + '">' + email + '</a>');
      return TEMP_CHAR;
    });
  }

  // Replace URLs with links
  newText = newText.replace(URL_REGEX, '<a href="//$1">$&</a>');

  if (emails.length) {
    // Put emails back in, if any
    newText = newText.replace(TEMP_CHAR_REGEX, function() {
      return emails[i++];
    });
  }

  if (newText !== oldText) {
    // If we successfully added any links, insert into DOM
    $(node).replaceWith(newText);
  }

  return newText !== oldText;
}