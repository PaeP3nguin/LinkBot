MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// var observer = new MutationObserver(function(mutations) {
//   mutations.forEach(function(mutation) {
//     console.log(mutation.type);
//   });
// }).observe(document.body, {subtree: true, characterData: true});

var TEMP_CHAR = '\uFFFF';

function convertLinks() {
  var walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  var exclude = {
    'A': true,
    'IFRAME': true,
    'OPTION': true,
    'SCRIPT': true,
    'STYLE': true,
    'CITE': true,
    'TITLE': true,
    'TEXTAREA': true,
    'INPUT': true
  };

  var emails = [];
  var i = 0;

  function replaceEmailTemp(match) {
    emails.push('<a href="mailto:' + match + '">' + match + '</a>');
    return TEMP_CHAR;
  }

  function getEmailTemp(match) {
    return emails[i++];
  }

  var node = walker.nextNode();
  var oldText;

  while (node !== null) {
    // Reset email replacement variables
    i = 0;
    emails = [];

    oldText = node.data;

    // If we're one of the unwanted tags, don't do anything
    if (node.parentElement && node.parentElement.tagName in exclude) {
      node = walker.nextNode();
      continue;
    }

    // Save emails and replace with a temporary, noncharacter Unicode character
    var newText = oldText.replace(EMAIL_REGEX, replaceEmailTemp);

    // Replace URLs
    newText = newText.replace(URL_REGEX, '<a href="http://$&">$&</a>');

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

setTimeout(convertLinks, 500);
