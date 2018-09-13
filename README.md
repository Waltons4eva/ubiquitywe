# UbiquityWE <sup>EXPERIMENTAL</sup>

A natural language interface for web browsers.

[DOWNLOAD (Firefox Add-On)](https://github.com/GChristensen/ubichr/releases/download/v0.2.1.6/ubiquity_webeextension.xpi) :: [VIDEO MANUAL](https://youtu.be/8GAibcDncOc)

![screen](screen.png?raw=true)

SEE ALSO: [Enso Portable](https://github.com/GChristensen/enso-portable#readme), [Dark Flow](https://github.com/GChristensen/dark-flow#readme)

Ubiquity is a browser add-on that lets you give commands to a browser by entering command words into a special input box.
Commands are shortcuts for things that you commonly do on the Web; they can eliminate repetitive tasks and let you get more done, faster.
Your can write your own Ubiquity commands using the JavaScript programming language.

Find more at [Ubiquity User Tutorial](https://wiki.mozilla.org/Labs/Ubiquity/Ubiquity_0.5_User_Tutorial) and [Ubiquity Author Tutorial](https://wiki.mozilla.org/Labs/Ubiquity/Ubiquity_0.5_Author_Tutorial).

#### History

The original Ubiquity was a promising project aimed to familiarize masses with 
natural language user interfaces. But eventually, as it was expected, it went popular 
only within a community of handful of geeks, although, the [impressive repository](https://wiki.mozilla.org/Labs/Ubiquity/Commands_In_The_Wild) 
of commands was created. Because "legacy" Firefox addons were able to do pretty 
anything with the browser, there was much sense and joy in it. 
Due to the more restrictive nature of Firefox Quantum you can do notable less currently,
but Ubiquity is still immensely useful if you are able to write JavaScript to automate
things you have (web)API for, to make intricate org-mode protocol capture schemes, etc., etc.     
 

Unfortunately, almost all codebase of the original ubiquity is not functional in 
Firefox Quantum. There were several attempts to resurrect it, and this is a fork of 
the Chrome Ubiquity addon (UbiChr) by [rostok](https://github.com/rostok/ubichr) 
which lacked parser. Besides the introduction of the parser from the last version 
of "legacy" Ubiquity by [satyr](https://bitbucket.org/satyr/ubiquity)
 UbiqutyWE improves it in many other ways.
 
#### Additional functionality not found in the original Ubiquity

* Ability to add commands to browser context menu.
* Custom command categories.

#### Currently implemented API

Although UbiquityWE is aimed to retain resemblance with the original Ubiquity as much as possible,
there are some notable differences which emerge, in part, from Firefox Quantum limitations:

* Since there is no sandboxed evaluation available in Firefox WebExtensions, the
[Bin](https://wiki.mozilla.org/Labs/Ubiquity/Ubiquity_0.5_Author_Tutorial#Persistent_Storage)
persistent storage interface is reachable through command method arguments.
Insert the "full-featured command" in UbiquityWE command editor for an example.
* There are two additional command methods available:
  * init() - called once on Ubiquity load.
  * popup(popup_document) - called each time Ubiquity popup is shown with the popup document
    as the parameter. Any document-wide CSS/script injection should be done here.
* Because there is no command subscription model anymore, each command is required to
 have an UUID. Although a command generally will run without an UUID, in this case it
 would not be able to store persistent data and it would be not possible to add such a command 
 to the browser context menu. An RFC 4122 v4 complaint UUID is generated automatically for commands
 added through command editor templates.

The original Ubiquity commands were sandboxed from the full browser API; there are 
no such restrictions in UbiquityWE: commands have access to the full WebExtension API. 
The API described below is implemented for backward compatibility and utility purposes. 
But you may still need to add necessary permissions in manifest.json and rebuild the 
addon if you are using browser's native WebExtension API in your commands. 

[UbiquityWE API Reference](API.md)

#### Debug mode

Debug mode allows to live-edit UbiquityWE settings as text, which may be useful if you
need to transfer them between Firefox profiles. To enter tebug mode type

`debug mode on` 

in the command line and press Enter. Similarly, type

`debug mode off`

to turn it off.


Behavior of Ubiquity in the debug mode may differ from the regular one.

#### TODO

* Redesign/refactor UbiquityWE in component-based architecture.
* Ubiquity Touch: add a popup near the page text selection a la Oxford Dictionary one to execute predefined 
commands with set arguments on the selection (useful for various dictionary/clipping apps 
on touch devices).
* I18N.