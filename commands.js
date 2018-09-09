var {escapeHtml} = Utils;

function setupHelp(clickee, help) {
    var toggler = jQuery(clickee).click(function toggleHelp() {
        jQuery(help)[(this.off ^= 1) ? "slideUp" : "slideDown"]();
        [this.textContent, this.bin] = [this.bin, this.textContent];
    })[0];
    toggler.textContent = "Show help";
    toggler.bin = "Hide help";
    toggler.off = true;
}

function A(url, text, className, attrs) {
    var a = document.createElement("a");
    a.href = url;
    a.textContent = text || url;
    if (className) a.className = className;
    for (let attr in attrs) a.setAttribute(attr, attrs[attr]);
    return a;
}

function actionLink(text, action) {
    return jQuery("<span></span>").text(text).click(action).addClass("action")
}

function fillTableCellForFeed(cell, feed, subtext) {
    cell.append(
        A("#", feed, ""),
        "<br/>");
    cell.append(jQuery('<div class="meta">' +
        '<div class="author">' + subtext + '</div>'
        + '</div>'))
}

function formatMetaData(md) {
    var authors = md.authors || md.author;
    var contributors = md.contributors || md.contributor;
    var {license, homepage} = md;
    function div(data, format, klass, lkey) {
        return !data ? "" : (
        '<div class="' + klass + '">'
        + format(data) +
        '</div>')
    };
    return (
        '<div class="meta">' +
        div(authors, formatAuthors, "author", "createdby") +
        div(license, escapeHtml, "license", "license") +
        div(contributors, formatAuthors, "contributors", "contributions") +
        div(homepage, formatUrl, "homepage", "viewmoreinfo") +
        '</div>');

}

function formatAuthors(authors) {
    return ([].concat(authors)).map(a => formatAuthor(a)).join(", ");
}

function formatAuthor(authorData) {
    if (!authorData) return "";

    if (typeof authorData === "string") return escapeHtml(authorData);

    var authorMarkup = "";
    if ("name" in authorData && !("email" in authorData)) {
        authorMarkup += escapeHtml(authorData.name) + " ";
    }
    else if ("email" in authorData) {
        var ee = escapeHtml(authorData.email);
        authorMarkup += (
            '<a href="mailto:' + ee + '">' +
            ("name" in authorData ? escapeHtml(authorData.name) : ee) +
            '</a> ');
    }

    if ("homepage" in authorData) {
        authorMarkup += ('[<a href="' + escapeHtml(authorData.homepage) +
            '">' + "Homepage: " + '</a>]');
    }

    return authorMarkup;
}

function formatUrl(url) {
    var hu = escapeHtml(url);
    return hu.link(hu);
}

function compareByName(a, b) {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
}

function fillTableRowForCmd(row, cmd, className) {
    var {name, names} = cmd;
    var cmdElement = jQuery(
        '<td class="command">' +
        (!("icon" in cmd) ? "" :
            '<img class="favicon" src="' + escapeHtml(cmd.icon) + '"/>') +
        ('<a class="id" name="' + escapeHtml(cmd.id) + '"/>' +
            '<span class="name">' + escapeHtml(name) + '</span>') +
        '<span class="description"></span>' +
        (names.length < 2 ? "" :
            ('<div class="synonyms-container light">' +
                 "Synonims: " +
                    ('<span class="synonyms">' +
                        escapeHtml(names.slice(1).join(", ")) +
                        '</span>') +
                '</div>')) +
        formatMetaData(cmd) +
        '<div class="help"></div>' +
        '</td>');

    if (cmd.oldAPI) {
        cmdElement.addClass("old-api").prepend(
            A("https://wiki.mozilla.org/Labs/Ubiquity/" +
                "Parser_2_API_Conversion_Tutorial", "OLD API", "badge"));
    }

    if (className) {
        //checkBoxCell.addClass(className);
        cmdElement.addClass(className);
    }

    for (let key of ["description", "help"]) if (key in cmd) {
        let node = cmdElement[0].getElementsByClassName(key)[0];
        try { node.innerHTML = cmd[key] }
        catch (e) {
            let msg = 'XML error in "' + key + '" of [ ' + cmd.name + ' ]';
            console.error(msg);
        }
    }

    return row.append(cmdElement);
}

function insertNamespace(namespace, subtext, commands, table) {
    aRow = jQuery("<tr></tr>");
    feedElement = jQuery('<td class="topcell command-feed" ' + 'rowspan="' + commands.length + '"></td>');
    fillTableCellForFeed(feedElement, namespace, subtext);
    aRow.append(feedElement);

    if (commands.length > 0)
        fillTableRowForCmd(aRow, commands.shift(), "topcell command");

    table.append(aRow);

    if (commands.length > 0) {
        commands.forEach(c => {
            let aRow = jQuery("<tr></tr>");
            fillTableRowForCmd(aRow, c, "command");
            table.append(aRow);
        });
    }
    else
        aRow.append("<td class=\"topcell command\">&nbsp</td>");

}

function buildTable(customscripts) {
    let table = jQuery("#commands-and-feeds-table");

    var builtinCommands = CmdUtils.CommandList.filter((c) => c.builtIn).sort(compareByName);
    var userCommands = CmdUtils.CommandList.filter((c) => !c.builtIn).sort(compareByName);
    var commandCount = builtinCommands.length + userCommands.length;

    jQuery("#num-commands").text(commandCount);

    const BUILTIN_AUTHOR = "by Ubiquity Authors";

    function insertBuiltinNamespace(ns) {
        var namespaced = CmdUtils.CommandList.filter((c) => c.builtIn && c._namespace === ns).sort(compareByName);
        insertNamespace(ns, BUILTIN_AUTHOR, namespaced, table);
    }

    insertBuiltinNamespace("Ubiquity");
    insertBuiltinNamespace("Browser");
    insertBuiltinNamespace("Utility");
    insertBuiltinNamespace("Search");
    insertBuiltinNamespace("Syndication");
    insertBuiltinNamespace("Translation");

    if (CmdUtils.DEBUG)
        insertBuiltinNamespace("More Commands");

    builtinCommands = CmdUtils.CommandList.filter((c) => c.builtIn && !c._namespace).sort(compareByName);
    if (builtinCommands.length > 0)
        insertNamespace("Builtin Commands", BUILTIN_AUTHOR, builtinCommands, table);

    // TODO: sort categories
    for (n in customscripts) {
        if (n !== "default") {
            var commands = CmdUtils.CommandList.filter((c) => c._namespace === n).sort(compareByName);
//            if (commands.length > 0)
                insertNamespace(n, '<a href="edit.html?' + encodeURI(n)
                    + '" target="_blank">Open in editor</a>', commands, table);
        }
    }

    var defaultCommands = CmdUtils.CommandList.filter((c) => c._namespace === "default").sort(compareByName);
//    if (defaultCommands.length > 0)
    insertNamespace("Other Commands", '<a href="edit.html" target="_blank">Open in editor</a>',
        defaultCommands, table);
}

jQuery(function onReady() {
    //setupHelp("#show-hide-help", "#cmdlist-help-div");
    CmdUtils.loadCustomScripts(customscripts => {
        buildTable(customscripts);
    });
});
