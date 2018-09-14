# UbiquityWE <sup>EXPERIMENTAL</sup>

A natural language interface for web browsers.

[DOWNLOAD (Firefox Add-On)](https://github.com/GChristensen/ubichr/releases/download/v0.2.1.6/ubiquity_webeextension.xpi) :: [VIDEO MANUAL](https://youtu.be/V5LfGqmeMmw)

![screen](screen.png?raw=true)

SEE ALSO: [Enso Portable](https://github.com/GChristensen/enso-portable#readme), [Dark Flow](https://github.com/GChristensen/dark-flow#readme)

UbiquityWE is a browser add-on available through Ctrl+Space key combination
that lets you give commands to a browser by entering text into a special input box.
Commands are shortcuts for things that you commonly do on the Web; they can eliminate
repetitive tasks and let you get more done, faster.
Your can write your own Ubiquity commands using the JavaScript programming language.

Find more information on command authoring in the tutorial available at the UbiquityWE 
settings page.

#### History

The [original Ubiquity](https://wiki.mozilla.org/Labs/Ubiquity) was a promising project aimed to familiarize masses with 
natural language user interfaces. But eventually, it went popular 
only within a community of handful of geeks, although, the [impressive repository](https://wiki.mozilla.org/Labs/Ubiquity/Commands_In_The_Wild) 
of commands was created (due to the volatile nature of the Web, you will hardly find a working
command there). Because "legacy" Firefox addons were able to do pretty 
anything with the browser, there was much sense and joy in it. 
Firefox Quantum has the more restrictive nature, and its extensions can do notable less currently,
but Ubiquity is still immensely useful if you are able to write JavaScript to automate
things you have (web)API for, to make intricate org-mode protocol capture schemes, etc., etc.     
 

Unfortunately, almost all codebase of the original ubiquity is not functional in 
Firefox Quantum. There were several attempts to resurrect it, and this is a fork of 
the Chrome Ubiquity addon (UbiChr) by [rostok](https://github.com/rostok/ubichr) 
which lacked parser. UbiquityWE introduces parser from the last version 
of "legacy" Ubiquity by [satyr](https://bitbucket.org/satyr/ubiquity), which means
that you can port any "legacy" Ubiquity commands that are still compatible with
the WebExtension API with minimal changes. UbiqutyWE improves user experience in many 
other ways (see the video above for more details).
 
#### Additional functionality not found in the original Ubiquity

* Ability to add commands to browser context menu.
* User command categories.

#### Differences with the original Ubiquity

Although UbiquityWE is aimed to retain resemblance with the original Ubiquity as much as possible,
there are some notable differences which emerge, in part, from Firefox Quantum limitations:

* Because there is no command subscription model anymore, each command is required to
 have an UUID. Although, commands generally are able to run without an UUID, in this case they
 would not be able to store persistent data and it would be not possible to add such a command 
 into the browser context menu. An RFC 4122 v4 complaint UUID is generated automatically for commands
 added through command editor templates.
* Since there is no sandboxed evaluation available in Firefox WebExtensions, the
Bin persistent storage interface is reachable through command execute/preview handler arguments.
Insert the "full-featured" command template at UbiquityWE command editor for an example.
* Some original Utils/CmdUtils API is not implemented, because there are no such possibilities
in Firefox Quantum, or no easily reachable/public web API available anymore, 
that was used, for example, by some built-in noun types. 
This means, that porting of existing commands to UbiquityWE will require some effort.


#### Debug mode

Debug mode allows to live-edit UbiquityWE settings as text with the edit-firefox-settings command, 
which may be useful if you need to transfer them between Firefox profiles. 
To enter tebug mode type:

`debug mode on` 

in the command line and press Enter. Similarly, type:

`debug mode off`

to turn it off.


Behavior of Ubiquity in the debug mode may differ from the regular one.

If you have an [Azure](http://azure.com) account, you can enter Translator API v3 
[key](https://www.microsoft.com/en-us/translator/business/trial/) in the advanced Ubiquity 
settings to have a personal quota on translation.

#### TODO

* Redesign/refactor UbiquityWE in component-based architecture.
* Ubiquity Touch: add a popup near the page text selection a la Oxford Dictionary one to execute predefined 
commands with set arguments on the selection (useful for various dictionary/clipping apps 
on touch devices).
* I18N.