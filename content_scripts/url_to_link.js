// Temporary placeholder for potentially conflicting email substitution
var TEMP_CHAR = '\uFFFF';
var TEMP_CHAR_REGEX = /\uFFFF/gi;

// Smallest possible link is something like m.co
var MIN_LINK_SIZE = 4;

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

// Execution starts here!
// Get options, then run convert links as needed
chrome.storage.sync.get({
  linkOnLoad: true,
  linkOnChange: true,
  linkEmails: true
}, function(options) {
  if (options.linkOnLoad) {
    recursiveLink(document.body, options);
  }

  if (options.linkOnChange) {
    var observeOptions = {
      subtree: true,
      characterData: true,
      childList: true
    };

    // Watch for DOM changes
    var observer = new MutationObserver(function(mutations) {
      // Stop watching so we don't see mutations that we're causing
      observer.disconnect();
      mutations.forEach(function(m) {
        if (m.type === "characterData") {
          // Actual text node itself changed
          if (areParentsExcluded(m.target)) {
            return;
          }

          linkTextNode(m.target, options);
        } else if (m.type === "childList") {
          // Added or removed stuff somewhere
          m.addedNodes.forEach(function(node) {
            if (areParentsExcluded(node)) {
              return;
            }

            if (node.nodeType === Node.TEXT_NODE) {
              linkTextNode(node, options);
            } else {
              recursiveLink(node, options);
            }
          });
        }
      });
      observer.observe(document.body, observeOptions);
    });

    observer.observe(document.body, observeOptions);
  }
});

// Function to test if any of the parents of a node are in EXCLUDED_TAGS
function areParentsExcluded(node) {
  var parent = node.parentNode;
  while (parent !== null) {
    if (parent.tagName in EXCLUDED_TAGS) {
      return true;
    } else {
      parent = parent.parentNode;
    }
  }

  return false;
}

// Function to convert all links under a root node
function recursiveLink(root, options) {
  // Initialize a TreeWalker to start looking at text from the root node
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL, {
    acceptNode: nodeFilter
  }, false);

  var node = walker.nextNode();

  function nextNode() {
    node = walker.nextNode();
  }

  while (node !== null) {
    linkTextNode(node, options, nextNode, nextNode);
  }
}

// Filter for TreeWalker to determine which nodes to return
function nodeFilter(node) {
  // Skip node and all children of any excluded tags
  if (node.tagName in EXCLUDED_TAGS) {
    return NodeFilter.FILTER_REJECT;
  }

  // Skip nodes that aren't text
  if (node.nodeType != Node.TEXT_NODE) {
    return NodeFilter.FILTER_SKIP;
  }

  // Skip node if the text is too short to be a link
  var text = node.data.trim();
  if (text.length <= MIN_LINK_SIZE) {
    return NodeFilter.FILTER_REJECT;
  }

  return NodeFilter.FILTER_ACCEPT;
}

function linkTextNode(node, options, onBeforeReplace, onSkipped) {
  // Email saving variables and functions
  var emails = [];
  var i = 0;

  function stashEmail(email) {
    emails.push('<a href="mailto:' + email + '">' + email + '</a>');
    return TEMP_CHAR;
  }

  function getEmail() {
    return emails[i++];
  }

  // Save the text to compare with later
  var oldText = node.data;
  var newText = oldText;

  if (options.linkEmails) {
    // Save emails and replace with a temporary, noncharacter Unicode character
    // We'll put the emails back in later
    // Why? Because otherwise the part after the @ sign will be recognized and replaced as a URL!
    newText = newText.replace(EMAIL_REGEX, stashEmail);
  }

  // Replace URLs with links
  newText = newText.replace(URL_REGEX, '<a href="//$1">$&</a>');

  if (options.linkEmails) {
    // Put emails back in
    newText = newText.replace(TEMP_CHAR_REGEX, getEmail);
  }

  if (newText !== oldText) {
    // If we successfully added any links
    console.log(newText);
    if (onBeforeReplace !== undefined) {
      onBeforeReplace();
    }
    $(node).replaceWith(newText);
  } else if (onSkipped !== undefined) {
    onSkipped();
  }
}