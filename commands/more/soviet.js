let rootURL = "http://old.sovsport.ru/";
let footballURL = "football/russia/";

CmdUtils.CreateCommand(
    {
        names: ["soviet"],
        uuid: "BB563505-67B7-4E00-AE6A-547636EFF053",
        /*---------------------------------------------------------------------------*/
        argument: [{role: "object", nountype: ["standings", "schedule"], label: "table", default: "standings"},
            {role: "modifier", nountype: ["football", "formula1"], label: "sport", default: "formula1"},
            {role: "format", nountype: ["premier", "first", "england"], label: "division", default: "premier"}],
        /*---------------------------------------------------------------------------*/
        description: "Get the latest soviet information about sport events.",
        help: `<span class="syntax">Syntax</span>
                <ul class="syntax">
                    <li><b>soviet</b> {<b>standings</b> | <b>schedule</b>} <b>of</b> <i>sport</i> [<b>in</b> <i>division</i>]</li>
                </ul>
                <span class="arguments">Arguments</span><br>
                <ul class="syntax">
                    <li>- <b>of</b> - a name of sport:</li>
                    <ul class="syntax">
                        <li>- <i>football</i></li>
                        <li>- <i>formula1</i></li>
                    </ul>
                    </li>
                    <li>- <b>in</b> - division (football only):
                        <ul class="syntax">
                            <li>- <i>premier</i></li>
                            <li>- <i>first</i></li>
                            <li>- <i>england</i></li>
                        </ul>
                    </li>
                </ul>
                <span class="arguments">Example</span>
                <ul class="syntax">
                    <li><b>soviet</b> <i>standings</i> <b>of</b> <i>football</i> <b>in</b> <i>england</i></li>
                </ul>`,

        previewDelay: 1000,
        builtIn: true,
        _hidden: true,
        _namespace: NS_MORE_COMMANDS,
        /*---------------------------------------------------------------------------*/
        icon: "/commands/more/soviet.png",
        /*---------------------------------------------------------------------------*/
        popup: function (doc) {
            CmdUtils.loadCSS(doc, "__soviet__", "/commands/more/soviet.css");
        },
        /*---------------------------------------------------------------------------*/
        preview: function (pblock, args) {
            pblock.innerHTML = "";
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
        _color_links: function(pblock) {
            let rows = $(pblock).find("tr");
            for (let row of rows) {
                let jrow = $(row);
                let num = jrow.find("td:nth-child(1)");
                if (parseInt(num.text()) % 2 === 1) {
                    let a = jrow.find("a");
                    a.css("color", "#484848");
                }

            }
        },
        _get_data: function (pblock, type, sport, division) {
            if (!sport)
                return;
            let self = this;
            let url = rootURL;
            switch (sport.toLowerCase()) {
                case "football":
                    url += "football/";
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
                                    case "standings":
                                        pblock.innerHTML = tables[0].outerHTML;
                                        self._color_links(pblock);
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
                                case "standings":
                                    pblock.innerHTML = tables[1].outerHTML;
                                    self._color_links(pblock);
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
            }
        }
    });
