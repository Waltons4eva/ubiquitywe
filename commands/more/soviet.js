let rootURL = "http://old.sovsport.ru/";
let footballURL = "football/russia/";

CmdUtils.CreateCommand(
    {
        names: ["soviet"],
        /*---------------------------------------------------------------------------*/
        argument: [{role: "object", nountype: ["results", "schedule", "stats"], label: "data"},
            {role: "modifier", nountype: ["football", "formula1"], label: "sport"},
            {role: "format", nountype: noun_arb_text, label: "division"}],
        /*---------------------------------------------------------------------------*/
        description: "Get latest info from sovsport.ru",
        timeout: 1000,
        builtIn: true,
        _hidden: true,
        /*---------------------------------------------------------------------------*/
        icon: "commands/more/soviet.png",
        /*---------------------------------------------------------------------------*/
        init: function (doc) {
            console.log("init");
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
            switch (sport.toLowerCase()) {
                case "football":
                    if (type) {
                        division = division ? division : "premier";
                        let url = rootURL + footballURL + division;
                        //let url = "http://www.sovsport.ru/football/russia/premier-item/2146_2_20165";
                        this._get_url(pblock, url, function (tables) {
                            if (tables.length > 0) {
                                switch (type.toLowerCase()) {
                                    case "results":
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
                    let url = rootURL + "formula1";
                    this._get_url(pblock, url, function (tables) {
                        if (tables.length > 0) {
                            switch (type.toLowerCase()) {
                                case "stats":
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
