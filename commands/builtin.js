// BuildIn CmdUtils command definitions
// jshint esversion: 6 

CmdUtils.CreateCommand({
    name: "change-ubiquity-settings",
    icon: "res/icon-24.png",
    builtIn: true,
    _namespace: "Ubiquity", // do not set this field in custom commands
    description: "Takes you to the Ubiquity command <a href=options.html target=_blank>settings page</a>.",
    execute: function () {
        CmdUtils.addTab("options.html");
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    names: ["list-ubiquity-commands", "command-list", "help"],
    description: "Opens Ubiquity command list page",
    icon: "res/icon-24.png",
    _namespace: "Ubiquity",
    builtIn: true,
    preview: "Lists all available commands",
    execute: CmdUtils.SimpleUrlBasedCommand("commands.html")
});

CmdUtils.CreateCommand({
    names: ["edit-ubiquity-commands", "hack-ubiquity"],
    icon: "res/icon-24.png",
    _namespace: "Ubiquity",
    builtIn: true,
    description: "Takes you to the Ubiquity command <a href=edit.html target=_blank>editor page</a>.",
    execute: function () {
        CmdUtils.addTab("edit.html");
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    names: ["reload-ubiquity"],
    _namespace: "Ubiquity",
    description: "Reloads Ubiquity extension.",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "Reloads Ubiquity extension.",
    execute: ()=>{
        chrome.runtime.reload();
    }
});

CmdUtils.CreateCommand({
    names: ["debug-popup"],
    description: "Debug the popup window in a separate tab.",
    _namespace: "Ubiquity",
    _hidden: true,
    builtIn: true,
    icon: "res/icon-24.png",
    preview: "Debug the popup window in a separate tab.",
    execute: CmdUtils.SimpleUrlBasedCommand("popup.html")
});

CmdUtils.CreateCommand({
    name: "replace-selection",
    _namespace: "Browser",
    description: "Replaces current selection with entered text.",
    preview: "eplaces current selection with entered text.",
    icon: "res/icon-24.png",
    builtIn: true,
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(text);
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "close",
    _namespace: "Browser",
    description: "Close the current tab.",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "Close the current tab.",
    execute: function (directObj) {
        CmdUtils.closeTab();
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "print",
    _namespace: "Browser",
    description: "Print the current page.",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "Print the current page.",
    execute: function (directObj) {
        chrome.tabs.executeScript( { code:"window.print();" } );
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "invert",
    _namespace: "Browser",
    description: "Inverts all colors on current page. Based on <a target=_blank href=https://stackoverflow.com/questions/4766201/javascript-invert-color-on-all-elements-of-a-page>this</a>.",
    builtIn: true,
    icon: "res/icon-24.png",
    execute: function execute(){
        chrome.tabs.executeScript({code:`
        javascript: (
            function () { 
            // the css we are going to inject
            var css = 'html {-webkit-filter: invert(100%);' +
                '-moz-filter: invert(100%);' + 
                '-o-filter: invert(100%);' + 
                '-ms-filter: invert(100%); }',
            
            head = document.getElementsByTagName('head')[0],
            style = document.createElement('style');
            
            // a hack, so you can "invert back" clicking the bookmarklet again
            if (!window.counter) { window.counter = 1;} else  { window.counter ++;
            if (window.counter % 2 == 0) { var css ='html {-webkit-filter: invert(0%); -moz-filter:    invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }'}
             };
            
            style.type = 'text/css';
            if (style.styleSheet){
            style.styleSheet.cssText = css;
            } else {
            style.appendChild(document.createTextNode(css));
            }
            
            //injecting the css to the head
            head.appendChild(style);

            function invert(rgb) {
                rgb = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
                for (var i = 0; i < rgb.length; i++) {
                  rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
                }
                return rgb;
            }

            document.body.style.backgroundColor = "rgb("+invert(window.getComputedStyle(document.body, null).getPropertyValue('background-color')).join(",")+")";
            }());
        `})
    },
});

CmdUtils.CreateCommand({
    names: ["base64decode","b64d","atob"],
    _namespace: "Utility",
    description: "base64decode",
    icon: "res/icon-24.png",
    builtIn: true,
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(atob(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = atob(text);
    },
});

CmdUtils.CreateCommand({
    names: ["base64encode","b64e", "btoa"],
    _namespace: "Utility",
    description: "base64encode",
    builtIn: true,
    icon: "res/icon-24.png",
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(btoa(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = btoa(text);
    },
});

CmdUtils.CreateCommand({
    names: ["urldecode"],
    _namespace: "Utility",
    description: "urldecode",
    icon: "res/icon-24.png",
    builtIn: true,
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(decodeURI(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = decodeURI(text);
    },
});

CmdUtils.CreateCommand({
    names: ["urlencode"],
    _namespace: "Utility",
    description: "urlencode",
    icon: "res/icon-24.png",
    builtIn: true,
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(encodeURI(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = encodeURI(text);
    },
});

const noun_calc = {
    label: "expression",
    suggest: function (txt, htm, cb, si) {
        if (!this._mathlike.test(txt)) return []
        try {
            var result = Parser.evaluate(txt)
                , score = result === txt ? .3 : 1
        }
        catch (e) {
            console.log(e.message);
            result = e.message
            score  = .1
        }
        return [NounUtils.makeSugg(txt, htm, result, score, si)];
    },
    _mathlike: /^[\w.+\-*\/^%(, )|]+$/,
};

CmdUtils.CreateCommand({
    name: "calculate",
    description:
        'Calculates using\
         <a href="http://silentmatt.com/javascript-expression-evaluator/">\
         JavaScript Expression Evaluator</a>.',
    help: "Try: <code>22/7, 3^4^5, sin(sqrt(log(PI)))</code>",
    icon: "res/calculator.png",
    _namespace: "Utility",
    builtIn: true,
    author: "satyr",
    license: "Public domain",
    argument: noun_calc,
    preview: function (pb, {object: {data, score}}) {
        pb.innerHTML = data? (score < .3 ? "<em style='color: red'>" : "<strong>") + data: "";
    },
});


var bitly_api_user = "ubiquityopera";
var bitly_api_key = "R_59da9e09c96797371d258f102a690eab";
CmdUtils.CreateCommand({
    names: ["shorten-url", "bitly"],
    _namespace: "Utility",
    icon: "res/bitly.png",
    builtIn: true,
    description: "Shorten your URLs with the least possible keystrokes",
    homepage: "http://bit.ly",
    author: {
        name: "Cosimo Streppone",
        email: "cosimo@cpan.org"
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    preview: async function (pblock, {object: {text}}) {
        var words = text.split(' ');
        var host = words[1];
        pblock.innerHTML = "Shortens an URL (or the current tab) with bit.ly";
    },
    execute: async function (directObject) {
        var url = "http://api.bit.ly/shorten?version=2.0.1&longUrl={QUERY}&login=" +
            bitly_api_user + "&apiKey=" + bitly_api_key;
        var query = directObject.text;
        // Get the url from current open tab if none specified
        if (!query || query == "") query = CmdUtils.getLocation();
        var urlString = url.replace("{QUERY}", query);

        var url = "http://api.bit.ly/shorten?version=2.0.1&longUrl={QUERY}&login=" + bitly_api_user + "&apiKey=" + bitly_api_key;
        // Get the url from current open tab if none specified
        var ajax = await CmdUtils.get(urlString);
        //ajax = JSON.parse(ajax);
        //if (!ajax) return;
        var err_code = ajax.errorCode;
        var err_msg = ajax.errorMessage;
        // Received an error from bit.ly API?
        if (err_code > 0 || err_msg) {
            CmdUtils.setPreview('<br/><p style="font-size: 18px; color:orange">' + 'Bit.ly API error ' + err_code + ': ' + err_msg + '</p>');
            return;
        }

        var short_url = ajax.results[query].shortUrl;
        CmdUtils.setPreview('<br/><p style="font-size: 24px; font-weight: bold; color: #ddf">' +
            '<a target=_blank href="' + short_url + '">' + short_url + '</a>' +
            '</p>');
        CmdUtils.setClipboard(short_url);
    }
});

CmdUtils.CreateCommand({
    name: "dark flow",
    argument: [{role: "object", nountype: noun_arb_text, label: "URL"}],
    description: "Follow the URL in Dark Flow.",
    homepage: "https://github.com/GChristensen/dark-flow#readme",
    icon: "res/dark-flow.png",
    builtIn: true,
    _hidden: true,
    execute: function execute({object: {text}}) {
        browser.runtime.sendMessage("dark-flow@firefox", {message: "dark-flow:follow-url", url: text}, null);
        CmdUtils.closePopup();
    },
    preview: "Follow the URL in Dark Flow"
});