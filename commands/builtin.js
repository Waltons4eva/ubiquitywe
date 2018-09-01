// BuildIn CmdUtils command definitions
// jshint esversion: 6 

CmdUtils.CreateCommand({
    name: "change-ubiquity-settings",
    icon: "res/icon-24.png",
    builtIn: true,
    _namespace: "Ubiquity", // do not set this field in custom commands
    description: "Takes you to the Ubiquity command <a href=options.html target=_blank>settings page</a>.",
    execute: function () {
        CmdUtils.addTab("options.html");
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    names: ["list-ubiquity-commands", "command-list", "help"],
    description: "Opens Ubiquity command list page",
    icon: "res/icon-24.png",
    _namespace: "Ubiquity",
    builtIn: true,
    preview: "Lists all available commands",
    execute: CmdUtils.SimpleUrlBasedCommand("commands.html")
});

CmdUtils.CreateCommand({
    names: ["edit-ubiquity-commands", "hack-ubiquity"],
    icon: "res/icon-24.png",
    _namespace: "Ubiquity",
    builtIn: true,
    description: "Takes you to the Ubiquity command <a href=edit.html target=_blank>editor page</a>.",
    execute: function () {
        CmdUtils.addTab("edit.html");
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    names: ["reload-ubiquity"],
    _namespace: "Ubiquity",
    description: "Reloads Ubiquity extension",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "reloads Ubiquity extension",
    execute: ()=>{
        chrome.runtime.reload();
    }
});

CmdUtils.CreateCommand({
    names: ["debug-popup"],
    description: "Open popup in window",
    _namespace: "Ubiquity",
    _hidden: true,
    builtIn: true,
    icon: "res/icon-24.png",
    preview: "lists all avaiable commands",
    execute: CmdUtils.SimpleUrlBasedCommand("popup.html")
});

CmdUtils.CreateCommand({
    name: "replace-selection",
    _namespace: "Browser",
    description: "replaces current selection with entered text",
    icon: "res/icon-24.png",
    builtIn: true,
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(text);
        CmdUtils.closePopup();
    },
    preview: "replace selected text with args",
});

CmdUtils.CreateCommand({
    name: "new-tab",
    _namespace: "Browser",
    description: "Open a new tab (or window) with the specified URL",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "Open a new tab (or window) with the specified URL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function ({object: {text}}) {
        if (!text.match('^https?://')) text = "http://"+text;
        CmdUtils.addTab(text);
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "close",
    _namespace: "Browser",
    description: "Close the current tab",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "Close the current tab",
    execute: function (directObj) {
        CmdUtils.closeTab();
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "print",
    _namespace: "Browser",
    description: "Print the current page",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "Print the current page",
    execute: function (directObj) {
        chrome.tabs.executeScript( { code:"window.print();" } );
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "invert",
    _namespace: "Browser",
    description: "Inverts all colors on current page. Based on <a target=_blank href=https://stackoverflow.com/questions/4766201/javascript-invert-color-on-all-elements-of-a-page>this</a>.",
    builtIn: true,
    icon: "res/icon-24.png",
    execute: function execute(){
        chrome.tabs.executeScript({code:`
        javascript: (
            function () { 
            // the css we are going to inject
            var css = 'html {-webkit-filter: invert(100%);' +
                '-moz-filter: invert(100%);' + 
                '-o-filter: invert(100%);' + 
                '-ms-filter: invert(100%); }',
            
            head = document.getElementsByTagName('head')[0],
            style = document.createElement('style');
            
            // a hack, so you can "invert back" clicking the bookmarklet again
            if (!window.counter) { window.counter = 1;} else  { window.counter ++;
            if (window.counter % 2 == 0) { var css ='html {-webkit-filter: invert(0%); -moz-filter:    invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }'}
             };
            
            style.type = 'text/css';
            if (style.styleSheet){
            style.styleSheet.cssText = css;
            } else {
            style.appendChild(document.createTextNode(css));
            }
            
            //injecting the css to the head
            head.appendChild(style);

            function invert(rgb) {
                rgb = Array.prototype.join.call(arguments).match(/(-?[0-9\.]+)/g);
                for (var i = 0; i < rgb.length; i++) {
                  rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
                }
                return rgb;
            }

            document.body.style.backgroundColor = "rgb("+invert(window.getComputedStyle(document.body, null).getPropertyValue('background-color')).join(",")+")";
            }());
        `})
    },
});

CmdUtils.CreateCommand({
    names: ["base64decode","b64d","atob"],
    _namespace: "Utility",
    description: "base64decode",
    icon: "res/icon-24.png",
    builtIn: true,
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(atob(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = atob(text);
    },
});

CmdUtils.CreateCommand({
    names: ["base64encode","b64e", "btoa"],
    _namespace: "Utility",
    description: "base64encode",
    builtIn: true,
    icon: "res/icon-24.png",
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(btoa(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = btoa(text);
    },
});

CmdUtils.CreateCommand({
    names: ["urldecode"],
    _namespace: "Utility",
    description: "urldecode",
    icon: "res/icon-24.png",
    builtIn: true,
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(decodeURI(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = decodeURI(text);
    },
});

CmdUtils.CreateCommand({
    names: ["urlencode"],
    _namespace: "Utility",
    description: "urlencode",
    icon: "res/icon-24.png",
    builtIn: true,
    author: {
        name: "rostok",
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    execute: function execute({object: {text}}) {
        CmdUtils.setSelection(encodeURI(text));
    },
    preview: function preview(pblock, {object: {text}}) {
        pblock.innerHTML = encodeURI(text);
    },
});

CmdUtils.CreateCommand({
    name: "calc",
    _namespace: "Utility",
    description: desc = "Evals math expressions",
    icon: "https://png.icons8.com/metro/50/000000/calculator.png",
    builtIn: true,
    require: "https://cdnjs.cloudflare.com/ajax/libs/mathjs/3.20.1/math.min.js",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    preview: pr = function preview(previewBlock, {object: {text}}) {
        if (text.trim()!='') {
            var m = new math.parser();
            text = text.replace(/,/g,".");
            text = text.replace(/ /g,"");
            previewBlock.innerHTML = m.eval(text);
            //CmdUtils.ajaxGet("http://api.mathjs.org/v1/?expr="+encodeURIComponent(args.text), (r)=>{ previewBlock.innerHTML = r; });
        }
        else
            previewBlock.innerHTML = desc;
    },
    execute: function ({object: {text}}) {
        if (text.trim()!='') {
            var m = new math.parser();
            text = text.replace(",",".");
            text = text.replace(" ","");
            text = m.eval(text);
            CmdUtils.setSelection(text);
        }
    }
});

var bitly_api_user = "ubiquityopera";
var bitly_api_key = "R_59da9e09c96797371d258f102a690eab";
CmdUtils.CreateCommand({
    names: ["shorten-url", "bitly"],
    _namespace: "Utility",
    icon: "https://dl6fh5ptkejqa.cloudfront.net/0482a3c938673192a591f2845b9eb275.png",
    builtIn: true,
    description: "Shorten your URLs with the least possible keystrokes",
    homepage: "http://bit.ly",
    author: {
        name: "Cosimo Streppone",
        email: "cosimo@cpan.org"
    },
    license: "GPL",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    preview: async function (pblock, {object: {text}}) {
        var words = text.split(' ');
        var host = words[1];
        pblock.innerHTML = "Shortens an URL (or the current tab) with bit.ly";
    },
    execute: async function (directObject) {
        var url = "http://api.bit.ly/shorten?version=2.0.1&longUrl={QUERY}&login=" +
            bitly_api_user + "&apiKey=" + bitly_api_key;
        var query = directObject.text;
        // Get the url from current open tab if none specified
        if (!query || query == "") query = CmdUtils.getLocation();
        var urlString = url.replace("{QUERY}", query);

        var url = "http://api.bit.ly/shorten?version=2.0.1&longUrl={QUERY}&login=" + bitly_api_user + "&apiKey=" + bitly_api_key;
        // Get the url from current open tab if none specified
        var ajax = await CmdUtils.get(urlString);
        //ajax = JSON.parse(ajax);
        //if (!ajax) return;
        var err_code = ajax.errorCode;
        var err_msg = ajax.errorMessage;
        // Received an error from bit.ly API?
        if (err_code > 0 || err_msg) {
            CmdUtils.setPreview('<br/><p style="font-size: 18px; color:orange">' + 'Bit.ly API error ' + err_code + ': ' + err_msg + '</p>');
            return;
        }

        var short_url = ajax.results[query].shortUrl;
        CmdUtils.setPreview('<br/><p style="font-size: 24px; font-weight: bold; color: #ddf">' +
            '<a target=_blank href="' + short_url + '">' + short_url + '</a>' +
            '</p>');
        CmdUtils.setClipboard(short_url);
    }
});

CmdUtils.CreateCommand({
    names: ["google"],
    _namespace: "Search",
    description: "Search on Google for the given words",
    icon: "http://www.google.com/favicon.ico",
    builtIn: true,
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    preview: async function define_preview(pblock, {object: {text}}) {
        text = text.trim();
        pblock.innerHTML = "Search on Google for " + text;
        if (text!="") {
            var doc = await CmdUtils.get("https://www.google.com/search?q="+encodeURIComponent(text) );
            doc = jQuery("div#rso", doc)
            .find("a").each(function() { $(this).attr("target", "_blank")}).end()
            .find("cite").remove().end()
            .find(".action-menu").remove().end()
            .html();
            pblock.innerHTML = doc;
        }
    },
    execute: CmdUtils.SimpleUrlBasedCommand(
        "http://www.google.com/search?q={text}&ie=utf-8&oe=utf-8"
    )
});

CmdUtils.CreateCommand({
    name: "maps",
    _namespace: "Search",
    description: "Shows a location on the map",
    icon: "http://www.google.com/favicon.ico",
    builtIn: true,
    timeout: 500,
    requirePopup: "https://maps.googleapis.com/maps/api/js?sensor=false",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    preview: async function mapsPreview(previewBlock, args) {
        var GM = CmdUtils.popupWindow.google.maps;
        
        // http://jsfiddle.net/user2314737/u9no8te4/
        var text = args.object.text.trim();
        if (text=="") {
            previewBlock.innerHTML = "show objects or routes on google maps.<p>syntax: <pre>\tmaps [place] [-l]\n\tmaps [start] to [finish] [-l]\n\n -l narrow search to your location</pre>"; 
            return;
        }
        cc = "";
        if (text.substr(-2)=="-l") {
	        var geoIP = await CmdUtils.get("http://freegeoip.net/json/"); // search locally
    	    var cc = geoIP.country_code || "";
        	cc = cc.toLowerCase();
        	text = text.slice(0,-2);
        }
        from = text.split(' to ')[0];
        dest = text.split(' to ').slice(1).join();
        var A = await CmdUtils.get("https://nominatim.openstreetmap.org/search.php?q="+encodeURIComponent(from)+"&polygon_geojson=1&viewbox=&format=json&countrycodes="+cc);
        if (!A[0]) return;
        CmdUtils.deblog("A",A[0]);
        previewBlock.innerHTML = '<div id="map-canvas" style="width:540px;height:505px"></div>';

    	var pointA = new GM.LatLng(A[0].lat, A[0].lon);
        var myOptions = {
            zoom: 10,
            center: pointA
        };
        var map = new GM.Map(previewBlock.ownerDocument.getElementById('map-canvas'), myOptions);
        var markerA = new GM.Marker({
            position: pointA,
            title: from,
            label: "A",
            map: map
        });

        map.data.addGeoJson(geoJson = {"type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": A[0].geojson, "properties": {} }]});
        if (dest.trim()!='') {
            var B = await CmdUtils.get("https://nominatim.openstreetmap.org/search.php?q="+encodeURIComponent(dest)+"&polygon_geojson=1&viewbox=&format=json");
            if (!B[0]) { 
                map.fitBounds( new GM.LatLngBounds( new GM.LatLng(A[0].boundingbox[0],A[0].boundingbox[2]), new GM.LatLng(A[0].boundingbox[1],A[0].boundingbox[3]) ) );
                map.setZoom(map.getZoom()-1);
                return;
            }
            CmdUtils.deblog("B", B[0]);
            var pointB = new GM.LatLng(B[0].lat, B[0].lon);
            // Instantiate a directions service.
            directionsService = new GM.DirectionsService();
            directionsDisplay = new GM.DirectionsRenderer({
                map: map
            });
            this.markerB = new GM.Marker({
                position: pointB,
                title: dest,
                label: "B",
                map: map
            });

            // get route from A to B
            directionsService.route({
                origin: pointA,
                destination: pointB,
                avoidTolls: true,
                avoidHighways: false,
                travelMode: GM.TravelMode.DRIVING
            }, function (response, status) {
                if (status == GM.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
    },
    execute: function({object: {text}}) {
        if (text.substr(-2)=="-l") text = text.slice(0,-2);
        CmdUtils.addTab("http://maps.google.com/maps?q="+encodeURIComponent(text));
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "wikipedia",
    _namespace: "Search",
    description: "Search Wikipedia for the given words",
    icon: "http://en.wikipedia.org/favicon.ico",
    builtIn: true,
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    preview: function wikipedia_preview(previewBlock, args) {
        var args_format_html = "English";
        var searchText = args.object.text.trim();
        if (!searchText) {
            previewBlock.innerHTML = "Searches Wikipedia in " + args_format_html + ".";
            return;
        }
        previewBlock.innerHTML = "Searching Wikipedia for <b>" + args.object.text + "</b> ...";

        function onerror() {
            previewBlock.innerHTML =
                "<p class='error'>" + "Error searching Wikipedia" + "</p>";
        }

        var langCode = "en";
        var apiUrl = "http://" + langCode + ".wikipedia.org/w/api.php";

        CmdUtils.ajaxGetJSON("https://" + langCode + ".wikipedia.org/w/api.php?action=query&list=search&srsearch="+searchText+"&srlimit=5&format=json", function (resp) {
            function generateWikipediaLink(title) {
                return "http://" + langCode + ".wikipedia.org/wiki/" +title.replace(/ /g, "_");
            }
            function wikiAnchor(title) {
                return "<a target=_blank href='"+generateWikipediaLink(title)+"'>"+title+"</a>";
            }
            previewBlock.innerHTML = "";
            for (var i = 0; i < resp.query.search.length; i++) {
                previewBlock.innerHTML += "<p>"+wikiAnchor(resp.query.search[i].title) + "<br>"+resp.query.search[i].snippet+"</p>";
            }
        });
    },
    execute: CmdUtils.SimpleUrlBasedCommand("http://en.wikipedia.org/wiki/Special:Search?search={text}")
});