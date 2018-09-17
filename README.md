# UbiquityWE <sup>EXPERIMENTAL</sup>

A natural language interface for web browsers.

[DOWNLOAD (Firefox Add-On)](https://github.com/GChristensen/ubichr/releases/download/v0.2.2.4/ubiquity_webeextension.xpi) :: [VIDEO MANUAL](https://youtu.be/YEdsVDZhcoQ)

![screen](screen.png?raw=true)

SEE ALSO: [Enso Portable](https://github.com/GChristensen/enso-portable#readme), [Dark Flow](https://github.com/GChristensen/dark-flow#readme), [Add Torrent](https://github.com/GChristensen/torrent-add#readme)

UbiquityWE is a browser add-on available through Ctrl+Space key combination
that lets you give commands to a browser by entering text into a special input box.
Commands are shortcuts for things that you commonly do on the Web; they can eliminate
repetitive tasks and let you get more done, faster.
Your can write your own Ubiquity commands using the JavaScript programming language.

Find more information on command authoring in the tutorial available at UbiquityWE 
settings pages.

#### History

The [original Ubiquity](https://wiki.mozilla.org/Labs/Ubiquity) was a promising project by Mozilla aimed to familiarize
masses with natural language user interfaces. But eventually, it went popular only within a community of handful of
geeks and has been abandoned, although, the [impressive
repository](https://wiki.mozilla.org/Labs/Ubiquity/Commands_In_The_Wild) of commands was created. 
You have been meant to subscribe them to get updates automatically, but subscription model has ceased
with the original ubiquity, and due to the volatile nature of the Web, you will hardly find a working command there.
Nevertheless, Ubiquity is still immensely useful if
you are able to write JavaScript to automate things you have (web)API for, to make intricate org-mode protocol capture
schemes, etc., etc.

After Mozilla introduced breaking changes into Firefox APIs, Satoshi Murakami
([satyr](http://profile.hatena.ne.jp/murky-satyr/) - one of the creators of Ubiquity) became a maintainer who galvanized 
Ubiquity until the last days of Firefox as we knew it (i.e. with "legacy" addon support).   
 

Unfortunately, almost all codebase of the original ubiquity is not functional in 
the new Firefox Quantum. The first attempts to resurrect Ubiquity came from the users 
of Opera browser ([ubiquity-opera](https://github.com/cosimo/ubiquity-opera/blob/master/ubiquity.js))
 and continued on Google Chrome ([UbiChr](https://github.com/rostok/ubichr)).
But their downside was the lack of natural language parser, which gave Ubiquity all
its superpowers. So, I have taken UbiChr (which is simple as AK-47 internally), 
parser from the latest Ubiquity, combined them, added bells and whistles, and the fully functional 
new Ubiquity went back to Firefox with this incarnation, 
which means that it is now possible to port any "legacy" commands that are still compatible with
WebExtension APIs with minimal changes. 
 

#### Source code

* Source code of the original Ubiquity by Mozilla: https://github.com/mozilla/ubiquity
* Source code of the latest Ubiquity by satyr: https://bitbucket.org/satyr/ubiquity
* Source code of the original UbiChr: https://github.com/rostok/ubichr

#### NL Parsers

Just out of curiosity I have ported two parsers: [Parser 2](https://wiki.mozilla.org/Labs/Ubiquity/Parser_2) 
of the original Ubiquity and satyr's parser (which I call Parser 3). The former is not so
good in the terms of usability but supperrior in some linguistic aspects, so you only can
enable it if you are an interested developer. Parser 3 is more handy and enabled by default, 
although it does not allow commands with whitespaces and uses "Hagure Metal" function to score suggestions
(if you want to know how it works, ask satyr).

 
#### Additional functionality not found in the original Ubiquity

* Ability to add commands to browser context menu.
* User command categories.

#### Additional functionality not found in the original UbiChr

* Natural language parser from the original ubiquity.
* Elaborate settings pages/tutorial/API reference.
* Command history.

#### Differences with the original Ubiquity

Although UbiquityWE is aimed to retain resemblance with the original Ubiquity as much as possible,
there are some notable differences which emerge, in part, from Firefox Quantum limitations:

* Because there is no command subscription model anymore, each command is required to
 have an UUID. Although, commands generally are able to run without an UUID, in this case they
 would not be able to store persistent data and it would be not possible to add such a command 
 into context menu. An RFC 4122 v4 complaint UUID is generated automatically for commands
 inserted through command editor templates.
* Since there is no sandboxed evaluation available in Firefox WebExtensions, the
Bin persistent storage interface is reachable through command execute/preview handler arguments.
Insert the "full-featured" command template at UbiquityWE command editor for an example.
* Some original Utils/CmdUtils API is not implemented because there are no such possibilities
in Firefox Quantum or no easily reachable/public web API available anymore (which 
was used, for example, by some built-in noun types). 
This means, that porting of existing commands to UbiquityWE will require some effort.

#### Differences with the original UbiChr

* No backward compatibility with existing parserless UbiChr commands (although, it
should be pretty easy to port one).

#### TODO

* Redesign/refactor UbiquityWE in component-based architecture.
* Ubiquity Touch: add a popup near the page text selection a la Oxford Dictionary one to execute predefined 
commands with set arguments on the selection (useful for various dictionary/clipping apps 
on touch devices).
* I18N.