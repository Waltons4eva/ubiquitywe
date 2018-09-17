const UBIQUITY_SETTINGS = "ubiquity-settings";

var scriptNamespace = window.location.search? decodeURI(window.location.search.substring(1)): "default";

// inserts stub (example command)
function insertExampleStub() {

    if (scriptNamespace === UBIQUITY_SETTINGS)
        return;

    var stubs = {
        'insertsimplecommandstub':
            `CmdUtils.CreateCommand({
    name: "my-simple-command",
    uuid: "%%UUID%%",
    arguments: [{role: "object", nountype: noun_arb_text, label: "text"}],
    description: "A short description of your command.",
    author: "Your Name",
    preview: function(pblock, {object: {text}}) {
        pblock.innerHTML = "Your input is " + text + ".";
    },
    execute: function({object: {text}}) {
        CmdUtils.notify("Your input is: " + text);
    }
});`,

  'insertcommandstub':
`CmdUtils.CreateCommand({
    name: "my-command",
    uuid: "%%UUID%%",
    arguments: [{role: "object",     nountype: noun_arb_text, label: "text"},
              //{role: "goal",       nountype: noun_arb_text, label: "text"}, // to
              //{role: "source",     nountype: noun_arb_text, label: "text"}, // from
              //{role: "location",   nountype: noun_arb_text, label: "text"}, // near
              //{role: "time",       nountype: noun_arb_text, label: "text"}, // at
              //{role: "instrument", nountype: noun_arb_text, label: "text"}, // with
              //{role: "format",     nountype: noun_arb_text, label: "text"}, // in
              //{role: "modifier",   nountype: noun_arb_text, label: "text"}, // of
              //{role: "alias",      nountype: noun_arb_text, label: "text"}, // as
    ],
    description: "A short description of your command.",
    help: "This text is displayed at the command list page.",
    author: "Your Name",
    icon: "http://example.com/favicon.png",
    previewDelay: 1000,
    //init: function({Bin}) {},
    //popup: function(doc /* popup document */, {Bin}) {},
    preview: function(pblock, args, {Bin}) {
    
        if (/^https?:\\/\\/.*/.test(args.object.text))  
            CmdUtils.previewAjax(pblock, {
                url: args.object.text,
                dataType: "html",
                success: function(data) {
                    if (data) {
                        let html = data.substring(0, 500); 
                        pblock.innerHTML = "Request response: <br>" + Utils.escapeHtml(html) + "...";
                    }
                    else
                        pblock.innerHTML = "Response is empty.";
                },
                error: function() {
                    pblock.innerHTML = "HTTP request error.";
                }
            });  
        else
            pblock.innerHTML = "Invalid URL.";
            
    },
    execute: function(args, {Bin}) {
        CmdUtils.notify("Your input is: " + args.object.text);
    }
});`,

        'insertsearchstub': // simple search / preview command (e. g. using ajax)
`CmdUtils.makeSearchCommand({
    name: "my-search-command",
    uuid: "%%UUID%%",
    url: "http://www.example.com/find?q=%s",
    defaultUrl: "http://www.example.com",
    arguments: [{role: "object", nountype: noun_arb_text, label: "query"}],
    icon: "/res/icons/icon-24.png",
    previewDelay: 1000,
    parser: {      // see UbiquityWE API Reference for more details
        type       : "html", // result type (also: "json", "xml")
        container  : ".css > .selector", // result item container
        title      : ".css > .selector", // result item title
        href       : ".css > .selector", // result item link
        thumbnail  : ".css > .selector", // result item thumbnail
      //body       : ".css > .selector", // result item summary
        maxResults : 10,
    }
});

`
    };

    var stub = stubs[this.id];
    //editor.replaceRange(stub, editor.getCursor());
    editor.session.insert(editor.getCursorPosition(), stub.replace("%%UUID%%", UUID.generate()));

    //editor.setValue( stub + editor.getValue() );
    saveScripts();
    editor.focus();
    return false;
}

// evaluates and saves scripts from editor
function saveScripts() {
    var customscripts = editor.getSession().getValue();

    if (scriptNamespace === UBIQUITY_SETTINGS) {
        let settings;
        try {
            settings = JSON.parse(customscripts)
        }
        catch (e) {
            console.log(e);
            return;
        }

        if (settings)
            chrome.storage.local.set(settings);
        else
            chrome.storage.local.clear();
    }
    else {
        // save
        if (typeof chrome !== 'undefined' && chrome.storage) {
            Utils.getCustomScripts(all_scripts => {
                all_scripts[scriptNamespace] = {scripts: customscripts};
                Utils.setPref("customscripts", all_scripts);
            });
        }

        // eval
        try {
            $("#info").html("Evaluated!");
            eval(customscripts);
        } catch (e) {
            $("#info").html("<span style='background-color: red; color: white;'>&nbsp;" + e.message + "&nbsp;</span>");
        }
        CmdUtils.loadCustomScripts();
    }

    // download link
    var a = document.getElementById("download");
    var file = new Blob([customscripts], {type: "application/javascript"});
    a.href = URL.createObjectURL(file);
    a.download = scriptNamespace + (scriptNamespace === UBIQUITY_SETTINGS? ".json": ".js");
}

