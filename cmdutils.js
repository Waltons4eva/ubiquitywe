// CmdUtils
// jshint esversion: 6 

if (!CmdUtils) var CmdUtils = { 
    VERSION: chrome.runtime.getManifest().version,
    DEBUG: undefined,
    PRODUCTION: false,
    CommandList: [],
    jQuery: jQuery,
    backgroundWindow: window,
    popupWindow: null,
    log: console.log,
    active_tab: null,   // tab that is currently active, updated via background.js 
    selectedText: "",   // currently selected text, update via content script selection.js
    selectedHTML: "",   // currently selected text, update via content script selection.js
    setPreview: function(message, prepend) { console.log(message); },
    setSuggestions: function(message, prepend) { console.log(message); },
    setPreviewVisible: function() { },
};

var _ = a => a;

// stub for original ubiquity string formatter
function L(pattern, substitute1, substitute2) {
    if (substitute1)
        pattern = pattern.replace("%S", substitute1);
    if (substitute2)
        pattern = pattern.replace("%S", substitute2);

    return pattern;
}

function H(arg) {
    return Utils.escapeHtml(arg);
}

CmdUtils.log = m => console.log(m);

// debug log
CmdUtils.deblog = function () {
    if(CmdUtils.DEBUG){
        console.log.apply(console, arguments);
    }
};

CmdUtils.renderTemplate = function (template, data) {
  return TrimPath.parseTemplate(template).process(data);
};

var __globId = 0;

// creates command and adds it to command array, name or names must be provided and preview execute functions
CmdUtils.CreateCommand = function CreateCommand(options) {
    if (Array.isArray(options.name)) {
        options.names = options.name;
        options.name = options.name[0];
    } else {
        options.name = options.name || options.names[0];
        options.names = options.names || [options.name];
    }

    options.id = options.referenceName = options.name + __globId++;

    if (CmdUtils.getcmd(options.name)) {
        // remove previously defined command with this name
        CmdUtils.CommandList = CmdUtils.CommandList.filter( cmd => cmd.name !== options.name );
    }

    function toNounType(obj, key) {
        var val = obj[key];
        if (!val) return;
        var noun = obj[key] = NounUtils.NounType(val);
        if (!noun.id) noun.id = options.id + "#n" + __globId++;
    }

    ASSIGN_ARGUMENTS:
    {
        let args = options.arguments || options.argument;
        if (!args) {
            options.arguments = [];
            break ASSIGN_ARGUMENTS;
        }
        // handle simplified syntax
        if (typeof args.suggest === "function")
        // argument: noun
            args = [{role: "object", nountype: args}];
        else if (!Utils.isArray(args)) {
            // arguments: {role: noun, ...}
            // arguments: {"role label": noun, ...}
            let a = [], re = /^[a-z]+(?=(?:[$_:\s]([^]+))?)/;
            for (let key in args) {
                let [role, label] = re.exec(key) || [];
                if (role) a.push({role: role, label: label, nountype: args[key]});
            }
            args = a;
        }
        for (let arg of args) toNounType(arg, "nountype");
        options.arguments = args;
    }

    var to = parseFloat(options.timeout || 0);
    if (to>0) {
    	options.timeoutFunc = null;
    	if (typeof options.preview == 'function') {
		    options.preview_timeout = options.preview;
			options.preview = function(b,a) {
                if (options.preview_timeoutFunc !== null) clearTimeout(options.preview_timeoutFunc);
                options.preview_timeoutFunc = setTimeout(function () {
                	options.preview_timeout(b, a);
                }, to);
			};
    	}
    	if (typeof options.execute == 'function') {
		    options.execute_timeout = options.execute;
			options.execute = function(a) {
                if (options.execute_timeoutFunc !== null) clearTimeout(options.execute_timeoutFunc);
                options.execute_timeoutFunc = setTimeout(function () {
					options.execute_timeout(a);
                }, to);
			};
    	}
    }
    options.previewDefault = CmdUtils.CreateCommand.previewDefault;
    CmdUtils.CommandList.push(options);
};

CmdUtils.CreateCommand.previewDefault = function previewDefault(pb) {
    var html = "";
    if ("previewHtml" in this) html = this.previewHtml;
    else {
        if ("description" in this)
            html += '<div class="description">' + this.description + '</div>';
        if ("help" in this)
            html += '<p class="help">' + this.help + '</p>';
        if (!html) html = L(
            "Execute the %S command.",
            '<strong class="name">' + Utils.escapeHtml(this.name) + "</strong>");
        html = '<div class="default">' + html + '</div>';
    }
    return (pb || 0).innerHTML = html;
};

