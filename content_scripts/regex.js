// Copyright (c) 2010-2013 Diego Perini (http://www.iport.it)
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

/**
 * Both regular expessions are derived from Diego Perini's excellent web URL regular expression
 * Original gist link: https://gist.github.com/dperini/729294
 * The philosophy for both regexes is to match common examples for the best user experience, not to
 * adhere strictly to RFCs
 *
 * Differences from original:
 *   Split email into separate regex
 *   Disregard user:pass@example.com style urls
 *   Removed IP address exclusions, will match any IPv4 address from 0.0.0.0 to 255.255.255.255
 *   Explicit TLD list of common TLDs
 *   Simplified host and domain matching
 *   Path must end in alphanumeric character or '='
 */

/*
  // Start after word boundary
  \b
    // Protocol
    (?:(?:https?|ftp):\/\/)?
    // Start of capture group for main url
    ((?:
        // IP address
        (?:[01]?\d?\d|2[0-4]\d|25[0-5])(?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}
      |
        // Host name
        (?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+
        // Domain name
        (?:\.(?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+)*
        // TLD
        \.
        (?:
          // Common
          com?|net|org|edu|gov|cc|in(?:fo)?|io|bi(?:z|d)|mobi|tv|bz|fm|am|me|
          // URL shorteners
          ly|gl|gdn?|do(?:wnload)?|tw|
          // ccTLDs
          us|tk|cn|de|uk|ru|nl|eu|br|au|fr|it|pl|jp|ws|ca|ws|es|ch|be|im|pr|pw|gs|nu|ie|mn|mp|rs|vg|lu|xn--[a-z\d-]{4,59}|
          // gTLDs
          xyz|top?|wang|win|cl(?:ub|ick)|li(?:nk)?|vip|online|science|si(?:te)?|racing|date|bar
        )
    )
    // Port number
    (?::\d{2,5})?
    // Path; must end in an alphanumeric or '='
    (?:[\/?#]\S*[a-z\u00a1-\uffff\d=])?)
  // Overall URL ends at a word boundary
  \b
*/
var URL_REGEX = /\b(?:(?:https?|ftp):\/\/)?((?:(?:[01]?\d?\d|2[0-4]\d|25[0-5])(?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}|(?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+(?:\.(?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+)*\.(?:com?|net|org|edu|gov|cc|in(?:fo)?|io|bi(?:z|d)|mobi|tv|bz|fm|am|me|ly|gl|gdn?|do(?:wnload)?|tw|us|tk|cn|de|uk|ru|nl|eu|br|au|fr|it|pl|jp|ws|ca|ws|es|ch|be|im|pr|pw|gs|nu|ie|mn|mp|rs|vg|lu|xn--[a-z\u00a1-\uffff\d-]{4,59}|xyz|top?|wang|win|cl(?:ub|ick)|li(?:nk)?|vip|online|science|si(?:te)?|racing|date|bar))(?::\d{2,5})?(?:[\/?#]\S*[a-z\u00a1-\uffff\d=])?)\b/gi;

/*
  // Start after word boundary
  \b
    // Everything before the @ sign
    [\w\u00a1-\uffff!#$%&'*+/=?^`{|}~-]+(?:\.[\w\u00a1-\uffff!#$%&'*+/=?^`{|}~-]+)*
      @
    (?:
        // IP address
        (?:[01]?\d?\d|2[0-4]\d|25[0-5])(?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}
      |
        // Host name
        (?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+
        // Domain name
        (?:\.(?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+)*
        // TLD, allow any
        \.
        (?:[a-z\u00a1-\uffff]{2,})
    )
    // End in an alphanumeric
    [a-z\u00a1-\uffff\d]?
  \b
*/
var EMAIL_REGEX = /\b[\w\u00a1-\uffff!#$%&'*+/=?^`{|}~-]+(?:\.[\w\u00a1-\uffff!#$%&'*+/=?^`{|}~-]+)*@(?:(?:[01]?\d?\d|2[0-4]\d|25[0-5])(?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}|(?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+(?:\.(?:[a-z\u00a1-\uffff\d]+-)*[a-z\u00a1-\uffff\d]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))[a-z\u00a1-\uffff\d]?\b/gi;

/*
  // Start after word boundary
  \b
*/
var SUBREDDIT_REGEX = /\br\/[a-z0-9][a-z0-9_]{2,20}\b/gi;
