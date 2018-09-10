{
    const MS_TRANSLATOR_LIMIT = 1e4;

    function defaultLanguage(code2name, exclude) {
        for (let code of [chrome.i18n.getUILanguage()].concat(CmdUtils.acceptLanguages)) {
            if (!(code = code.trim())) continue;
            code = (/^(..-)(..)$/i.test(code)
                ? RegExp.$1.toLowerCase() + RegExp.$2.toUpperCase()
                : code.slice(0, 2).toLowerCase());
            if (code === exclude) continue;
            let name = code2name[code];
            if (name) return {name: name, code: code}
        }
        return {name: code2name["en"], code: "en"}
    }

    function translate(target, from, to, back) {
        if (!to) return void
            msTranslator("Detect", {text: target.text}, function detected(code) {
                translate(target, from, defaultLanguage(noun_type_lang_microsoft.MS_LANGS_REV, code).code, back)
            });
        let {html} = target
        // bitbucket#29: The API doesn't like apostrophes HTML-escaped.
        ~html.indexOf('<') || (html = html.replace(/&#39;/g, "'"));
        msTranslator("Translate", {
            contentType: "text/html", text: html, from: from, to: to,
        }, back)
    }

    function msTranslator(method, params, back) {
        params.appId = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"+ new Date % 10
        $.ajax({
            url: "http://api.microsofttranslator.com/V2/Ajax.svc/" + method,
            data: params,
            success : function mst_ok(json) { back(JSON.parse(json)) },
            error   : function mst_ng() {
                displayMessage({title: "Microsoft Translator", text: "(>_<)"})
            },
        })
    }

    CmdUtils.CreateCommand({
        name: "translate",
        description: "Translates from one language to another.",
        _namespace: "Translation",
        icon: "res/translate_bing.ico",
        arguments: {
            object: noun_arb_text,
            source: noun_type_lang_microsoft,
            goal: noun_type_lang_microsoft
        },
        builtIn: true,
        timeout: 1000,
        help:
            `Type <b>translate</b> or <b>translate this</b> to translate the selection,
            type <b>lingvo <i>some text</i></b> to translate text.<br/>
            You can specify source and destination languages after <b>from</b>
            or <b>to</b> words respectively, for example:
            <b>translate</b> mother <b>from</b> english <b>to</b> chinese<br>
            It works on the selected text in any web page, but there is a limit (a couple of paragraphs)
            to how much it can translate at once.
            If you want to translate a lot of text, use <b>translate-page</b> command instead.
          `,
        author: "satyr",
        execute: function translate_execute({object, goal, source}) {
            let from = "", to = "";

            if (source && source.data)
                from = source.data;

            if (goal && goal.data)
                to = goal.data;

            if (object.text && object.text.length <= MS_TRANSLATOR_LIMIT)
                translate(object, from, to, CmdUtils.setSelection.bind(CmdUtils));
            else
                CmdUtils.deblog("Error performing translation: no text or text exceeded limits");
            CmdUtils.closePopup();
        },
        preview: function translate_preview(pblock, {object, goal, source}) {
            let limitExceeded = object.text.length > MS_TRANSLATOR_LIMIT;
            let from = "", to = "";

            if (source && source.data)
                from = source.data;

            if (goal && goal.data)
                to = goal.data;

            if (!object.text || limitExceeded) {
                let ph = "";
                if (limitExceeded)
                    ph += '<p><em class="error">' +
                        _("The text you selected exceeds the API limit.") +
                        '</em>';
                pblock.innerHTML = ph;
                return;
            }

            pblock.innerHTML = _("Translating the selected text...");
            translate(
                object, from, to,
                CmdUtils.previewCallback(pblock, function show(html) {
                    pblock.innerHTML = html
                }))
        }
    });


    CmdUtils.CreateCommand({
        names: ["translate-page"],
        _namespace: "Translation",
        description: `Translates a whole page to the specified language using 
                        <a href="http://translate.google.com">Google Translate</a>.`,
        icon: "res/translate_google.ico",
        author: "satyr",
        builtIn: true,
        arguments: {
            object: noun_arb_text,
            goal: noun_type_lang_google,
        },
        execute: function gtranslate_execute({object, goal}) {
            if (!object.text)
                object.text = CmdUtils.getLocation();

            Utils.openUrlInBrowser(
                "http://translate.google.com/translate" +
                Utils.paramsToString({
                    u: object.text,
                    tl: goal.data || "en",
                }));
            CmdUtils.closePopup();
        },
        preview: function gtranslate_preview(pb, {object, goal}) {
            if (!object.text)
                object.text = CmdUtils.getLocation();

            let url = (object && object.text)? Utils.escapeHtml(object.text): "";
            let lang = (goal && goal.text && goal.text !== object.text)? goal.text: "English";

            pb.innerHTML =`Translates <i>${url}</i> to <strong>${lang}</strong>.`;
        },
    })
}