// helper to avoid stealing focus in preview
CmdUtils._restoreFocusToInput = function(event) {
    var wnd = event.currentTarget || event.view;
    var doc;
    if (!wnd.closed && !((doc = wnd.document).hidden || doc.webkitHidden || doc.mozHidden || doc.msHidden)) {
        wnd.setTimeout( function() {
            wnd.document.getElementById('ubiq_input').focus();
        }, 0);
        var self = wnd._ubiq_recent_cmd;
        // may be scrolled by set of focus - so restore it now:
        if (self.prevAttrs.scroll) {
            var scrollOffs = self.prevAttrs.scroll;
            wnd.setTimeout( function() {
                var pblock = wnd.document.getElementById('ubiq-preview-div');
                pblock.scrollLeft = scrollOffs[0];
                pblock.scrollTop = scrollOffs[1];
            }, 0);
        }
        wnd.setTimeout(function() {
            wnd.removeEventListener("blur", CmdUtils._restoreFocusToInput, { capture: true });
        }, 150);
    } else {
        wnd.removeEventListener("blur", CmdUtils._restoreFocusToInput, { capture: true });
    }
};

CmdUtils._afterLoadPreview = function(ifrm) {
    var doc = ifrm.ownerDocument;
    var wnd = doc.defaultView || doc.parentWindow;
    wnd.focus();
    // jump to anchor (try multiple one by one):
    if (this.prevAttrs.anchor != null) {
      var url = ifrm.src;
      for (var ha of this.prevAttrs.anchor) {
        ifrm.src = url.replace(/(?:\#[^#]+)?$/, '#' + ha);
      }
    }
    // restore focus:
    wnd.focus();
    wnd.removeEventListener("blur", CmdUtils._restoreFocusToInput, { capture: true });
};

CmdUtils.tabs = {
    search(text, maxResults, callback) {
        let matcher = new RegExp(text, "i");

        chrome.tabs.query({}, tabs => {
            let results = [];
            for (let tab of tabs) {
                let match = matcher.exec(tab.title) || matcher.exec(tab.url);
                if (!match) continue;
                tab.match = match;
                results.push(tab);
                if (maxResults && results.length >= maxResults) break;
            }
            callback(results);
        });
    }
};

// closes current tab
CmdUtils.closeTab = function closeTab() {
	chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        if (tabs && tabs[0]) 
            chrome.tabs.remove(tabs[0].id, function() { });
        else 
            console.error("closeTab failed because 'tabs' is not set");
	});
};

// returns active tabs URL if avaiable
CmdUtils.getLocation = function getLocation() {
    if (CmdUtils.active_tab && CmdUtils.active_tab.url) 
        return CmdUtils.active_tab.url;
    else 
        return ""; 
};

// opens new tab with provided url
Utils.openUrlInBrowser = CmdUtils.addTab = function addTab(url) {
	if (typeof browser !== 'undefined') {
		chrome.tabs.create({ "url": url });
	} else 
	if (typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined') {
		chrome.tabs.create({ "url": url });
	} else {
		window.open(url);
	}
};

// opens new tab with post request and provided data
CmdUtils.postNewTab
 = function postNewTab(url, data) {
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", url);
	form.setAttribute("target", "_blank");

	if (typeof data === 'string') data = Utils.urlToParams(data);
	for (var i in data) {
		if (data.hasOwnProperty(i)) {
			var input = document.createElement('input');
			input.type = 'hidden';
			input.name = i;
			input.value = data[i];
			form.appendChild(input);
		}
	}

	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

// returns a function that opens new tab with substituted {text} and {location} 
CmdUtils.SimpleUrlBasedCommand = function SimpleUrlBasedCommand(url) {
    if (!url) return;
    var search_func = function(directObj) {
        if (!directObj) return;
        var text = directObj.text;
        text = encodeURIComponent(text);
        var finalurl = url;
        finalurl = finalurl.replace('{text}', text);
        finalurl = finalurl.replace('{location}', CmdUtils.getLocation());
        CmdUtils.addTab(finalurl);
        CmdUtils.closePopup();
    };
    return search_func;
};

// gets json with xhr
CmdUtils.ajaxGetJSON = function ajaxGetJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            callback(resp, xhr);
        }
    };
    xhr.send();
};

