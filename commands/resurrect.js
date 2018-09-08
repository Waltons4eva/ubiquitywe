// Try to resurrect a dead page using Internet archiving services
// The original idea is taken from here: https://gist.github.com/71580

// (C) 2011 g/christensen (gchristnsn@gmail.com)

(function() {

    var resurrect_commandIcon = "res/resurrect.gif";

    var resurrect_archiveServices =
        {
            "wayback machine latest": ["web.archive.org", "http://web.archive.org/web/"]
            , "wayback machine list": ["web.archive.org", "http://web.archive.org/web/*/"]
            , "google cache": ["google.com", "http://www.google.com/search?q=cache:"]
            , "google cache text only": ["google.com", "http://www.google.com/search?strip=1&q=cache:"]
            , "coralcdn": ["coralcdn.org", function (loc) {
                return loc.split(/\/+/g)[loc.indexOf("://") > 0 ? 1 : 0] + ".nyud.net";
            }]
            , "webcite": ["webcitation.org", "http://webcitation.org/query.php?url="]
        };


    function get_target(input) {
        var params = {};

        if (input.object.text) // Typed-in target or selected URL
        {
            params.location = input.object.text;
        }
        else {
            /* var html = CmdUtils.getHtmlSelection();

             if (html) // Check for a HTML link in the selection
             {
                 var a = jQuery(html).find("a:first").get(0);
                 if (a)
                     params.location = a.href;
             }

             if (CmdUtils.getLocation()) // There is no link
             {
                 var text = CmdUtils.getSelection(); // Try plain text selection

                 if (text)
                 {
                     params.location = text;
                 }
                 else
                 {
                     var doc = CmdUtils.getDocument();
                     if (doc.title)
                     {
                         // Won't be accurate if 404ed, though
                         params.name = doc.title + " (" + doc.location.hostname + ")";
                     }
                     else
                     {
                         params.name = "this page";
                     }

                     params.location = doc.location.href;
                 }
             }*/

            params.location = CmdUtils.getLocation();
        }

        if (!params.name)
            params.name = params.location;

        return params;
    }

    CmdUtils.CreateCommand(
        {
            names: ["resurrect"],
            /*---------------------------------------------------------------------------*/
            arguments: [{role: "object", nountype: noun_arb_text, label: "URL"},
                {
                    role: "instrument", nountype: jQuery.map(resurrect_archiveServices,
                        function (v, k) {
                            return k
                        }),
                    label: "archiving service"
                }],
            /*---------------------------------------------------------------------------*/
            description: "Try to resurrect a dead page using Internet archiving services",
            /*---------------------------------------------------------------------------*/
            help: "Type <b>resurrect</b> to resurrect a selection or a current page, "
            + "type <b>resurrect URL</b> to resurrect the specified URL.<br/>"
            + "You can specify Internet archiving service after the <b>with</b> "
            + "word, for example:<br/><br/>"
            + " <b>resurrect</b> en.beijing2008.cn <b>with</b> wayback machine list<br/><br/>"
            + "Supported archiving services are:<br/>"
            + " wayback machine latest<br/>"
            + " wayback machine list<br/>"
            + " google cache<br/>"
            + " google cache text only<br/>"
            + " coralcdn<br/>"
            + " webcite",
            /*---------------------------------------------------------------------------*/
            icon: resurrect_commandIcon,
            /*---------------------------------------------------------------------------*/
            author: {name: "G. Christensen", email: "gchristnsn@gmail.com"},
            /*---------------------------------------------------------------------------*/
            builtIn: true, _namespace: "Search",
            /*---------------------------------------------------------------------------*/
            license: "GPL",
            /*---------------------------------------------------------------------------*/
            preview: function (pblock, input) {
                var target = get_target(input);
                var instrument = input.instrument? input.instrument.summary: "";

                if (instrument === "")
                    instrument = (function () {
                        for (first in resurrect_archiveServices)
                            break;
                        return first;
                    })();

                var service = resurrect_archiveServices[instrument][0];

                pblock.innerHTML = _("Opens the most recent archived version of <b>"
                    + target.name + "</b> using the <a href=\"http://"
                    + service + "\">" + service + "</a>");
            },
            /*---------------------------------------------------------------------------*/
            execute: function (input) {
                var target = get_target(input);
                var instrument = input.instrument? input.instrument.summary: "";

                if (instrument == "")
                    instrument = (function () {
                        for (first in resurrect_archiveServices)
                            break;
                        return first;
                    })();

                var handler = resurrect_archiveServices[instrument][1];

                if (typeof handler === "string") {
                    Utils.openUrlInBrowser(handler + target.location);
                }
                else {
                    Utils.openUrlInBrowser(handler(target.location));
                }
            }
        });
})();