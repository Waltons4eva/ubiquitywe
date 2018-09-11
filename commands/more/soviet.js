let rootURL = "http://old.sovsport.ru/";
let footballURL = "football/russia/";

CmdUtils.CreateCommand(
    {
        names: ["soviet"],
        uuid: "BB563505-67B7-4E00-AE6A-547636EFF053",
        /*---------------------------------------------------------------------------*/
        argument: [{role: "object", nountype: ["position", "schedule"], label: "table", default: "position"},
            {role: "modifier", nountype: ["football", "formula1"], label: "sport", default: "formula1"},
            {role: "format", nountype: ["premier", "first", "england"], label: "division", default: "premier"}],
        /*---------------------------------------------------------------------------*/
        description: "Get latest soviet information about sport events.",
        help: `Syntax: <i>soviet</i> <b>table</b> <i>of</i> <b>sport</b> <i>in</i> <b>division</b><br>
            <b>sport</b>: {football, formula1}<br>
            <b>table</b>: {position, schedule}<br>
            <b>division</b> (football only): {premier, first, england}
        `,
        timeout: 1000,
        builtIn: true,
        _hidden: true,
        _namespace: NS_MORE_COMMANDS,
        /*---------------------------------------------------------------------------*/
        icon: "commands/more/soviet.png",
        /*---------------------------------------------------------------------------*/
        init: function (doc) {
            Utils.getPref("debugMode", debugMode => {
                if (debugMode)
                    CmdUtils.loadCSS(doc, "__soviet__", "commands/more/soviet.css")
            });
        },
        /*---------------------------------------------------------------------------*/
        preview: function (pblock, args) {
            pblock.innerHTML = "";
            //if (args.modifier.text)
                this._get_data(pblock, args.object.text, args.modifier.text, args.format.text);
        },
        /*---------------------------------------------------------------------------*/
        _failureMessage: "error",
        _get_url: function (pblock, url, callback) {
            let self = this;
            CmdUtils.previewAjax(pblock, {
                url: url,
                type: "get",
                dataType: "html",
                success: function (data) {
                    self._requestUrl = url;
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
            if (!sport)
                return;

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
            if (this._requestUrl != null) {
                Utils.openUrlInBrowser(this._requestUrl);
                CmdUtils.closePopup();
            }
        }
    });
