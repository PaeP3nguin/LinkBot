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


// Both regular expessions are derived from Diego Perini's excellent web URL regular expression
// Gist link: https://gist.github.com/dperini/729294
// The philosophy for both regexes is to match common examples for the best user experience, not to
// adhere strictly to RFCs


/*
URL regex modifications:
    No longer matches emails or username:password@example.com
    Removed IP address exclusions, will match any IPv4 address from 0.0.0.0 to 255.255.255.255
    Disallow TLDs ending with '.'

// Protocol
(?:(?:https?|ftp):\/\/)?
(?:
    // IP address
    (?:[01]?\d?\d|2[0-4]\d|25[0-5])(?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}
    |
    // Host name
    (?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)
    // Domain name
    (?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*
    // TLD
    (?:\.(?:[a-z\u00a1-\uffff]{2,}))
)
// Port number
(?::\d{2,5})?
// Everything else
// End in something that isn't a quotation mark or whitespace
(?:[/?#]\S*[^"\s])?
*/
var URL_REGEX = /(?:(?:https?|ftp):\/\/)?(?:(?:[01]?\d?\d|2[0-4]\d|25[0-5])(?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*[^"\s])?\b/gi;


/*
// Everything before the @ sign
(?:(?:[a-z\u00a1-\uffff\d!#$%&'*+/=?^_`{|}~-])+(?:\.[a-z\u00a1-\uffff\d!#$%&'*+/=?^_`{|}~-]+)*@)
(?:
    // IP address
    (?:[01]?\d?\d|2[0-4]\d|25[0-5])
    (?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}
    |
    // Host name
    (?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)
    // Domain name
    (?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*
    // TLD
    (?:\.(?:[a-z\u00a1-\uffff]{2,}))
)
*/
var EMAIL_REGEX = /(?:(?:[a-z\u00a1-\uffff\d!#$%&'*+/=?^_`{|}~-])+(?:\.[a-z\u00a1-\uffff\d!#$%&'*+/=?^_`{|}~-]+)*@)(?:(?:[01]?\d?\d|2[0-4]\d|25[0-5])(?:\.(?:[01]?\d?\d|2[0-4]\d|25[0-5])){3}|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))/gi;
