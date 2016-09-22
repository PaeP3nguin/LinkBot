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
  H1: true,
};

var OPTIONS;

chrome.storage.sync.get(DEFAULT_OPTIONS, function(loaded) {
  OPTIONS = loaded;

  if (Object.keys(OPTIONS.excludedHostnames).length === 0) {
    OPTIONS.excludedHostnames = DEFAULT_EXCLUDED_HOSTNAMES;
  }

  // Site is excluded, don't run automatically
  if (OPTIONS.excludedHostnames.hasOwnProperty(window.location.hostname)) {
    return;
  }

  if (OPTIONS.linkOnLoad) {
    recursiveLink(document.body);
  }

  if (OPTIONS.linkOnChange) {
    var observerOptions = {
      subtree: true,
      characterData: true,
      childList: true
    };

    // Watch for DOM changes
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (areParentsExcluded(m.target)) {
          return;
        }

        var linkCount = 0;
        if (m.type === "characterData") {
          // Actual text node itself changed
          linkCount += linkSingleNode(m.target);
        } else if (m.type === "childList") {
          // Added or removed stuff somewhere
          for (var i = 0, l = m.addedNodes.length; i < l; i++) {
            linkCount += linkSingleNode(m.addedNodes[i]);
          }
        }

        if (linkCount > 0) {
          // Stop and restart watching so we don't see mutations that we're causing
          // and allow webpage JS to run, which prevents infinite loops
          observer.disconnect();
          setTimeout(function() {
            observer.observe(document.body, observerOptions);
          }, 0);
        }
      });
    });

    observer.observe(document.body, observerOptions);
  }
});

// Listen to messages from the browser action
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === 'link') {
      sendResponse({
        linkCount: recursiveLink(document.body)
      });
    } else if (request.action === 'hostname') {
      sendResponse({
        hostname: window.location.hostname
      });
    }
  });

// Link a single node based on its nodeType, returns number of nodes found
function linkSingleNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    // Skip if text is too short to be a link
    // Shortest possible link is something like g.co
    if (node.data.trim().length <= 4) {
      return 0;
    }
    return linkTextNode(node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Skip node and all descendants of an editable node
    if (isNodeEditable(node)) {
      return 0;
    }
    return recursiveLink(node);
  }

  return 0;
}

// Test if any of the parents of a node are in EXCLUDED_TAGS or are editable
function areParentsExcluded(node) {
  var parent = node.parentNode;
  while (parent !== null) {
    if (EXCLUDED_TAGS.hasOwnProperty(parent.tagName) || isNodeEditable(parent)) {
      return true;
    } else {
      parent = parent.parentNode;
    }
  }

  return false;
}

// Tests whether a node is contentEditable
function isNodeEditable(node) {
  return node.isContentEditable || node.contentEditable === "true";
}

// Convert all links under a root node, returns number of links found
function recursiveLink(root) {
  // Initialize a TreeWalker to start looking at text from the root node
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
    acceptNode: nodeFilter
  }, false);

  var prev;
  var node = walker.nextNode();
  var linkCount = 0;
  while (node !== null) {
    // Advance the walker past the current node to prevent
    // seeing the same text nodes twice due to our own DOM changes
    prev = node;
    node = walker.nextNode();
    linkCount += linkTextNode(prev);
  }

  return linkCount;
}

// Filter for TreeWalker to determine which nodes to examine
function nodeFilter(node) {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      // Skip if text is too short to be a link
      // Shortest possible link is something like g.co
      if (node.data.trim().length <= 4) {
        return NodeFilter.FILTER_SKIP;
      }

      return NodeFilter.FILTER_ACCEPT;
    case Node.ELEMENT_NODE:
      // Skip node and all descendants of an editable node
      if (isNodeEditable(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      // Skip node and all descendants of any excluded tags
      if (EXCLUDED_TAGS.hasOwnProperty(node.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }

      // Pass by boring old non-text nodes
      return NodeFilter.FILTER_SKIP;
    default:
      // What are you????
      return NodeFilter.FILTER_SKIP;
  }
}

// Find links in a text node. Returns number of links found
function linkTextNode(node) {
  // Email saving variables and functions
  var emails = [];
  var i = 0;

  var urlCount = 0;

  // Save the text to compare with later
  var oldText = node.data;
  var newText = oldText;

  if (OPTIONS.linkEmails) {
    // Save emails and replace with a temporary, noncharacter Unicode character
    // We'll put the emails back in later
    // Why? Because otherwise the part after the @ sign will be recognized and replaced as a URL!
    newText = newText.replace(EMAIL_REGEX, function(email) {
      emails.push('<a href="mailto:' + email + '">' + email + '</a>');
      return TEMP_CHAR;
    });
  }

  // Replace URLs with links
  newText = newText.replace(URL_REGEX, function(match, part) {
    urlCount++;
    return '<a href="//' + part + '">' + match + '</a>';
  });

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

  return i + urlCount;
}