//
// UbiquityWE a Ubiquity for Chrome
// rostok@3e.pl
// 
// based on http://github.com/cosimo/ubiquity-chrome/ by Cosimo Streppone, <cosimo@cpan.org>
//
// Original Ubiquity Project: http://labs.mozilla.org/ubiquity/
// jshint esversion: 6 

var ubiq_selected_command = 0;
var ubiq_selected_sent;
var ubiq_suggestions;

var ubiq_nl_parser;

// closes ubiquity popup, it's needed to be defined here to work in Firefox
CmdUtils.closePopup = function closePopup(w) {
    if (typeof popupWindow !== "undefined") 
        popupWindow.close();
    else
        window.close();
};

// sets the tip field (for time being this is the preview panel)
function ubiq_set_tip(v) {
    // var el = document.getElementById('ubiq-command-tip');
    // if (!el) return;
    // el.innerHTML = v;
    ubiq_set_preview(v);
}

function ubiq_preview_el() {
    return document.getElementById('ubiq-command-preview');
}

function ubiq_preview_set_visible(v) {
    document.getElementById('ubiq-command-panel').style.display = v ? '' : 'none';
    // if (!v)
    //     ubiq_suggestion_el().classList.add("result");
    // else
    //     ubiq_suggestion_el().classList.remove("result");
}


// sets preview panel, prepend allows to add new contnet to the top separated by HR
function ubiq_set_preview(v, prepend) {
    v = v || "";
    prepend = prepend === true;
    var el = ubiq_preview_el();
    if (!el) return;
    v = (v.indexOf("<") >= 0 || v.indexOf(">") >= 0)? v: '<div id="ubiq-help-wrapper">' + v + '</div>';
    el.innerHTML = v + (prepend ? "<hr/>" + el.innerHTML : "");
    //if (v!="") ubiq_set_suggestions("");
}

function ubiq_suggestion_el() {
    return document.getElementById('ubiq-suggestion-panel');
}

// sets result panel, prepend allows to add new contnet to the top separated by HR
function ubiq_set_suggestions(v, prepend, hide) {
    v = v || (hide? "": "<ul/>");
    prepend = prepend === true;
    var el = ubiq_suggestion_el();
    if (!el) return;
    el.innerHTML = v + (prepend ? "<hr/>" + el.innerHTML : "");
    if (v!="") ubiq_set_preview("");
}

// clears tip, result and preview panels
function ubiq_clear() {
    ubiq_set_tip("");
    ubiq_set_suggestions("");
    ubiq_set_preview("");
}

function ubiq_autocomplete() {
    if (ubiq_selected_sent) {
        let el = document.getElementById('ubiq_input');
        el.value = ubiq_selected_sent.completionText;
    }
}

function ubiq_show_preview(sent, args) {
    if (sent == null)
        return;

    var cmd_struct = sent._verb.cmd;
    if (!cmd_struct || !cmd_struct.preview)
        return;

    var preview_func = cmd_struct.preview;

    switch(typeof preview_func)
    {
        case 'undefined':
            ubiq_set_preview( cmd_struct.description );
            break;
        case 'string':
            ubiq_set_preview( preview_func );
            break;
        default:
            var pfunc = ()=>{
                // zoom overflow dirty fix
                CmdUtils.popupWindow.jQuery("#ubiq-command-preview").css("overflow-y", "auto");
                try {
                    sent.preview(ubiq_preview_el());
                    // trying to cope wit CmdUtils.previewAjax
                    ubiq_preview_el().dispatchEvent(new Event("preview-change"));
                } catch (e) {
                    CmdUtils.notify(e.toString(), "preview function error");
                    if (CmdUtils.backgroundWindow && CmdUtils.backgroundWindow.error) {
                        CmdUtils.backgroundWindow.error(e.stack);
                    }
                }
            };

            if (typeof cmd_struct.require !== 'undefined')
                CmdUtils.loadScripts( cmd_struct.require, ()=>{ pfunc(); } );
            else
            if (typeof cmd_struct.requirePopup !== 'undefined')
                CmdUtils.loadScripts( cmd_struct.requirePopup, ()=>{ pfunc(); }, window );
            else
            pfunc();
    }
}

function ubiq_execute() {
    if (ubiq_selected_sent)
        ubiq_selected_sent.execute();
}

function ubiq_help() {
    var html = "<div id='ubiq-help-wrapper'><p>Type the name of a command and press Enter to execute it. "
        + "Use <b>help</b> command for assistance.</p>";
    // html += "<div class='ubiq-help-heading'>Available commands</div>";
    // html += CmdUtils.CommandList.map((c)=>{
    //     return "<span fakeattr='"+c.name+"' href='#' title='"+c.description+"'>"
    //         + (c.builtIn ? c.name : "<u>"+c.name+"</u>")+"</span>";
    // }).sort().join(", ");
    html += "<p>";
    html += "<div class='ubiq-help-heading'>Keys</div>";
    html += "Ctrl+C - copy preview to clipboard<br>";
    html += "Ctrl+Alt+&ltkey&gt; - open search result prefixed with &ltkey&gt; in a new tab<br>";
    html += "&#8593;/&#8595; - cycle through command suggestions<br>";
    html += "F5 - reload the extension</div>";

    ubiq_set_preview(html);
    ubiq_preview_set_visible(true);
}

