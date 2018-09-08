// Use lingvolive.com online service with the Firefox Ubiquity extension

// (C) 2010-2018 g/christensen (gchristnsn@gmail.com)

(function() {

    var abbyyServiceAPI = "https://developers.lingvolive.com";
    var urlTemplateAPI = "${service}/api/v1/Translation?text=${words}&srcLang=${from}&dstLang=${to}";
    var urlTemplateTranslate = "https://www.lingvolive.com/en-us/translate/${from}-${to}/${words}";

    var latinREAPI = new RegExp("[a-z]");

    var langListAPI = {
        "de": 1031,
        "fr": 1036,
        "it": 1040,
        "es": 1034,
        "ua": 1058,
        "la": 1142,
        "en": 1033,
        "ru": 1049,
        "ch": 1028
    };

    var lingvoLiveAPIToken;
    var executionUrl;

    CmdUtils.CreateCommand(
        {
            names: ["lingvo"],
            /*---------------------------------------------------------------------------*/
            builtIn: true, _namespace: "Translation",
            /*---------------------------------------------------------------------------*/
            arguments: [{role: "object", nountype: noun_arb_text, label: "words"},
                {role: "source", nountype: langListAPI, label: "language"},
                {role: "goal", nountype: langListAPI, label: "language"}],
            /*---------------------------------------------------------------------------*/
            description: "Translate words using Abbyy Lingvo online service",
            /*---------------------------------------------------------------------------*/
            help: "Type <b>lingvo</b> or <b>lingvo this</b> to translate a selection, "
            + "type <b>lingvo word</b> to translate a word.<br/>"
            + "You can specify source and destination languages after <b>from</b> "
            + "or <b>to</b> words respectively, for example:<br/><br/>"
            + " <b>lingvo</b> espoir <b>from</b> fr <b>to</b> ru<br/><br/>"
            + "Supported language abbreviations are:<br/>"
            + " de - German<br/>"
            + " en - English<br/>"
            + " es - Spanish<br/>"
            + " fr - French<br/>"
            + " it - Italian<br/>"
            + " la - Latin<br/>"
            + " ru - Russian<br/>"
            + " ua - Ukrainan",
            /*---------------------------------------------------------------------------*/
            icon: "res/lingvo.png",
            /*---------------------------------------------------------------------------*/
            timeout: 1000,
            /*---------------------------------------------------------------------------*/
            author: {name: "G. Christensen", email: "gchristnsn@gmail.com"},
            /*---------------------------------------------------------------------------*/
            execute: function (args) {
                if (executionUrl != null)
                    CmdUtils.addTab(executionUrl);
                CmdUtils.closePopup();
            },
            /*---------------------------------------------------------------------------*/
            preview: function (pblock, args) {
                this.previewBlock = pblock;

                function norm(arg) {
                    if (args[arg] && args[arg].text)
                        return args[arg].text.trim().toLowerCase();
                }

                try {
                    if (!lingvoLiveAPIToken)
                        this._authorize().then(() => {
                            this._translate(norm("object"), norm("source"), norm("goal"));
                        });
                    else
                        this._translate(norm("object"), norm("source"), norm("goal"));
                }
                catch (e) {
                    pblock.innerHTML = this._failureMessage;
                }

            },
            /*---------------------------------------------------------------------------*/
            _failureMessage: "error",
            /*---------------------------------------------------------------------------*/
            _authorize: function () {
                var self = this;

                return jQuery.ajax({
                    type: "POST",
                    headers: {
                        "Authorization":
                            (CmdUtils.PRODUCTION
                                ?"Basic NGNmNTVlNzUtNzg2MS00ZWE1LWIzNWItNjNlMTAyZTM5YmRlOmM3NTg3MDY2Y2MyMDQxY2E4NTQ0MDZhOTQyYTcxMTk2"
                                :"Basic ZGQxMzE5MmItZmFiNy00ZmFiLTkwNWUtYzc0ZDhlYTU5MGYxOjg1MjRjMDVkNTZkZDQ3NDhhMTM4NTg0MDFjNTRiMWM2")
                    },
                    url: abbyyServiceAPI + "/api/v1.1/authenticate"
                }).then(data => {
                    lingvoLiveAPIToken = data;
                });
            },
            /*---------------------------------------------------------------------------*/
            _translate: function (words, from, to) {
                words = words ? words.trim().toLowerCase() : null;

                this._failureMessage = "Could not translate \"<b>" + words + "</b>\"";
                this.previewBlock.innerHTML = "translating <b>" + words + "</b> ...";

                if (this.oldRequest != undefined)
                    this.oldRequest.abort();

                function abbrev2id(lang, def, bypass) {
                    var langId = lang;
                    if (!langId)
                        langId = def;
                    return bypass ? langId : langListAPI[langId];
                }

                var isLatin = latinREAPI.test(words);

                var requestUrl = CmdUtils.renderTemplate(urlTemplateAPI,
                    {
                        service: abbyyServiceAPI,
                        words: words, //words.replace(/ /, "+"),
                        from: abbrev2id(from, isLatin ? "en" : "ru"),
                        to: abbrev2id(to, isLatin ? "ru" : "en")
                    });

                executionUrl = CmdUtils.renderTemplate(urlTemplateTranslate,
                    {
                        words: words, //words.replace(/ /, "+"),
                        from: abbrev2id(from, isLatin ? "en" : "ru", true),
                        to: abbrev2id(to, isLatin ? "ru" : "en", true)
                    });

                var self = this;

                var errorCtr = 0;

                var options = {
                    url: requestUrl,
                    dataType: "json",
                    headers: {
                        "Authorization": "Bearer " + lingvoLiveAPIToken
                    },
                    success: function (data) {
                        try {
                            self._onTranslated(words, data, requestUrl);
                        }
                        catch (e) {
                            self.previewBlock.innerHTML = self._failureMessage;
                        }
                    },
                    statusCode: {
                        401: function () {
                            if (errorCtr === 0) {
                                lingvoLiveAPIToken = undefined;
                                self._authorize();
                                self.oldRequest = jQuery.get(options);
                                errorCtr += 1;
                            }
                            else
                                self.previewBlock.innerHTML = self._failureMessage;
                        }
                    },
                    error: function (data) {
                        self.previewBlock.innerHTML = self._failureMessage;
                    }
                };

                self.oldRequest = jQuery.get(options);
            },
            /*---------------------------------------------------------------------------*/
            _onTranslated: function (words, jsonResponse, requestUrl) {
                var response = this._formatJSON(jsonResponse, words);

                if (response == null) {
                    this.previewBlock.innerHTML = this._failureMessage;
                    executionUrl = null;
                }
                else {
                    this.previewBlock.innerHTML = response;
                }
            },
            /*---------------------------------------------------------------------------*/
            _formatItem: function (item, result, listLevel, afterAbbrev) {

                if (item.IsOptional)
                    return;

                if (Array.isArray(item))
                    for (let i = 0; i < item.length; ++i)
                        this._formatItem(item[i], result, listLevel, i > 0 && item[i - 1].Node === "Abbrev");
                else {
                    if (item.Title) {
                        result.push("<h4 style='background-color: gray;'>" + item.Dictionary + "</h4>");
                        this._formatItem(item.Body, result);
                    }
                    else {
                        if (item.IsItalics)
                            result.push("<i>");
                        if (item.IsAccent)
                            result.push("<b>");

                        if (item.Text && item.Text.length > 0 && /[\w�-�0-9]/i.test(item.Text[0]) && afterAbbrev)
                            item.Text = " " + item.Text;

                        switch (item.Node) {
                            case "Paragraph":
                                if (!listLevel || listLevel == 1)
                                    result.push("<p>");
                                this._formatItem(item.Markup, result);
                                if (!listLevel || listLevel == 1)
                                    result.push("</p>");
                                break;
                            case "Transcription":
                                result.push("<span style='color: #80ff80'>");
                                result.push("[" + item.Text + "]");
                                result.push("</span>");
                                break;
                            case "Text":
                                result.push(item.Text);
                                break;
                            case "Abbrev":
                                result.push("<span style='color: #a5a5a5'>");
                                result.push(item.Text);
                                result.push("</span>");
                                break;
                            case "Comment":
                                result.push("<span style='color: #a5a5a5'>");
                                this._formatItem(item.Markup, result);
                                result.push("</span>");
                                break;
                            case "List":
                                // if (listLevel && listLevel > 1)
                                //     result.push("<br/>");
                                result.push("<ol style='padding-left: " + (listLevel && listLevel > 1 ? "10" : "15") + "px;' ");
                                if (listLevel && listLevel > 1)
                                    result.push("class='sublist'");
                                result.push(">");
                                this._formatItem(item.Items, result, listLevel ? listLevel + 1 : 1);
                                result.push("</ol>");
                                break;
                            case "ListItem":
                                result.push("<li>");
                                this._formatItem(item.Markup, result, listLevel);
                                result.push("</li>");
                                break;
                            case "CardRefs":
                                this._formatItem(item.Items, result);
                                break;
                            case "CardRefItem":
                                this._formatItem(item.Markup, result);
                                break;
                            case "CardRef":
                                result.push(item.Text);
                                break;
                            case "Examples":
                                result.push("<ul style='padding-left: 15px;'>");
                                this._formatItem(item.Items, result);
                                result.push("</ul>");
                                break;
                            case "ExampleItem":
                                result.push("<li>");
                                this._formatItem(item.Markup, result);
                                result.push("</li>");
                                break;
                            case "Example":
                                this._formatItem(item.Markup, result);
                                break;
                        }

                        if (item.IsItalics)
                            result.push("</i>");
                        if (item.IsAccent)
                            result.push("</b>");

                    }
                }
            },
            /*---------------------------------------------------------------------------*/
            _formatJSON: function (json, words) {
                var result = ["<style>"
                + "ol.sublist {counter-reset: list;} "
                + "ol.sublist > li {list-style: none;} "
                + "ol.sublist > li:before "
                + "{content: counter(list) ') '; "
                + "counter-increment: list;}"
                + "</style>"
                + "<h3 style='color: #66b3ff'>" + words + "</h3>"];
                json.forEach(j => this._formatItem(j, result));
                return result.join("");
            }
        });

})();