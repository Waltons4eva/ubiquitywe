let rootURL = "http://old.sovsport.ru/";
let footballURL = "football/russia/";

CmdUtils.CreateCommand(
    {
        names: ["soviet"],
        /*---------------------------------------------------------------------------*/
        argument: [{role: "object", nountype: ["position", "schedule"], label: "table", default: "position"},
            {role: "modifier", nountype: ["football", "formula1"], label: "sport", default: "formula1"},
            {role: "format", nountype: ["premier", "first", "england"], label: "division", default: "premier"}],
        /*---------------------------------------------------------------------------*/
        description: "Get latest information about sport events.",
        help: `Syntax: sovsport <b>table</b> of <b>sport</b> in <b>division</b><br>
            Available <b>table</b>s: position, schedule<br>
            Available <b>sports</b>s: football, formula1<br>
            Available <b>division</b>s: premier, first, england
        `,
        timeout: 1000,
        builtIn: true,
        _hidden: true,
        _namespace: "More Commands",
        /*---------------------------------------------------------------------------*/
        icon: "commands/more/soviet.png",
        /*---------------------------------------------------------------------------*/
        init: function (doc) {
            CmdUtils.getPref("debugMode", debugMode => {
                if (debugMode)
                    CmdUtils.loadCSS(doc, "__soviet__", "commands/more/soviet.css")
            });
        },
        /*---------------------------------------------------------------------------*/
        preview: function (pblock, args) {
            pblock.innerHTML = "";
            this._get_data(pblock, args.object.text, args.modifier.text, args.format.text);
        },
        /*---------------------------------------------------------------------------*/
        _failureMessage: "error",
        _get_url: function (pblock, url, callback) {
            CmdUtils.previewAjax(pblock, {
                url: url,
                type: "get",
                dataType: "html",
                success: function (data) {
                    let tables = jQuery(data).find(".stat-table_wrapper");
                    tables.find("input").remove();
                    tables.find("select").remove();
                    tables.find(".stat-table_controls_btn").remove();
                    tables.find(".stat-table_popup").remove();

                    tables.find("a").each((i, o) => o.href = rootURL + o.href.substring(18));

                    callback(tables);
                }
            });
        },
        _get_data: function (pblock, type, sport, division) {
            let url = rootURL;
            switch (sport.toLowerCase()) {
                case "football":
                    url += "football/"
                    if (type) {
                        if (division === "england")
                            url += "world/england";
                        else if (division === "premier")
                            url += "russia/premier";
                        else
                            url += "russia/first";
                        console.log(url);
                        this._get_url(pblock, url, function (tables) {
                            if (tables.length > 0) {
                                switch (type.toLowerCase()) {
                                    case "position":
                                        pblock.innerHTML = tables[0].outerHTML;
                                        break;
                                    case "schedule":
                                        pblock.innerHTML = tables[1].outerHTML;
                                        break;
                                }
                            }
                        });

                    }

                    break;

                case "formula1":
                    url += "formula1";
                    this._get_url(pblock, url, function (tables) {
                        if (tables.length > 0) {
                            switch (type.toLowerCase()) {
                                case "position":
                                    pblock.innerHTML = tables[1].outerHTML;
                                    break;
                                case "schedule":
                                    pblock.innerHTML = tables[0].outerHTML;
                                    break;
                            }
                        }
                    });
                    break;
            }

        },
        /*---------------------------------------------------------------------------*/
        execute: function () {
            if (this._requestUrl != null)
                Utils.openUrlInBrowser(this._requestUrl);
        }
    });