function ubiq_focus() {
    el = document.getElementById('ubiq_input');
    if (el.createTextRange) {
        var oRange = el.createTextRange();
        oRange.moveStart("character", 0);
        oRange.moveEnd("character", el.value.length);
        oRange.select();
    } else if (el.setSelectionRange) {
        el.setSelectionRange(0, el.value.length);
    }
    el.focus();
}

function ubiq_input() {
    var cmd = document.getElementById('ubiq_input');
    if (!cmd) {
        ubiq_selected_command = -1;
        return '';
    }
    return cmd.value;
}

// TODO: refactor evil side effects
function ubiq_ensure_command_in_range() {
    let in_range = false;
    // Don't navigate outside boundaries of the list of matches
    if (ubiq_suggestions && ubiq_selected_command >= ubiq_suggestions.length) {
        ubiq_selected_command = ubiq_suggestions.length - 1;
    }
    else if (ubiq_suggestions && ubiq_selected_command < 0) {
        ubiq_selected_command = 0;
    }
    else if (ubiq_suggestions)
        in_range = true;

    return in_range;
}

// TODO: refactor evil side effects
function get_next_comand_index(asc) {
    let index = ubiq_selected_command + (asc? 1: -1);

    // Don't navigate outside boundaries of the list of matches
    if (ubiq_suggestions && index >= ubiq_suggestions.length) {
        index = 0;
    }
    else if (index < 0) {
        index = ubiq_suggestions.length - 1;
    }
    else if (!ubiq_suggestions)
        return -1;

    return index;
}

function ubiq_select_command(index) {
    ubiq_ensure_command_in_range();
    if (ubiq_selected_command != index) {
        let previous_command = ubiq_selected_command;
        ubiq_selected_command = index;

        jQuery("#suggestion-item-" + previous_command).parent().removeClass("selected");
        var elt = jQuery(`#suggestion-item-${index}`);
        elt.parent().addClass('selected');

        ubiq_selected_sent = ubiq_suggestions[ubiq_selected_command];
        ubiq_autocomplete();
        ubiq_set_tip(ubiq_selected_sent._verb.cmd.description);
        ubiq_show_preview(ubiq_selected_sent);
    }
}

function _ubiq_image_error(elm) { 
    elm.src = 'res/spacer.png';
}

function ubiq_decorate_icon(icon) {
    if (!icon) {
        icon = 'res/spacer.png';
    }
    icon = '<img src="' + icon + '" border="0" alt="" align="absmiddle"> ';
    return icon;
}

function ubiq_command_icon(c) {
    return ubiq_decorate_icon(CmdUtils.CommandList[c].icon);
}

function ubiq_command_name(c) {
    return CmdUtils.CommandList[c].name;
}

function ubiq__onclick() {
    console.log("clicked");
}

// html-escape
// todo: rewrite it without inline div creation...
var ubiq_html_encoder = null;
function ubiq_html_encode(text) {
    if (!ubiq_html_encoder)
        ubiq_html_encoder = $('<div>')
    return ubiq_html_encoder.html(text).text();
}

function ubiq_default_state() {
    ubiq_preview_set_visible(false);
    ubiq_selected_command = -1;
    ubiq_selected_sent = null;
    ubiq_clear();
    ubiq_help();
}

// will also call preview
function ubiq_show_matching_commands(text) {
    if (!text) text = ubiq_input();

    if (text) {
        var query = ubiq_nl_parser.newQuery(text, null, CmdUtils.maxSuggestions, true);

        query.onResults = () => {
            ubiq_suggestions = query.suggestionList;

            ubiq_ensure_command_in_range();

            // We have matches, show a list
            if (ubiq_suggestions.length > 0) {
                var suggestions_div = document.createElement('div');
                var suggestions_list = document.createElement('ul');

                ubiq_set_tip(ubiq_suggestions[ubiq_selected_command]._verb.cmd.description);
                ubiq_show_preview(ubiq_suggestions[ubiq_selected_command]);

                for (let i in ubiq_suggestions) {
                    var is_selected = (i == ubiq_selected_command);
                    var s = ubiq_suggestions[i];
                    var li = document.createElement('LI');
                    li.innerHTML = `<div id="suggestion-item-${i}"><table cellspacing="1" cellpadding="1">
                            <tr><td>${ubiq_decorate_icon(s.icon)}</td><td>${s.displayHtml}</td></tr></table></div>`;
                    if (is_selected) {
                        li.setAttribute('class', 'selected');
                        ubiq_selected_sent = s;
                    }
                    suggestions_list.appendChild(li);
                }

                suggestions_div.appendChild(suggestions_list);
                ubiq_suggestion_el().innerHTML = suggestions_div.innerHTML; // shouldn't clear the preview
                for (let i in ubiq_suggestions)
                    jQuery(`#suggestion-item-${i}`).click((e) => {
                        ubiq_select_command(i);
                    });
                ubiq_preview_set_visible(true);
            } else {
                ubiq_default_state()
            }
        };
    }
    else
        ubiq_default_state();

    query.run();
}

