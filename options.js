
$(onDocumentLoad);

function onDocumentLoad() {

    $("#ubiq-version").text(CmdUtils.VERSION);
    
    let commandList = $("#context-menu-commands");
    
    for (let cmd of CmdUtils.ContextMenuCommands) {
        commandList.append(`<tr id="${cmd.uuid}">
            <td class="remove-item">&#xD7;</td>
            <td><input type="text" name="label" value="${Utils.escapeHtml(cmd.label)}"/></td>
            <td><input type="text" name="command"  value="${Utils.escapeHtml(cmd.command)}" disabled/></td>
            <td><input type="checkbox" name="execute"  ${cmd.execute? "checked": ""}/><img src="res/execute.png" title="Execute"/></td>
        </tr>`);
    }

    $("#context-menu-commands .remove-item").click((e) => {
        let tr = e.target.parentNode;
        if (confirm("Are you sure?")) {
            let cm = CmdUtils.getContextMenuCommand($(tr).find("input[name='command']").val());
            let i = CmdUtils.ContextMenuCommands.indexOf(cm);
            CmdUtils.ContextMenuCommands.splice(i, 1);
            tr.parentNode.removeChild(tr);
            CmdUtils.createContextMenu();
            Utils.setPref("contextMenuCommands", CmdUtils.ContextMenuCommands);
        }
    });

    $("#context-menu-commands input[name='label']").blur((e) => {
        let tr = e.target.parentNode.parentNode;
        let cm = CmdUtils.getContextMenuCommand($(tr).find("input[name='command']").val());
        cm.label = e.target.value;
        CmdUtils.createContextMenu();
        Utils.setPref("contextMenuCommands", CmdUtils.ContextMenuCommands);
    });

    $("#context-menu-commands input[name='execute']").change((e) => {
        let tr = e.target.parentNode.parentNode;
        let cm = CmdUtils.getContextMenuCommand($(tr).find("input[name='command']").val());
        cm.execute = e.target.checked;
        Utils.setPref("contextMenuCommands", CmdUtils.ContextMenuCommands);
    });

    Utils.getPref("rememberContextMenuCommands", rememberContextMenuCommands => {
        let cmHistorySwitch = $("#cm-history-switch");
        cmHistorySwitch.prop("checked", !rememberContextMenuCommands);
        CmdUtils.rememberContextMenuCommands = rememberContextMenuCommands;
        cmHistorySwitch.change((e) => {
            CmdUtils.rememberContextMenuCommands = !e.target.checked;
            Utils.setPref("rememberContextMenuCommands", CmdUtils.rememberContextMenuCommands);
        });
    });

    Utils.getPref("debugMode", debugMode => {
        if (CmdUtils.DEBUG) {
            $("#ubiq-debug-mode, .imp-exp").show();
            $("#max-search-results-row").show();

            Utils.getPref("maxSearchResults", maxSearchResults => {
                $("#max-search-results").change(function () {
                    CmdUtils.maxSearchResults = parseInt(maxSearchResults);
                    Utils.setPref("maxSearchResults", this.value);
                }).val(maxSearchResults || 10);
            });
        }
    });

  Utils.getPref("parserLanguage", parserLanguage => {

      var $langSelect = $("#language-select");
      for (let code in NLParser.ParserRegistry) {
          let $opt = $("<option>", {val: code, text: NLParser.ParserRegistry[code].name});
          $opt[0].selected = code === parserLanguage;
          $langSelect.append($opt);
      }

      $langSelect.change(() => {
        let lang = $langSelect.find(":selected").val();
        CmdUtils.parserLanguage = lang;
        Utils.setPref("parserLanguage", lang);
      });
    });

    Utils.getPref("keyboardScheme", keyboardScheme => {
        var keyboardSchemeElt = $("#keyboard-scheme");
        keyboardSchemeElt.val(keyboardScheme || "ace");

        keyboardSchemeElt.change(() => {
            let scheme = keyboardSchemeElt.find(":selected").val();
            Utils.setPref("keyboardScheme", scheme);
        });
    });

    Utils.getPref("maxSuggestions", maxSuggestions => {
        $("#max-suggestions").change(function changeMaxSuggestions() {
            CmdUtils.maxSuggestions = parseInt(maxSuggestions);
            Utils.setPref("maxSuggestions", this.value);
        }).val(maxSuggestions || 5);
     });
}

function changeLanguageSettings() {
  UbiquitySetup.languageCode = $("#language-select").val();
}