// gets page with xhr
CmdUtils.ajaxGet = function ajaxGet(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(xhr.responseText, xhr);
        }
    };
    xhr.send();
};

// performs jQuery get and returns jqXHR that implements Promise 
CmdUtils.get = function get(url) {
	return jQuery.ajax({
    	url: url,
        async: true
	});
};

// performs jQuery post and return jsXHR
CmdUtils.post = function post(url, data) {
	return jQuery.ajax({
    	url: url,
    	data: data,
        async: true
	});
};

// loads remote scripts into specified window (or backround if not specified)
CmdUtils.loadScripts = function loadScripts(url, callback, wnd=window) {
    // this array will hold all loaded scripts into this window
    wnd.loadedScripts = wnd.loadedScripts || [];
	url = url || [];
	if (url.constructor === String) url = [url];

    if (typeof wnd.jQuery === "undefined") {
        console.error("there's no jQuery at "+wnd+".");
        return false;
    }
	if (url.length == 0) 
		return callback();

	var thisurl = url.shift();
	tempfunc = function(data, textStatus, jqXHR) {
		return loadScripts(url, callback, wnd);
	};
	if (wnd.loadedScripts.indexOf(thisurl)==-1) {
		console.log("loading :::: ", thisurl);
		wnd.loadedScripts.push(thisurl);
    	wnd.jQuery.ajax({
            url: thisurl,
            dataType: 'script',
            success: tempfunc,
            async: true
        });
    }
    else {
    	tempfunc();
    }
};

// updates selectedText variable
CmdUtils.updateSelection = function (tab_id, callback) {
    try {
        chrome.tabs.executeScript(tab_id, {code: "__ubiq_get_sel()"}, function (selection) {
            if (selection && selection.length > 0) {
                CmdUtils.selectedText = selection[0].text || "";
                CmdUtils.selectedHtml = selection[0].html || "";
            }
            CmdUtils.deblog("selectedText is ", CmdUtils.selectedText);

            if (callback)
                callback();
        });
    }
    catch (e) {
        console.log(e);
        if (callback)
            callback();
    }

};

CmdUtils._internalClearSelection = function() {
    CmdUtils.selectedText = "";
    CmdUtils.selectedHtml = "";
};

// called when tab is switched or changed, updates selectedText and activeTab
CmdUtils.updateActiveTab = function (callback) {
    CmdUtils.active_tab = null;
    CmdUtils.selectedText = '';
    if (chrome.tabs && chrome.tabs.query)
        try {
            chrome.tabs.query({active: true}, function (tabs) {
                if (tabs.length > 0) {
                    var tab = tabs[0];
                    if (tab.url.match('^https?://')) {
                        CmdUtils.active_tab = tab;
                        CmdUtils.updateSelection(tab.id, callback);
                    }
                    else if (callback)
                        callback();
                }
                else if (callback)
                    callback();
            });
        }
        catch (e) {
            console.log(e);
            if (callback)
                callback();
        }
};

CmdUtils.getSelection = () => CmdUtils.selectedText;
CmdUtils.getHtmlSelection = () => CmdUtils.selectedHtml;

