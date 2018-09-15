
$(onDocumentLoad);

function onDocumentLoad() {

    $("#ubiq-version").text(CmdUtils.VERSION);

    Utils.getPref("debugMode", debugMode => {
        if (CmdUtils.DEBUG) {
            $("#ubiq-debug-mode").show();
        }
        Utils.getPref("maxSearchResults", maxSearchResults => {
            $("#max-search-results").change(function () {
                CmdUtils.maxSearchResults = parseInt(maxSearchResults);
                Utils.setPref("maxSearchResults", this.value);
            }).val(maxSearchResults || 10);
        });
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
        $("#max-suggestions").change(function() {
            CmdUtils.maxSuggestions = parseInt(maxSuggestions);
            Utils.setPref("maxSuggestions", this.value);
        }).val(maxSuggestions || 5);
     });

    Utils.getPref("lingvoApiKey", lingvoApiKey => {
        $("#lingvo-api-key").change(function() {
            CmdUtils.lingvoApiKey = this.value;
            Utils.setPref("lingvoApiKey", this.value);
        }).val(lingvoApiKey);
    });

    Utils.getPref("microsoftTranslatorAPIKey", microsoftTranslatorAPIKey => {
        $("#bing-translator-api-key").change(function() {
            CmdUtils.microsoftTranslatorAPIKey = this.value;
            Utils.setPref("microsoftTranslatorAPIKey", this.value);
        }).val(microsoftTranslatorAPIKey);
    });

    $("#export-settings").mouseover((e) => {
        //e.preventDefault();

        chrome.storage.local.get(undefined, (settings) => {
            var file = new Blob([JSON.stringify(settings, null, 2)], {type: "application/json"});
            e.target.href = URL.createObjectURL(file);
            e.target.download = "ubiquity.json";
        });
    });

    $("#import-settings").click((e) => {
        e.preventDefault();
        console.log("uuu");
        $("#file-picker").click();
    });

    $("#file-picker").change((e) => {
        console.log("uuuu");
        if (e.target.files.length > 0) {
            let reader = new FileReader();
            reader.onload = function(re) {
                chrome.storage.local.set(JSON.parse(re.target.result));
                chrome.runtime.reload();
            };
            reader.readAsText(e.target.files[0]);
        }
    });
}

function changeLanguageSettings() {
  UbiquitySetup.languageCode = $("#language-select").val();
}