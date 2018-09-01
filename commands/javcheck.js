(function () {

    var tableTemplate =
        "<table border='0' cellpadding='2' cellspacing='2' style='width: 100%'>"
        + "  <tbody>"
        + "    <tr>"
        + "      <!--td style='padding-right: 10px; font-weight: bold;'>Nyaa</td-->"
        + "      <td id='jav-sukebei-si'>sukebei.nyaa.si: Loading...</td>"
        + "    </tr>"
        + "    <tr>"
        + "      <!--td style='padding-right: 10px; font-weight: bold;'>Cat</td-->"
        + "      <td id='jav-sukebei'>sukebei.pantsu.cat: Loading...</td>"
        + "    </tr>"
        + "  </tbody>"
        + "</table>";

    CmdUtils.CreateCommand(
        {
            names: ["javcheck"],
            /*---------------------------------------------------------------------------*/
            builtIn: true, _namespace: "Search",
            /*---------------------------------------------------------------------------*/
            _hidden: true,
            /*---------------------------------------------------------------------------*/
            arguments: [{role: "object", nountype: noun_arb_text, label: "id"}],
            /*---------------------------------------------------------------------------*/
            timeout: 1000,
            /*---------------------------------------------------------------------------*/
            description: "Find JAV movies by studio code",
            /*---------------------------------------------------------------------------*/
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAB3RJTUUH3wsIESoSHO5pgwAAAAlwSFlzAAAewQAAHsEBw2lUUwAAAARnQU1BAACxjwv8YQUAAAHwSURBVHjanZM7a0JBEIUvSZGYQGwCgdQhf0AIKPgKomApCGJhL6TSHyBoJxYaDIiP1reCr8JSRIhNtLQQuQRRRBAu2Ggz2TPEoEEMRJh7Z3fP+XZm7ypZLJaLZ/HzeDxKMBikUCh0MqBxu92K0Wh8hlcSD5XBYPBGo1EqlUpULBZPBjTQ6vV6L7wA3AjaSyaT4cVCoXAyoIEWHngBUGOQTqd5h3w+/ycAWlE1AOqfClKpFDUaDVoul7RYLKhcLh+F/QJwBTcYJBIJ6vf7tF6vqdPpcDWAwLR7w4wcgP0WGIAK6vU6rVYrmkwmDEE1sizTcDik+XzOlbVaLUomk4cV7Fqo1WrU7XZps9mwQVEUGo/H1Gw2abvdMjibzR5vAdR2u80tTKdT6vV6nI9GIxoMBjSbzRi6q+DgKwAAKnqsVqvcby6Xo0qlwmex/0bsnYH6B/DPe8CAK3GrXuLxONNxysdAuy8ADbTfZ3AFwKXZbH5yOp0ffr//U4Qci8UOIMgx5/P5ZGhcLteH+Ps8wQvAuYhrrVZ7r9FoHnQ63aPNZnvDfceOCOSYwxo00MIDLwCSyWSSIpHIWTgcPrdarSoxvhWGV+yKQI45rEEDLTzw8kO0IAUCAUksSg6HQxLlqcQh3dnt9ncEcsxhDRpo4YH3C/zTRPIxWdz5AAAAAElFTkSuQmCC",
            /*---------------------------------------------------------------------------*/
            _previewBlock: null,
            preview: function (pblock, {object: {text}}) {
                pblock.innerHTML = tableTemplate;
                this._perform_check(pblock, text);
            },
            /*---------------------------------------------------------------------------*/
            _javlibRequest: null,
            _sukeRequest: null,
            _xidolRequest: null,
            _excnnRequest: null,
            _aidolRequest: null,
            _failureMessage: "error",
            _perform_check: function (pblock, movie_id) {
                if (!movie_id)
                    return;

                var self = this;
                var id_encoded = encodeURIComponent(movie_id.trim());


                if (self._sukesiRequest) {
                    self._sukesiRequest.abort();
                }

                var sukesiURI = "https://sukebei.nyaa.si/?f=0&c=0_0&q=" + id_encoded;
                self._sukesiRequest = new XMLHttpRequest();
                self._sukesiRequest.responseType = "document";
                self._sukesiRequest.open("GET", sukesiURI, true);
                self._sukesiRequest.onloadend = function (e) {

                    if (this.status == 200) {
                        var doc = self._sukesiRequest.response;
                        var td = pblock.querySelector("#jav-sukebei-si");
                        var elt = doc.querySelector("tbody tr");

                        if (elt) {
                            elt = doc.querySelector(".torrent-list");
                            var jelt = jQuery(elt);

                            jelt.find("thead, td:nth-child(1), td:nth-child(5)").remove();
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
                                    title.textContent = title.textContent.substring(0, 60);
                                    title.style.color = "#80ccff";
                                    title.href = title.href;

                                    /*var link_t = jrow.find("td:nth-child(2) i.fa-download").get(0);
                                    link_t.innerHTML = "T";
                                    link_t.parentElement.href = link_t.parentElement.href;

                                    var link_m = jrow.find("td:nth-child(2) i.fa-magnet").get(0);
                                    link_m.innerHTML = "U";*/

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

                        td.innerHTML = "sukebei.nyaa.si: " + (elt ? "<br>" + elt.outerHTML : "NO");
                    }

                    self._sukesiRequest = null;

                };
                self._sukesiRequest.send();

                if (self._sukeRequest) {
                    self._sukeRequest.abort();
                }

                var sukeURI = "https://sukebei.pantsu.cat/search?c=_&s=0&limit=50&userID=0&q=" + id_encoded;
                self._sukeRequest = new XMLHttpRequest();
                self._sukeRequest.responseType = "document";
                self._sukeRequest.open("GET", sukeURI, true);
                self._sukeRequest.onloadend = function (e) {

                    if (this.status == 200) {
                        var doc = self._sukeRequest.response;
                        var td = pblock.querySelector("#jav-sukebei");
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
                                    title.textContent = title.textContent.substring(0, 60);
                                    title.style.color = "#ff8533";
                                    title.href = title.href;

                                    /*var link_t = jrow.find("td:nth-child(2) .icon-floppy").get(0);
                                    link_t.innerHTML = "T";
                                    link_t.parentElement.href = link_t.parentElement.href;

                                    var link_m = jrow.find("td:nth-child(2) .icon-magnet").get(0);
                                    link_m.innerHTML = "U";*/

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

                        td.innerHTML = "sukebei.pantsu.cat: " + (elt ? "<br>" + elt.outerHTML : "NO");

                    }

                    self._sukeRequest = null;

                };
                self._sukeRequest.send();
            },
            /*---------------------------------------------------------------------------*/
            execute: function () {
                CmdUtils.closePopup();
            }
        });

})();