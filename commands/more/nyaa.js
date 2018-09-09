(function () {

    var tableTemplate =
        "<table border='0' cellpadding='2' cellspacing='2' style='width: 100%'>"
        + "  <tbody>"
        + "    <tr>"
        + "      <!--td style='padding-right: 10px; font-weight: bold;'>Nyaa</td-->"
        + "      <td id='table-si'>Nyaa: Loading...</td>"
        + "    </tr>"
        + "    <tr>"
        + "      <!--td style='padding-right: 10px; font-weight: bold;'>Cat</td-->"
        + "      <td id='table-cat'>NyaaPantsu: Loading...</td>"
        + "    </tr>"
        + "  </tbody>"
        + "</table>";

    CmdUtils.CreateCommand(
        {
            names: ["nyaa", "javcheck"],
            /*---------------------------------------------------------------------------*/
            builtIn: true,
            _namespace: "More Commands",
            /*---------------------------------------------------------------------------*/
            _hidden: true,
            /*---------------------------------------------------------------------------*/
            arguments: [{role: "object", nountype: noun_arb_text, label: "torrent"},
                        {role: "format", nountype: ["anime", "JAV"], label: "list", default: "JAV"}],
            /*---------------------------------------------------------------------------*/
            timeout: 1000,
            /*---------------------------------------------------------------------------*/
            description: "Search for anime releases.",
            help: `Syntax: nyaa <b>release title</b> in <b>list</b><br>
                   Available <b>list</b>s: anime, JAV`,
            /*---------------------------------------------------------------------------*/
            icon: "commands/more/nyaa.png",
            /*---------------------------------------------------------------------------*/
            preview: function (pblock, {object: {text}, format}) {
                pblock.innerHTML = tableTemplate;
                this._perform_check(pblock, text, format.text === "anime"? "www": "sukebei");
            },
            /*---------------------------------------------------------------------------*/
             _failureMessage: "error",
            _perform_check: function (pblock, movie_id, server) {
                if (!movie_id)
                    return;

                var self = this;
                var id_encoded = encodeURIComponent(movie_id.trim());


                if (self._nyaaRequest) {
                    self._nyaaRequest.abort();
                }

                var nyaURI = "https://" + server + ".nyaa.si/?f=0&c=0_0&q=" + id_encoded;
                self._nyaaRequest = new XMLHttpRequest();
                self._nyaaRequest.responseType = "document";
                self._nyaaRequest.open("GET", nyaURI, true);
                self._nyaaRequest.onloadend = function (e) {

                    if (this.status == 200) {
                        var doc = self._nyaaRequest.response;
                        var td = pblock.querySelector("#table-si");
                        var elt = doc.querySelector("tbody tr");

                        if (elt) {
                            elt = doc.querySelector(".torrent-list");
                            var jelt = jQuery(elt);

                            jelt.find("thead, td:nth-child(1), td:nth-child(5), .comments").remove();

                            jelt.find("td:nth-child(4)").each((i, cell) => {
                                if (!/\d+/.test(cell.textContent) || cell.textContent == "0")
                                    cell.parentElement.parentElement.removeChild(cell.parentElement);
                            });

                            var rows = jelt.find("tr");
                            if (rows.length == 0)
                                elt = null;
                            else {
                                rows.each((i, row) => {
                                    var jrow = jQuery(row);
                                    var title = jrow.find("td:nth-child(1) a").get(0);
                                    title.textContent = title.textContent.substring(0, server === "www"? 100: 60);
                                    title.style.color = "#80ccff";
                                    title.href = title.href;

                                    var link_t = jrow.find("td:nth-child(2) i.fa-download").get(0);
                                    if (link_t) {
                                        link_t.innerHTML = "T";
                                        link_t.parentElement.href = link_t.parentElement.href;
                                    }

                                    var link_m = jrow.find("td:nth-child(2) i.fa-magnet").get(0);
                                    if (link_m)
                                        link_m.innerHTML = "U";

                                    var size = jrow.find("td:nth-child(3)").get(0);
                                    size.style.whiteSpace = "nowrap";
                                    if (size.innerHTML == "Unknown")
                                        size.innerHTML = "?";


                                });

                                var parent = rows.get(0).parentElement;
                                rows.sort(function (a, b) {
                                    var an = parseInt(jQuery(a).find("td:nth-child(4)").get(0).textContent),
                                        bn = parseInt(jQuery(b).find("td:nth-child(4)").get(0).textContent);

                                    if (an > bn) {
                                        return -1;
                                    }
                                    if (an < bn) {
                                        return 1;
                                    }
                                    return 0;
                                });

                                rows.detach().appendTo(parent);
                            }
                        }

                        if (td)
                            td.innerHTML = "Nyaa: " + (elt ? "<br>" + elt.outerHTML : "NO");
                    }

                    self._nyaaRequest = null;

                };
                self._nyaaRequest.send();

                if (self._pantsuRequest) {
                    self._pantsuRequest.abort();
                }

                var pantsuURI = "https://" + server + ".pantsu.cat/search?c=_&s=0&limit=50&userID=0&q=" + id_encoded;
                self._pantsuRequest = new XMLHttpRequest();
                self._pantsuRequest.responseType = "document";
                self._pantsuRequest.open("GET", pantsuURI, true);
                self._pantsuRequest.onloadend = function (e) {

                    if (this.status == 200) {
                        var doc = self._pantsuRequest.response;
                        var td = pblock.querySelector("#table-cat");
                        var elt = doc.querySelector("tbody tr");

                        if (elt) {
                            elt = doc.querySelector("#torrentListResults").parentElement;
                            var jelt = jQuery(elt);

                            jQuery(doc.querySelector(".results table")).css("width", "100%");

                            jelt.find("thead, td:nth-child(1), td:nth-child(8)").remove();
                            jelt.find("td:nth-child(4)").each((i, cell) => {
                                if (!/\d+/.test(cell.textContent) || cell.textContent == "0")
                                    cell.parentElement.parentElement.removeChild(cell.parentElement);
                            });

                            var rows = jelt.find("tr");
                            if (rows.length == 0)
                                elt = null;
                            else {
                                rows.each((i, row) => {
                                    var jrow = jQuery(row);

                                    var title = jrow.find("td:nth-child(1) a").get(0);
                                    title.textContent = title.textContent.substring(0, server === "www"? 100: 60);
                                    title.style.color = "#ff8533";
                                    title.href = title.href;

                                    var link_t = jrow.find("td:nth-child(2) .icon-floppy");
                                    if (link_t) {
                                        link_t.get(0).innerHTML = "T";
                                        link_t.get(0).parentElement.href = link_t.get(0).parentElement.href;
                                        link_t.css("display", "inline");
                                        link_t.css("margin-left", "5px");
                                    }

                                    var link_m = jrow.find("td:nth-child(2) .icon-magnet");
                                    if (link_m) {
                                        link_m.get(0).innerHTML = "U";
                                        link_m.css("display", "inline");
                                    }

                                    var dlinks = jrow.find("td:nth-child(2)").get(0);
                                    dlinks.style.whiteSpace = "nowrapw";

                                   jrow.find("td:nth-child(4)").css("color", "green");
                                   jrow.find("td:nth-child(5)").css("color", "red");

                                    var size = jrow.find("td:nth-child(3)").get(0);
                                    size.style.whiteSpace = "nowrap";
                                    if (size.innerHTML == "Unknown")
                                        size.innerHTML = "?";

                                });

                                var parent = rows.get(0).parentElement;
                                rows.sort(function (a, b) {
                                    var an = parseInt(jQuery(a).find("td:nth-child(4)").get(0).textContent),
                                        bn = parseInt(jQuery(b).find("td:nth-child(4)").get(0).textContent);

                                    if (an > bn) {
                                        return -1;
                                    }
                                    if (an < bn) {
                                        return 1;
                                    }
                                    return 0;
                                });

                                rows.detach().appendTo(parent);
                            }
                        }

                        if (td)
                            td.innerHTML = "NyaaPantsu: " + (elt ? "<br>" + elt.outerHTML : "NO");

                    }

                    self._pantsuRequest = null;

                };
                self._pantsuRequest.send();
            },
            /*---------------------------------------------------------------------------*/
            execute: function () {
                CmdUtils.closePopup();
            }
        });

})();