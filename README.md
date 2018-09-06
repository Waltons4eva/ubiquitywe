# UbiquityWE <sup>EXPERIMENTAL</sup>

Ubiquity Addon for Firefox Quantum

More at: https://wiki.mozilla.org/Labs/Ubiquity/Ubiquity_0.5_User_Tutorial

[DOWNLOAD (Firefox Add-On)](https://github.com/GChristensen/ubichr/releases/download/v0.2.0.10/ubiquity_webeextension.xpi) :: [VIDEO MANUAL](https://youtu.be/zHOO-k5jpIU)

![screen](screen.png?raw=true)

SEE ALSO: [Enso Portable](https://github.com/GChristensen/enso-portable#readme)

Original Ubiquity was a promising project aimed to familiarize masses with 
natural language user interfaces. But eventually, as it was expected, it went popular 
only within a community of handful of geeks, although, the [impressive repository](https://wiki.mozilla.org/Labs/Ubiquity/Commands_In_The_Wild) 
of commands was created. Because "legacy" Firefox addons were able to do pretty 
anything with the browser, there was much sense and joy in it. 
Due to the more restrictive nature of Firefox Quantum you can do notable less currently,
but Ubiquity is still immensely useful if you are able to write JavaScript to automate
things you have (web)API for, to make intricate org-mode protocol capture schemes, etc., etc.     
 

Unfortunately, almost all codebase of the original ubiquity is not functional in 
Firefox Quantum and there were several attempts to resurrect it. This is a fork of 
the Chrome Ubiquity addon (UbiChr) by [rostok](https://github.com/rostok/ubichr) which lacked parser. 
At the moment UbiquityWE differs from the original UbiChr in the following ways:

* Works nicely in Firefox 60+ (also works in Chrome).
* The fully functional parser of the last version of the original "legacy" Ubiquity by 
[satyr](https://bitbucket.org/satyr/ubiquity) is implanted, so the existing "legacy" 
commands (which are still compatible with the new Firefox functionality) could be ported more seamlessly 
(there is no backward compatibility with the existing parserless UbiChr commands).
* Completion by TAB key and clickable suggestions.
* Some missing API of "legacy" Ubiquity CmdUtils (eg. renderTemplate, getHtmlSelection) is implemented.
* Ace code editor (which has decent search functionality) is used instead of CodeMirror.
* Settings and command list pages are resemble the ones from the original Ubiquity.
* User command categories ("Namespaces") are available.
* Some commands removed/renamed/added.
* Some minor fixes.

Notes

* The original Ubiquity commands were sandboxed from the browser API, CmdUtils module
was the primary interface to it. There are no such restrictions in UbiquityWE: commands
have access to the full WebExtension API. But you still may need to add necessary permissions
in manifest.json and rebuild the addon.
* NounType system of the original Ubiquity parser is a powerful tool which allows to
add dynamic things (such as the set of current tabs) to parser suggestion list. 
Find more at [nountypes](https://bitbucket.org/satyr/ubiquity/src/f50c546669f3a66979ab7d64af4b166f7d5a488a/ubiquity/modules/?at=default)
and [builtin commands](https://bitbucket.org/satyr/ubiquity/src/f50c546669f3a66979ab7d64af4b166f7d5a488a/ubiquity/standard-feeds/?at=default)
of the original Ubiquity.

TODO

* Cancellable preview/execution handlers & sort out current preview show/execution order
* Ubiquity Touch: add a popup near selection a la Oxford Dictionary one to execute predefined 
commands with set arguments on the selection (useful for various dictionary/clipping apps 
on touch devices)
* Implement permanent suggestion statistics (SuggestionMemory)