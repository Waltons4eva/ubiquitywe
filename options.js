
$(onDocumentLoad);

function onDocumentLoad() {

    jQuery("#ubiq-version").text(CmdUtils.VERSION);

    Utils.getPref("debugMode", debugMode => {
        if (CmdUtils.DEBUG)
            jQuery("#ubiq-debug-mode, .imp-exp").show();
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
        jQuery("#max-suggestions").change(function changeMaxSuggestions() {
            CmdUtils.maxSuggestions = parseInt(maxSuggestions);
            Utils.setPref("maxSuggestions", this.value);
        }).val(maxSuggestions || 5);
     });
}

function changeLanguageSettings() {
  UbiquitySetup.languageCode = jQuery("#language-select").val();
}