$(() => {

    editor = ace.edit("code");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

    // Utils.getPref("keyboardScheme", keyboardScheme => {
    //     if (keyboardScheme !== "ace")
    //         editor.setKeyboardHandler("ace/keyboard/" + keyboardScheme);
    // });

    editor.setPrintMarginColumn(120);

    editor.on("blur", saveScripts);
    editor.on("change", saveScripts);

    $(window).on('resize', e => {
       editor.container.style.height = $(window).innerHeight() - $("#header").height() - $("#footer").height() - 16;
       console.log(editor.container.style.height);
       editor.resize();
    });
    $(window).resize();

    function editNamespaceScripts(all_scripts, namespace) {
        let namespace_scripts = all_scripts[namespace];
        if (namespace_scripts)
            editor.setValue(namespace_scripts.scripts || "", -1);
        else
            editor.setValue("");
    }

    $("#script-namespaces").change(() => {
        saveScripts();
        Utils.getCustomScripts(all_scripts => {
            scriptNamespace = $("#script-namespaces").val();
            editNamespaceScripts(all_scripts, scriptNamespace);
        });
    });

    $("#upload").click((e) => {
        $("#file-picker").click();
    });

    $("#file-picker").change((e) => {
       if (e.target.files.length > 0) {
           let reader = new FileReader();
           reader.onload = function(e) {
               editor.getSession().setValue(e.target.result);
           };
           reader.readAsText(e.target.files[0]);
       }
    });

    $("#create-namespace").click(() => {
        if (scriptNamespace === UBIQUITY_SETTINGS)
            return;

        let name = prompt("Create category: ");
        if (name) {

            Utils.getCustomScripts(all_scripts => {
                ADD_NAME: {
                    saveScripts();

                    for (let n in all_scripts) {
                        if (n.toLowerCase() == name.toLowerCase()) {
                            scriptNamespace = n;
                            $("#script-namespaces").val(n);
                            editNamespaceScripts(all_scripts, scriptNamespace)
                            break ADD_NAME;
                        }
                    }

                    editor.getSession().setValue("");

                    scriptNamespace = name;
                    $("#script-namespaces").append($("<option></option>")
                        .attr("value", name)
                        .text(name))
                        .val(name);


                }
            });
        }
    });

    $("#delete-namespace").click(() => {
        if (scriptNamespace !== "default" && scriptNamespace !== UBIQUITY_SETTINGS)
            if (confirm("Do you really want to delete \"" + scriptNamespace + "\"?")) {
                Utils.getCustomScripts(all_scripts => {
                    delete all_scripts[scriptNamespace];
                    Utils.setPref("customscripts", all_scripts);
                    $('option:selected', $("#script-namespaces")).remove();

                    scriptNamespace = $("#script-namespaces").val();
                    editNamespaceScripts(all_scripts, scriptNamespace);
                });
            }
    });

    $("#expand-editor").click(() => {
        if ($("#expand-editor img").prop("src").endsWith("/res/icons/collapse.png")) {
            console.log("nyaa");
            $("#panel").css("width", "870px");
            $("body").css("margin", "auto");
            $("body").css("max-width", "900px");
            $("#toolbar").css("padding-right", "30px");
            $(".head, #nav-container, #head-br").show();
            $("#expand-editor img").prop("src", "/res/icons/expand.png");
        }
        else {
            $(".head, #nav-container, #head-br").hide();
            $("#panel").css("width", "100%");
            $("body").css("margin", "0");
            $("body").css("max-width", "100%");
            $("#toolbar").css("padding-right", "5px");
            $("#expand-editor img").prop("src", "/res/icons/collapse.png");
        }
        window.dispatchEvent(new Event('resize'));
        editor.focus();
    });

    $("#insertsimplecommandstub").click(insertExampleStub);
    $("#insertcommandstub").click(insertExampleStub);
    $("#insertsearchstub").click(insertExampleStub);

    // load scrtips
    if (typeof chrome !== 'undefined' && chrome.storage) {
        if (scriptNamespace === UBIQUITY_SETTINGS)
            chrome.storage.local.get(undefined, function (result) {
                $("#script-namespaces").prop("disabled", "disabled");
                if (result) {
                    editor.getSession().setValue(JSON.stringify(result, null, 2), -1);
                }
            });
        else
            Utils.getCustomScripts(all_scripts => {
                var sorted = Object.keys(all_scripts).sort(function (a, b) {
                    if (a.toLocaleLowerCase() < b.toLocaleLowerCase())
                        return -1;
                    if (a.toLocaleLowerCase() > b.toLocaleLowerCase())
                        return 1;
                    return 0;
                });
                for (let n of sorted)
                    if (n !== "default")
                        $("#script-namespaces").append($("<option></option>")
                            .attr("value", n)
                            .text(n));
                $("#script-namespaces").val(scriptNamespace);

                editNamespaceScripts(all_scripts, scriptNamespace);
                saveScripts();
            });
    }

    editor.focus();
});