var lcmd = "";

function ubiq_keydown_handler(evt) {
	// measure the input 
	CmdUtils.inputUpdateTime = performance.now();

    if (!evt) return;
    var kc = evt.keyCode;

    // On TAB, autocomplete
    if (kc == 9) {
        evt.preventDefault();
        ubiq_autocomplete();
        return;
    }

    // On ENTER, execute the given command
    if (kc == 13) {
        let input = ubiq_input();
        if (input.trim().toLowerCase() === "debug mode on") {
            Utils.setPref("debugMode", true, () => chrome.runtime.reload());
            return;
        }
        else if (input.trim().toLowerCase() === "debug mode off") {
            Utils.setPref("debugMode", false, () => chrome.runtime.reload());
            return;
        }

        ubiq_execute();
        return;
    }

    // On F5 restart extension
    if (kc == 116) {
        chrome.runtime.reload();
        return;
    }

    // Ctrl+C copies preview to clipboard
    if (kc == 67 && evt.ctrlKey) {
        backgroundPage.console.log("copy to clip");
        var el = ubiq_preview_el();
        if (!el) return;
        CmdUtils.setClipboard( el.innerText );
        return;
    }

    // Cursor up
    if (kc == 38) {
        evt.preventDefault();
        lcmd = "";
        ubiq_select_command(get_next_comand_index(false));
        return;
    }
    // Cursor Down
    else if (kc == 40) {
        evt.preventDefault();
        lcmd = "";
        ubiq_select_command(get_next_comand_index(true));
        return;
    }

    if (evt.ctrlKey && evt.altKey && kc >= 40 && kc <= 90) {
        let links = jQuery("[accessKey='" + String.fromCharCode(kc) + "']");
        if (links.length > 0)
            CmdUtils.addTab(links[0].href)
        return;
    }

    lcmd = ubiq_input();
}

function ubiq_keyup_handler(evt) {
    if (!evt) return;
    var kc = evt.keyCode;
    if (lcmd == ubiq_input()) return;

    if (evt.ctrlKey || evt.altKey)
        return;

    // Cursor up
    if (kc == 38) {
        return;
    }
    // Cursor Down
    else if (kc == 40) {
        return;
    }

    ubiq_save_input();
    ubiq_show_matching_commands();
    lcmd = ubiq_input();
}

function ubiq_save_input() {
	cmd = document.getElementById('ubiq_input');
    if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.set({ 'lastCmd': cmd.value });
}

function ubiq_load_input(callback) {
	cmd = document.getElementById('ubiq_input');
    if (typeof chrome !== 'undefined' && chrome.storage) chrome.storage.local.get('lastCmd', function(result) {
        lastCmd = result.lastCmd || "";
        cmd.value = lastCmd;
        cmd.select();
        callback();
    });
}

$(window).on('load', function() {
        if (typeof CmdUtils !== 'undefined' && typeof Utils !== 'undefined' && typeof backgroundPage !== 'undefined' ) {
        CmdUtils.setPreview = ubiq_set_preview;
        CmdUtils.popupWindow = window;

        ubiq_nl_parser = NLParser.makeParserForLanguage(CmdUtils.parserLanguage, CmdUtils.CommandList);

        for (cmd of CmdUtils.CommandList) {
            try {
                if (cmd.init) {
                    cmd.init(document);
                }
            }
            catch (e) {
                console.log(e.message);
            }
        }

         CmdUtils.updateActiveTab(() => {
             ubiq_load_input(() => {
                 ubiq_show_matching_commands();
             });
             console.log("hello from UbiquityWE");
         });

        // Add event handler to window
        document.addEventListener('keydown', function (e) {
            ubiq_keydown_handler(e);
        }, false);
        document.addEventListener('keyup', function (e) {
            ubiq_keyup_handler(e);
        }, false);
    } else {
        chrome.tabs.create({ "url": "chrome://extensions" });
        chrome.notifications.create({
            "type": "basic",
            "iconUrl": chrome.extension.getURL("res/icon-128.png"),
            "title": "UbiquityWE",
            "message": "There is something wrong, try restarting UbiquityWE"
        });
    }
});

$(window).on('unload', function() {
    CmdUtils.selectedText = "";
    CmdUtils.selectedHtml = "";
});