// replaces current selection with string provided
CmdUtils.setSelection = function setSelection(s) {
    //console.log("CmdUtils.setSelection"+s)
    if (typeof s!=='string') s = s+'';
    s = s.replace(/(['"])/g, "\\$1");
    s = s.replace(/\\\\/g, "\\");
    // http://jsfiddle.net/b3Fk5/2/
    var insertCode = `
    function replaceSelectedText(replacementText) {
        var sel, range;
        sel = window.getSelection();
        var activeElement = document.activeElement;
        if (activeElement.nodeName == "TEXTAREA" ||
            (activeElement.nodeName == "INPUT" && activeElement.type.toLowerCase() == "text")) {
                var val = activeElement.value, start = activeElement.selectionStart, end = activeElement.selectionEnd;
                activeElement.value = val.slice(0, start) + replacementText + val.slice(end);
        } else {
            if (sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                var el = document.createElement("div");
                el.innerHTML = replacementText;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ( (node = el.firstChild) ) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
            } else {
                sel.deleteFromDocument();
            }
        }
    }
    replaceSelectedText("`+s+`");`;
    if (CmdUtils.active_tab && CmdUtils.active_tab.id)
        return chrome.tabs.executeScript( CmdUtils.active_tab.id, { code: insertCode } );
    else 
        return chrome.tabs.executeScript( { code: insertCode } );
};

// for measuring time the input is changed
CmdUtils.inputUpdateTime = performance.now();
CmdUtils.timeSinceInputUpdate = function timeSinceInputUpdate() {
	return (performance.now() - CmdUtils.inputUpdateTime)*0.001;
};

// returns command with this name
CmdUtils.getcmd = function getcmd(cmdname) {
    for (var c in CmdUtils.CommandList) 
        if (CmdUtils.CommandList[c].name == cmdname || CmdUtils.CommandList[c].names.indexOf(cmdname)>-1) return CmdUtils.CommandList[c];
    return null;
};

// sets clipboard
CmdUtils.copyToClipboard = CmdUtils.setClipboard = function setClipboard (t) {
    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = t;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
};

CmdUtils.unloadCustomScripts = function unloadCustomScripts() {
    CmdUtils.CommandList = CmdUtils.CommandList.filter((c)=>{
        return c['builtIn']==true;
    });
};

CmdUtils.loadCustomScripts = function loadCustomScripts(callback) {
    CmdUtils.unloadCustomScripts();
    // mark built-int commands
    CmdUtils.CommandList.forEach((c)=>{c['builtIn']=true;});

    // load custom scripts
    chrome.storage.local.get('customscripts', function(result) {
        if (result.customscripts)
            for (let n in result.customscripts) {
                try {
                    eval(result.customscripts[n].scripts || "");
                    for (let cc of CmdUtils.CommandList.filter((c)=>{return !c.builtIn && !c._namespace}))
                        cc._namespace = n;
                } catch (e) {
                    console.error("custom scripts eval failed", e);
                }
            }
        if (callback)
           callback(result.customscripts);
    });
};

CmdUtils.getPref = function(key, callback) {
    chrome.storage.local.get(null, p => callback(p[key]));
};

CmdUtils.setPref = function(key, value, callback) {
    chrome.storage.local.get(null, p => {p[key] = value; chrome.storage.local.set(p)});
};

// show browser notification with simple limiter 
CmdUtils.lastNotification = "";
CmdUtils.notify = function (message, title) {
    if (CmdUtils.lastNotification == title+"/"+message) return;
    chrome.notifications.create({
        "type": "basic",
        "iconUrl": chrome.extension.getURL("res/icon-128.png"),
        "title": title || "UbiquityWE",
        "message": message
    });
    CmdUtils.lastNotification = title+"/"+message;
};

// === {{{ CmdUtils.absUrl(data, baseUrl) }}} ===
// Fixes relative URLs in {{{data}}} (e.g. as returned by Ajax calls).
// Useful for displaying fetched content in command previews.
//
// {{{data}}} is the data containing relative URLs, which can be
// an HTML string or a jQuery/DOM object.
//
// {{{baseUrl}}} is the URL used for base
// (that is to say; the URL that the relative paths are relative to).

CmdUtils.absUrl = function (data, baseUrl) {
    let uri = function(opts) {
        let url = opts.uri;
        let base = opts.base;

        if (url && url.startsWith("//"))
            url = "http:" + url;

        let contains_scheme = url && /^[^:]+:/.test(url);

        if (base && base.endsWith("/"))
            base = base.substring(0, base.length - 2);

        if (url && !contains_scheme && !url.startsWith("/"))
            url = "/" + url;

        return {spec: contains_scheme? url: base + url};
    };
    switch (typeof data) {
        case "string": return data.replace(
            /<[^>]+>/g,
            tag => tag.replace(
                /\b(href|src|action)=(?![\"\']?[a-z]+:\/\/)([\"\']?)([^\s>\"\']+)\2/i,
                (_, a, q, path) =>
                    a + "=" + q + uri({uri: path, base: baseUrl}).spec + q))
        case "object": {
            let $data = jQuery(data);
            for (let name of ["href", "src", "action"]) {
                let sl = "*[" + name + "]", fn = function absUrl_each() {
                    var {spec} = uri({uri: this.getAttribute(name), base: baseUrl});
                    this.setAttribute(name, spec);
                };
                $data.filter(sl).each(fn).end().find(sl).each(fn);
            }
            return data;
        }
    }
    return null;
};

CmdUtils.previewCallback = function(pblock, callback, abortCallback) {
    var previewChanged = false;
    function onPreviewChange() {
        console.log("aborted");
        pblock.removeEventListener("preview-change", onPreviewChange, false);
        previewChanged = true;
        if (abortCallback) abortCallback();
    }
    pblock.addEventListener("preview-change", onPreviewChange, false);

    return function wrappedCallback() {
        if (previewChanged) return null;
        console.log("applied");
        pblock.removeEventListener("preview-change", onPreviewChange, false);
        return callback.apply(this, arguments);
    };
};

CmdUtils.previewAjax = function(pblock, options) {
    var xhr;
    function abort() { if (xhr) xhr.abort() }

    var newOptions = {__proto__: options};
    for (var key in options) if (typeof options[key] === "function")
        newOptions[key] = CmdUtils.previewCallback(pblock, options[key], abort);

    // see scripts/jquery_setup.js
    var wrappedXhr = newOptions.xhr || jQuery.ajaxSettings.xhr;
    newOptions.xhr = function backgroundXhr() {
        var newXhr = wrappedXhr.apply(this, arguments);
        newXhr.mozBackgroundRequest = true;
        return newXhr;
    };

    return xhr = jQuery.ajax(newOptions);
};

CmdUtils.makeSearchCommand = function(options) {
    if (!("url" in options)) options.url = options.parser.url;
    var [baseUrl, domain] = /^\w+:\/\/([^?#/]+)/.exec(options.url) || [""];
    var [name] = [].concat(options.names || options.name);
    if (!name) name = options.name = domain;
    var htmlName = Utils.escapeHtml(name);
    if (!("icon" in options)) options.icon = baseUrl + "/favicon.ico";
    if (!("description" in options))
        options.description = L(
            "Searches %S for your words.",
            "defaultUrl" in options ? htmlName.link(options.defaultUrl) : htmlName);
    if (!("arguments" in options || "argument" in options))
        options.argument = noun_arb_text;
    if (!("execute" in options)) options.execute = CmdUtils.makeSearchCommand.execute;
    if (!("preview" in options)) {
        options.preview = CmdUtils.makeSearchCommand.preview;
        if ("parser" in options) {
            let {parser} = options;
            function fallback(n3w, old) {
                if (n3w in parser || !(old in parser)) return;
                Utils.reportWarning(
                    "makeSearchCommand: parser." + old + " is deprecated. " +
                    "Use parser." + n3w + " instead.", 2);
                parser[n3w] = parser[old];
            }
            fallback("body", "preview");
            fallback("baseUrl", "baseurl");
            if (!("baseUrl" in parser)) parser.baseUrl = baseUrl;
            if ("type" in parser) parser.type = parser.type.toLowerCase();
            parser.keys = ["title", "body", "href", "thumbnail"].filter((k) => k in parser);
            if ("log" in parser && typeof parser.log !== "function")
                parser.log = CmdUtils.makeSearchCommand.log;
        }
    }
    return CmdUtils.CreateCommand(options);
};

CmdUtils.makeSearchCommand.log = function searchLog(it, type) {
    Utils.log("SearchCommand: " + type + " =", it);
};
CmdUtils.makeSearchCommand.query = function searchQuery(target, query, charset) {
    var re = /%s|{QUERY}/g, fn = encodeURIComponent;
    if (charset) {
        //query = Utils.convertFromUnicode(charset, query);
        fn = escape;
    }
    return typeof target == "object"
        ? Object.keys(target).map(key => fn(key) + "=" + fn(target[key])).join("&")
        : target && target.replace(re, fn(query));
};
CmdUtils.makeSearchCommand.execute = function searchExecute({object: {text}}) {
    if (!text && "defaultUrl" in this)
        Utils.openUrlInBrowser(this.defaultUrl);
    else
        Utils.openUrlInBrowser(
            CmdUtils.makeSearchCommand.query(this.url, text, this.charset),
            CmdUtils.makeSearchCommand.query(this.postData, text, this.charset))
    CmdUtils.closePopup();
};
CmdUtils.makeSearchCommand.preview = function searchPreview(pblock, {object: {text}}) {
    if (!text) return this.previewDefault(pblock);

    function put() {
        pblock.innerHTML =
            "<div class='search-command'>" + Array.join(arguments, "") + "</div>";
    }
    var {parser, global} = this, queryHtml =
        "<strong class='query'>" + Utils.escapeHtml(text) + "</strong>";
    put(L("Searches %S for: %S", Utils.escapeHtml(this.name), queryHtml),
        !parser ? "" :
            "<p class='loading'>" + L("Loading results...") + "</p>");
    if (!parser) return;

    var {type, keys} = parser;
    var params = {
        url: CmdUtils.makeSearchCommand.query(parser.url || this.url, text, this.charset),
        dataType: parser.type || "text",
        success: searchParse,
        error: function searchError(xhr) {
            put("<em class='error'>", xhr.status, " ", xhr.statusText, "</em>");
        },
    };
    var pdata = parser.postData || this.postData;
    if (pdata) {
        params.type = "POST";
        params.data = CmdUtils.makeSearchCommand.query(pdata, text, this.charset);
    }
    CmdUtils.previewAjax(pblock, params);
    function searchParse(data) {
        if (!data) {
            put("<em class='error'>" + L("Error parsing search results.") + "</em>");
            return;
        }
        if (parser.log) parser.log(data, "data");
        switch (type) {
            case "json": return parseJson(data);
            case "xml" : return parseDocument(data);
            default: return Utils.parseHtml(data, parseDocument);
        }
    }
    function parseJson(data) {
        // TODO: Deal with key names that include dots.
        function dig(dat, key) {
            var path = parser[key];
            if (path.call) return path.call(dat, dat);
            for (let p of path && path.split(".")) dat = dat[p] || 0;
            return dat;
        }
        var results = [];
        if ("container" in parser)
            for (let dat of dig(data, "container")) {
                let res = {};
                for (let key of keys) res[key] = dig(dat, key);
                results.push(res);
            }
        else {
            let vals = keys.map(k => dig(data, k));
            for (let j in vals[0])
                results.push(keys.reduce((r, k, i) => (r[k] = vals[i][j], r), {}));
        }
        onParsed(results);
    };
    function parseDocument(doc) {
        var $ = jQuery, results = [], $doc = $(doc);
        function find($_, key) {
            var path = parser[key];
            return !path ? $() : path.call ? path.call($_, $_) : $_.find(path);
        }
        if ("container" in parser)
            find($doc, "container").each(function eachContainer() {
                var res = {}, $this = $(this);
                for (let k of keys) res[k] = find($this, k);
                results.push(res);
            });
        else {
            let qs = keys.map(k => find($doc, k));
            for (let j of Utils.seq(qs[0].length))
                results.push(keys.reduce((r, k, i) => (r[k] = qs[i].eq(j), r), {}));
        }
        function pluck() { return this.innerHTML || this.textContent }
        function toCont(key) {
            for (let r of results) r[key] = r[key].map(pluck).get().join(" ");
        }
        function toAttr(key, lnm, anm) {
            for (let res of results) {
                let $_ = res[key], atr = ($_.is(lnm) ? $_ : $_.find(lnm)).attr(anm);
                res[key] = atr && Utils.escapeHtml(atr);
            }
        }
        "thumbnail" in parser && toAttr("thumbnail", "img", "src");
        "body" in parser && toCont("body");
        if (!("href" in parser)) for (let r of results) r.href = r.title;
        toAttr("href", "a", "href");
        toCont("title");
        onParsed(results);
    }
    function onParsed(results) {
        if (parser.log) parser.log(results, "results");
        for (let k of parser.plain || [])
            for (let r of results) r[k] = r[k] && Utils.escapeHtml(r[k]);
        var list = "", i = 0, max = parser.maxResults || 4;
        for (let {title, href, body, thumbnail} of results) if (title) {
            if (href) {
                // no keyboard support in existing preview
                //let key = i < 35 ? (i+1).toString(36) : "-";
                //title = ("<kbd>" + key + "</kbd> <a href='" + href +
                let key = i + 1;
                title = (key + ". <a href='" + href +
                    "' accesskey='" + key + "'>" + title + "</a>");
            }
            list += "<dt class='title'>" + title + "</dt>";
            if (thumbnail)
                list += "<dd class='thumbnail'><img src='" + thumbnail + "'/></dd>";
            if (body)
                list += "<dd class='body'>" + body + "</dd>";
            if (++i >= max) break;
        }

        put(list
            ? ("<span class='found'>" +
                L("Results for %S:", queryHtml) +
                "</span><dl class='list'>" + list + "</dl>")
            : ("<span class='empty'>" +
                L("No results for %S.", queryHtml) +
                "</span>"));
        CmdUtils.absUrl(pblock, parser.baseUrl);
    }
};

// === {{{ CmdUtils.previewList(block, htmls, [callback], [css]) }}} ===
// Creates a simple clickable list in the preview block and
// returns the list element.
// * Activating {{{accesskey="0"}}} rotates the accesskeys
//   in case the list is longer than the number of available keys.
// * The buttons are disabled upon activation to prevent duplicate calls.
//   To re-enable them, make {{{callback}}} return {{{true}}}.
//
// {{{block}}} is the DOM element the list will be placed into.
//
// {{{htmls}}} is the array/dictionary of HTML string to be listed.
//
// {{{callback(id, ev)}}} is the function called
// when one of the list item becomes focused.
// *{{{id}}} : one of the keys of {{{htmls}}}
// *{{{ev}}} : the event object
//
// {{{css}}} is an optional CSS string inserted along with the list.

// function previewList(block, htmls, callback, css) {
//     var {escapeHtml} = Utils, list = "", num = 0, CU = this;
//     for (let key in htmls) {
//         let k = ++num < 36 ? num.toString(36) : "-";
//         list += ('<li><label for="' + num + '"><input type="button" id="' + num +
//             '" class="button" value="' + k + '" accesskey="' + k +
//             '" key="' + escapeHtml(key) + '"/>' + htmls[key] +
//             '</label></li>');
//     }
//     block.innerHTML = (
//         '<ol id="preview-list">' +
//         '<style>' + previewList.CSS + (css || "") + '</style>' +
//         '<input type="button" class="button" id="keyshifter"' +
//         ' value="0" accesskey="0"/>' + list + '</ol>');
//     var ol = block.firstChild, start = 0;
//     callback && ol.addEventListener("click", function onPreviewListClick(ev) {
//         var {target} = ev;
//         if (target.type !== "button") return;
//         ev.preventDefault();
//         if (target.id === "keyshifter") {
//             if (num < 36) return;
//             let buttons = Array.slice(this.getElementsByClassName("button"), 1);
//             start = (start + 35) % buttons.length;
//             buttons = buttons.splice(start).concat(buttons);
//             for (let i = 0, b; b = buttons[i];)
//                 b.value = b.accessKey = ++i < 36 ? i.toString(36) : "-";
//             return;
//         }
//         target.disabled = true;
//         if (callback.call(this, target.getAttribute("key"), ev))
//             Utils.setTimeout(function reenableButton() { target.disabled = false });
//     }, false);
//     return ol;
// }
// previewList.CSS = "\
//   #preview-list {margin: 0; padding-left: 1.5em; list-style-type: none}\
//   #preview-list > li {position: relative; min-height: 3ex}\
//   #preview-list > li:hover {outline: 1px solid; -moz-outline-radius: 8px}\
//   #preview-list label {display: block; cursor: pointer}\
//   #preview-list .button {\
//     position: absolute; left: -1.5em; height: 3ex;\
//     padding: 0; border-width: 1px;\
//     font: bold 108% monospace; text-transform: uppercase}\
//   #keyshifter {position:absolute; top:-9999px}\
// "


(function ( $ ) {
    $.fn.blankify = function( url ) {
        console.log("tryeing to blnk",this.find("a"));
        return this.find("a").not('[href^="http"],[href^="//:"],[href^="mailto:"],[href^="#"]').each(function() {
            console.log("bln");
            $(this).attr("target", "_blank").attr('href', function(index, value) {
                if (value.substr(0,1) !== "/") value = "/"+value;
                return url + value;
            });
});
        };
}( jQuery ));

// https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function url_domain(data) {
    var    a      = document.createElement('a');
           a.href = data;
    return a.hostname;
}

(function ( $ ) {
    $.fn.loadAbs = function( url, complete ) {
        var result = this;
        return this.load(url, function() {
            url = "http://"+url_domain( url );
            result.find("a")
                    .not('[href^="http"],[href^="//:"],[href^="mailto:"],[href^="#"]')
                    .attr("target", "_blank")
                    .attr('href', function(index, value) {
                if (typeof value === "undefined") return url;
                if (value.substr(0,1) !== "/") value = "/" + value;
                return url + value;
            });
            result.find("img")
                    .not('[src^="http"],[src^="//:"],[src^="mailto:"],[src^="#"]')
                    .attr('src', function(index, value) {
                if (typeof value === "undefined") return url;
                if (value.substr(0,1) !== "/") value = "/" + value;
                return url + value;
            });
            if (typeof complete === 'function') complete();
        });
    };
}( jQuery ));

