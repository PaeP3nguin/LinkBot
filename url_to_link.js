MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations) {
  console.log('mutation!');
  observer.disconnect();
  mutations.forEach(function(m) {
    if (m.type === "characterData") {
      // console.log(m);
    } else if (m.type === "childList") {
      // console.log(m);
      m.addedNodes.forEach(function(node) {
        if (node.nodeType == Node.TEXT_NODE) {
          linkifyNode(node);
        } else {
          convertLinks(node);
        }
      });
    }
  });
  observer.observe(document.body, {
    subtree: true,
    characterData: true,
    childList: true
  });
});

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

function convertLinks(root) {
  // Initialize a TreeWalker to start looking at text from the root node
  var walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ALL, {
      acceptNode: excludeNodes
    },
    false
  );

  var node = walker.nextNode();

  function nextNode() {
    node = walker.nextNode();
  }

  while (node !== null) {
    linkifyNode(node, nextNode, nextNode);
  }
}

function linkifyNode(node, onBeforeReplace, onSkipped) {
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
    if (onBeforeReplace !== undefined) {
      onBeforeReplace();
    }
    $(node).replaceWith(newText);
  } else if (onSkipped !== undefined) {
    onSkipped();
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

setTimeout(function() {
  convertLinks(document.body);

  observer.observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true
  });
}, 1500);