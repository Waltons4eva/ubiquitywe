
$(onDocumentLoad);

function onDocumentLoad() {

  if (CmdUtils.PRODUCTION)
      jQuery("#keybinding-row").remove();

  CmdUtils.getPref("parserLanguage", parserLanguage => {

      var $langSelect = $("#language-select");
      for (let code in NLParser.ParserRegistry) {
          let $opt = $("<option>", {val: code, text: NLParser.ParserRegistry[code].name});
          $opt[0].selected = code === parserLanguage;
          $langSelect.append($opt);
      }

      $langSelect.change(() => {
        let lang = $langSelect.find(":selected").val();
        CmdUtils.parserLanguage = lang;
        CmdUtils.setPref("parserLanguage", lang);
      });
    });

    CmdUtils.getPref("keyboardScheme", keyboardScheme => {
        var keyboardSchemeElt = $("#keyboard-scheme");
        keyboardSchemeElt.val(keyboardScheme || "ace");

        keyboardSchemeElt.change(() => {
            let scheme = keyboardSchemeElt.find(":selected").val();
            CmdUtils.setPref("keyboardScheme", scheme);
        });
    });

  CmdUtils.getPref("maxSuggestions", maxSuggestions => {
      jQuery("#max-suggestions").change(function changeMaxSuggestions() {
          CmdUtils.maxSuggestions = parseInt(maxSuggestions);
          CmdUtils.setPref("maxSuggestions", this.value);
      }).val(maxSuggestions || 5);
  });
};

function changeLanguageSettings() {
  UbiquitySetup.languageCode = jQuery("#language-select").val();
}