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
LinkBot can

## Implementation
The core of LinkBot is a pair of custom regular expressions, one to find URLs and another for emails. A regular expression to capture the entire set of possible URLs is extremely tricky to compose and may produce false positive, so LinkBot favors accurate matching of common URLs. The regexes, along with informative comments, can be found in [content_scripts/regex.js] (https://github.com/PaeP3nguin/LinkBot/blob/master/content_scripts/regex.js).
