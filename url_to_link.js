MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// var observer = new MutationObserver(function(mutations) {
//   mutations.forEach(function(mutation) {
//     console.log(mutation.type);
//   });
// }).observe(document.body, {subtree: true, characterData: true});

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

  // Better UX if we don't, tags may be user input or contain HTML
  CITE: true,
  TITLE: true,
  TEXTAREA: true,
  INPUT: true,
  PRE: true,
  CODE: true,
};

function convertLinks() {
  // Initialize a TreeWalker to start looking at text in the body of the document
  var walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ALL, {
      acceptNode: excludeNodes
    },
    false
  );

  var node = walker.nextNode();
  var oldText;

  while (node !== null) {
    // Reset email replacement variables
    emails = [];
    i = 0;

    oldText = node.data;

    // Save emails and replace with a temporary, noncharacter Unicode character
    // We'll put the emails back in later
    // Why? Because otherwise the part after the @ sign will be recognized and replaced as a URL!
    var newText = oldText.replace(EMAIL_REGEX, stashEmail);

    // Replace URLs with links
    newText = newText.replace(URL_REGEX, '<a href="//$1">$&</a>');

    // Put emails back in
    newText = newText.replace(TEMP_CHAR_REGEX, getEmail);

    if (newText !== oldText) {
      // If we successfully added any links
      console.log(newText);
      // Get the next node before we add links the current one so we don't look at it again
      var temp = $(node);
      node = walker.nextNode();
      temp.replaceWith(newText);
    } else {
      // No URLs or emails found, keep looking
      node = walker.nextNode();
    }
  }
}


// Filter for the TreeWalker to determine which nodes to return
function excludeNodes(node) {
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
    return NodeFilter.FILTER_SKIP;
  }

  return NodeFilter.FILTER_ACCEPT;
}


// Helper functions for email replacement
var emails = [];
var i = 0;
function stashEmail(email) {
  emails.push('<a href="mailto:' + email + '">' + email + '</a>');
  return TEMP_CHAR;
}

function getEmail() {
  return emails[i++];
}

setTimeout(convertLinks, 1500);