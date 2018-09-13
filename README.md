# UbiquityWE <sup>EXPERIMENTAL</sup>

A natural language interface for web browsers.

[DOWNLOAD (Firefox Add-On)](https://github.com/GChristensen/ubichr/releases/download/v0.2.0.18/ubiquity_webeextension.xpi) :: [VIDEO MANUAL](https://youtu.be/0YTyZiIHR0o)

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
Firefox Quantum and there were several attempts to resurrect it. This is a fork of 
the Chrome Ubiquity addon (UbiChr) by [rostok](https://github.com/rostok/ubichr) 
which lacked parser. Besides the introduction of the parser from the last version 
of "legacy" Ubiquity by [satyr](https://bitbucket.org/satyr/ubiquity)
 UbiqutyWE improves it in many other ways.
 
#### Additional functionality not found in the original Ubiquity

* Ability to add commands to browser context menu.
* Custom command categories.

#### Currently implemented API

Although UbiquityWE is aimed to retain resemblance with the original Ubiquity as much as possible,
there are some notable differences which emerge from Firefox Quantum limitations.

* Since there is no sandboxed evaluation available in Firefox WebExtensions, the
[Bin](https://wiki.mozilla.org/Labs/Ubiquity/Ubiquity_0.5_Author_Tutorial#Persistent_Storage)
persistent storage interface is reachable through command preview/execute mehtod arguments.
Insert the "full-featured command" in UbiquityWE command editor for an example.
* There is no CmdUtils.onUbiquityLoad. Instead there are two additional command methods available:
  * init() - called once on Ubiquity load.
  * popup(popup_document) - called each time Ubiquity popup is shown with the popup document
    as the parameter. Any document-wide CSS/script injection should be done here.

The original Ubiquity commands were sandboxed from the browser API; Utils/CmdUtils modules
were the primary interface to it. There are no such restrictions in UbiquityWE: commands
have access to the full WebExtension API. The following api is implemented for backward 
compatibility/utility purposes. But you may still need to add necessary permissions
in manifest.json and rebuild the addon if you are using browser's native WebExtension API 
in your commands. 

##### Utils.paramsToString(params, prefix = "?")
>>Takes the given object containing keys and values into a query string
>>suitable for inclusion in an HTTP GET or POST request.
>>* **params** - is the object of key-value pairs.
>>* **prefix** - is an optional string prepended to the result,

##### Utils.urlToParams(urlString) 
>>Given a **urlString**, returns an object containing keys and values
>> retrieved from its query-part.

##### Utils.parseHtml(htmlText, callback)
>>An alternative to jQuery() which allows access to the entire document content.

##### Utils.escapeHtml(string)
>> Returns a version of the **string** safe for insertion into HTML.
>> Useful when you just want to concatenate a bunch of strings into
>> an HTML fragment and ensure that everything's escaped properly.

##### Utils.isEmpty(value)
>> Returns whether or not the **value** has no own properties.


##### Utils.extend(target, object1, [objectN ...])
>> Extends **target** by copying properties from the rest of arguments.
>> Deals with getters/setters properly. Returns **target**.

##### Utils.seq(lead_or_count, end, step = 1)
>> Creates an iterator of simple number sequence.<br>
>>>seq(1, 3)) => [1, 2, 3]<br>
>>>seq(3) => [0, 1, 2]<br>
>>>seq(4, 2, -1) => [4, 3, 2]<br>
>>>seq(-7).slice(2, -2) => [4, 3, 2]

##### Utils.tabs.search(text, maxResults, callback)
>> Searches for tabs by title or URL and returns an array of tab references. 
>> The result is passed to the supplied callback funciton.
>> * **matcher** is a string to match with.
>> * **maxResults** is an optinal integer specifying
>> the maximum number of results to return.

##### Utils.openUrlInBrowser(urlString)
>> *also CmdUtils.addTab(urlString)*<br>
>> Opens the given URL in the user's browser, using
>> their current preferences for how new URLs should be opened (e.g.,
>> in a new window vs. a new tab, etc).
>> Passes the newly opened tab object to the callback function.
>>
>>* **urlString** is a string corresponding to the URL to be opened.

##### _(string, data)
>> A shortcut for CmdUtils.renderTemplate. Currently, no internationalization support. 

##### CmdUtils.renderTemplate(template, data)
>> Renders a **template** by substituting values from a dictionary.
>> The templating language used is trimpath, which is defined at
>> http://code.google.com/p/trimpath/wiki/JavaScriptTemplates.
>>
>> * **template** is a template string.
>> * **data** is a dictionary of values to be substituted.

##### CmdUtils.CreateCommand(options)
>> Creates and registers a Ubiquity command.
>>
>> **options** is a dictionary object which
>> **must have the following properties:**
>>   * **uuid** - a unique enough string, such as URI, must be supplied.
>>   * **name**/**names** - the string or array of strings which will be the name or
>> names of your command the user will type into the command line,
>> or choose from the context menu, to activate it.
>>   * **execute** - the function which gets run when the user executes your command,
>> or the string which is notified or opened (if URL).
>> If your command takes arguments (see below),
>> your execute method will be passed an dictionary object containing
>> the arguments assigned by the parser.
>>
>> The following properties are used if you want your command to
>> accept arguments: **arguments**/**argument**.
>> Defines the primary arguments of the command.
>> See http://bit.ly/Ubiquity05_AuthorTutorial#Commands_with_Arguments.
>>
>> The following properties are optional but strongly recommended to
>> make your command easier for users to learn:
>>
>> * **description** - an XHTML string containing a short description of your command, to be displayed
>> on the command-list page.
>> * **help** - an XHTML string containing a longer description of
>> your command, also displayed on the command-list page, which can go
>> into more depth, include examples of usage, etc.
>>
>> The following properties are optional:
>> * **icon** - a URL string pointing to a small image (favicon-sized) to
>> be displayed alongside the name of your command in the interface.
>> * **author**/**authors**, **contributor**/**contributors** - a plain text 
>> or dictionary object (which can have **name**, **email**,
>> and **homepage** properties, all plain text)
>> describing the command's author/contributor.
>> Can be an array of them if multiple.
>> * **homepage** - a URL string of the command's homepage, if any.
>> * **license** - a string naming the license under which your
>> command is distributed, for example **"MPL"**.
>> * **init** - function, called once on UbiquityWE load.
>> * **popup** - function, called each time after UbiquityWE popup window is shown.
>> Popup window document is passed as the parameter.
>> * **preview** - description of what your command will do,
>> to be displayed to the user before the command is executed.  Can be
>> either a string or a function.  If a string, it will simply be
>> displayed as-is. If preview is a function, it will be called and
>> passed a **pblock** argument, which is a reference to the
>> preview display element.  Your function can generate and display
>> arbitrary HTML by setting the value of **pblock.innerHTML**.
>> Use **this.previewDefault(pblock)** to set the default preview.
>> If your command takes arguments (see above), your preview method will
>> be passed the dictionary as the second argument.
>> * **timeout** - pecifies the amount in time, in
>> milliseconds, to wait before calling the preview function defined
>> in **options.preview**. If the user presses a key before this
>> amount of time has passed, then the preview function isn't
>> called. This option is useful, for instance, if displaying the
>> preview involves a round-trip to a server and you only want to
>> display it once the user has stopped typing for a bit. If
>> **options.preview** isn't a function, then this option is
>> ignored.

##### CmdUtils.makeSearchCommand(options)
>> A specialized version of **CmdUtils.CreateCommand()**. This lets
>> you make commands that interface with search engines, without
>> having to write so much boilerplate code.
>> Also see https://wiki.mozilla.org/Labs/Ubiquity/Writing_A_Search_Command .
>>
>> **options** is same as the argument of **CmdUtils.CreateCommand()**,
>> except that instead of **options.arguments**, **options.execute**,
>> and **options.preview**, you only need a single property:
>> * **url**
>>  The URL of a search results page from the search engine of your choice.
>>  Must contain the literal string **{QUERY}** or **%s**, which will be
>>  replaced with the user's search term to generate a URL that should point to
>>  the correct page of search results. (We're assuming that the user's search
>>  term appears in the URL of the search results page, which is true for most
>>  search engines.) For example: http://www.google.com/search?q={QUERY}
>>
>> If not specified, **options.name**, **options.icon**,
>> **options.description**, **options.execute** will be auto generated.
>>
>> Other optional parameters of **options** are:
>> * **postData** - makes the command use POST instead of GET, and the data
>>  (key:value pairs or string) are all passed to the **options.url**.
>>  Instead of including the search params in the URL, pass it
>>  (along with any other params) like so: {"q": "{QUERY}", "hl": "en"} or "q={QUERY}&hl=en".
>>  When this is done, the query will be substituted in as usual.
>> * **defaultUrl** - a URL string that will be opened in the case
>>  where the user has not provided a search string.
>> * **charset** - a string specifying the character set of query (currently not implemented in UbiquityWE).
>>
>> * **parser** - generates keyboard navigatable previews by parsing the search results.
>>  It is passed as an object containing following properties.
>>  The ones marked as *path* expect either a jQuery selector string,
>>  a JSON path string (like **"granma.mom.me"**). Each of them can also be
>>  a filter function that receives a parent context and returns a result
>>  of the same type.
>>   * **parser.type** - a string that's passed to **jQuery.ajax()**'s **dataType** parameter
>>  when requesting. If **"json"**, the parser expects JSON paths.
>>   * **parser.title** - the *path* to the title of each result. *Required*.
>>   * **parser.container** - a *path* to each container that groups each of
>>  title/body/href/thumbnail result sets. *Recommended*.
>>   * **parser.body** - a *path* to the content of each result.
>>   * **parser.href** / **parser.thumbnail** - *path*s to the link/thumbnail URL of each result.
>>  Should point to an **&lt;a&gt;**/**&lt;img&gt;** if jQuery mode.
>>   * **parser.url** / **parser.postData** - specifies another versions of **options.url**/**options.postData**,
>>  in the case when a different request set is used for preview.
>>   * **parser.baseUrl** - a URL string that will be the base for relative links, such that they will
>>  still work out of context. If not passed, it will be auto-generated from
>>  **options.url** (and thus *may* be incorrect).
>>   * **parser.maxResults** - an integer specifying the max number of results. Defaults to 10.
>>   * **parser.plain** - an array of strings naming *path*s that should be treated as plain text
>>  (and thus be HTML-escaped).
>>   * **parser.log** - a function to which the response data and parsed results are logged.
>>  If non-function, **makeSearchCommand.log()** is used.

##### CmdUtils.previewAjax(pblock, options)
>> Does an asynchronous request to a remote web service.  It is used
>> just like **jQuery.ajax()**, which is documented at
>> http://docs.jquery.com/Ajax/jQuery.ajax.<br>
>> The difference is that **CmdUtils.previewAjax()** is designed to handle
>> command previews, which can be canceled by the user between the
>> time that it's requested and the time it displays. If the preview
>> is canceled, no callbacks in the options object will be called.

##### CmdUtils.previewList(block, htmls, [callback], [css])
>> Creates a simple clickable list in the preview block and
>> returns the list element.
>> * **block** is the DOM element the list will be placed into.
>> * **htmls** is the array/dictionary of HTML string to be listed.
>> * **callback(id, ev)** is the function called
>> when one of the list item becomes focused.
>>   * **id** : one of the keys of **htmls**
>>   * **ev** : the event object
>> * **css** is an optional CSS string inserted along with the list.


##### CmdUtils.absUrl(data, baseUrl)
>> Fixes relative URLs in **data** (e.g. as returned by Ajax calls).
>> Useful for displaying fetched content in command previews.
>>
>> * **data** is the data containing relative URLs, which can be
>> an HTML string or a jQuery/DOM object.
>>
>> * **baseUrl** is the URL used for base
>> (that is to say; the URL that the relative paths are relative to).

##### CmdUtils.copyToClipboard(text)
>> This function places the passed-in text into the OS's clipboard.
>> If the text is empty, the copy isn't performed.
>>
>> * **text** is a plaintext string that will be put into the clipboard.

##### CmdUtils.notify(message, title)
>> Display a popup notification with the specified **message** and **title**.


##### CmdUtils.getLocation()
>> Returns the location URL of the active tab, if available.

##### ContextUtils.getSelection()
>> Returns a string containing the text and just the text of the user's
>> current selection, i.e. with HTML tags stripped out.

##### ContextUtils.getHtmlSelection()
>> Returns a string containing the HTML representation of the
>> user's current selection, i.e. text including tags.

##### ContextUtils.setSelection(content)
>>Replaces the current selection with **content**.


#### Currently supported noun types

NounType system of the original Ubiquity parser is a powerful tool which allows to
add dynamic things (such as the set of current tabs) to parser suggestion list and command
arguments.
See noun_type_tabs for an example.

Currently, the following noun types are built-in into UbiquityWE:

* **noun_arb_text** - an arbitrary text, suggests the input as is.
* **noun_type_number** - a numeric value.
* **noun_type_percentage** - a percentage value.
* **noun_type_date**, **noun_type_time**, **noun_type_date_time** - date and time, parseable by 
JavaScript's Date constructor.
* **noun_type_email** - email address.
* **noun_type_tab** - will suggest active tabs matched by title or url.
* **noun_type_lang_google** - language name/code pairs, supported by Google Translator.
* **noun_type_lang_wikipedia** - language name/code pairs, supported by Wikipedia.
* **noun_type_lang_microsoft** - language name/code pairs, supported by Bing Translator.

#### TODO

* Design a component archichecture for UbiquityWE.
* Ubiquity Touch: add a popup near the page text selection a la Oxford Dictionary one to execute predefined 
commands with set arguments on the selection (useful for various dictionary/clipping apps 
on touch devices).
* I18N.