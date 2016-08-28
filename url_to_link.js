MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// var observer = new MutationObserver(function(mutations) {
//   mutations.forEach(function(mutation) {
//     console.log(mutation.type);
//   });
// }).observe(document.body, {subtree: true, characterData: true});

// Temporary placeholder for potentially conflicting email substitution
var TEMP_CHAR = '\uFFFF';
// Smallest possible link is something like m.co
var MIN_LINK_SIZE = 4;
// A collection of tags to not replace text inside of
var EXCLUDED_TAGS = {
  // Already clickable
  A: true,
  OPTION: true,

  // May cause issues
  IFRAME: true,
  NOSCRIPT: true,
  SCRIPT: true,
  STYLE: true,
  META: true,

  // Better UX if we don't
  CITE: true,
  TITLE: true,
  TEXTAREA: true,
  INPUT: true
};

function convertLinks() {
  var walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  var emails = [];
  var i = 0;

  function replaceEmailTemp(match) {
    emails.push('<a href="mailto:' + match + '">' + match + '</a>');
    return TEMP_CHAR;
  }

  function getEmailTemp() {
    return emails[i++];
  }

  var node = walker.nextNode();
  var oldText;

  while (node !== null) {
    // Reset email replacement variables
    i = 0;
    emails = [];

    oldText = node.data;

    if (!shouldExamine(node)) {
      // Skip this node
      node = walker.nextNode();
      continue;
    }

    // Save emails and replace with a temporary, noncharacter Unicode character
    var newText = oldText.replace(EMAIL_REGEX, replaceEmailTemp);

    // Replace URLs
    newText = newText.replace(URL_REGEX, '<a href="//$1">$&</a>');

    // Put emails back in
    newText = newText.replace(TEMP_CHAR, getEmailTemp);

    // Only replace text if the new value is actually different!
    if (newText !== oldText) {
      console.log(newText);
      var temp = $(node);
      node = walker.nextNode();
      temp.replaceWith(newText);
    } else {
      node = walker.nextNode();
    }
  }
}

// Function to decide whether or not to bother examining a text node, returns a boolean
function shouldExamine(node) {
  // Check if text is in one of the excluded tags
  if (node.parentElement && node.parentElement.tagName in EXCLUDED_TAGS) {
    return false;
  }
  // Check if the text is too short to be a link
  var text = node.data.trim();
  if (text.length <= MIN_LINK_SIZE) {
    return false;
  }

  return true;
}

setTimeout(convertLinks, 1500);
