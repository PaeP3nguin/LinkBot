# LinkBot
LinkBot is a Chrome extension that converts URLs and emails in text to links. LinkBot is MIT-licensed and free to use.

A few examples that LinkBot will find:
* example.com
* https://github.com
* www.somesite.com
* path.org/file/is/here#id
* person@test.com
* bit.ly
* 127.0.0.1

## Usage
[Install LinkBot on the Chrome Web Store.](https://chrome.google.com/webstore/detail/chnfcfcbnhloogdohcmjogkklghefofm). To exclude a page from being linked, just click the LinkBot icon and select "Don't run on this page."

## Implementation
The core of LinkBot is a pair of custom regular expressions, one to find URLs and another for emails. A regular expression to capture the entire set of possible URLs is extremely tricky to compose and may produce false positive, so LinkBot favors accurate matching of common URLs. The regexes, along with informative comments, can be found in [content_scripts/regex.js](https://github.com/PaeP3nguin/LinkBot/blob/master/content_scripts/regex.js).

## Development
Installing this extension to test it locally is easy. Chrome extensions don't need to be built or compiled and you can just install the code directly. Just follow [Google's instructions](https://developer.chrome.com/extensions/getstarted#manifest) (ignore the stuff about the manifest, just follow the three steps).

## Contributing
If you'd like to contribute to LinkBot, just send a PR. Before making a large change, please file an issue first so we can discuss.
