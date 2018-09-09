console.log("UbiquityWE v"+CmdUtils.VERSION+" background script says hello");


CmdUtils.getPref("customscripts", customscripts => {
    if (!customscripts)
        CmdUtils.setPref("customscripts", {}, () => CmdUtils.loadCustomScripts());;
});

CmdUtils.getPref("debugMode", debugMode => {
    CmdUtils.DEBUG = !!debugMode;
    CmdUtils.CommandList = CmdUtils.CommandList.filter(cmd => CmdUtils.DEBUG || !cmd._hidden);
    CmdUtils.getPref("disabledCommands", disabledCommands => {
        if (disabledCommands)
            for (let cmd of CmdUtils.CommandList) {
                if (cmd.name in disabledCommands)
                    cmd.disabled = true;
            }
    });
});


CmdUtils.getPref("parserLanguage", parserLanguage => CmdUtils.parserLanguage = parserLanguage || "en");
CmdUtils.getPref("parserLanguage", parserLanguage => CmdUtils.parserLanguage = parserLanguage || "en");
CmdUtils.getPref("maxSuggestions", maxSuggestions=> CmdUtils.maxSuggestions = maxSuggestions || 5);

CmdUtils.getPref("lingvoApiKey", lingvoApiKey => {
    if (!lingvoApiKey) {
        CmdUtils.lingvoApiKey = "NGNmNTVlNzUtNzg2MS00ZWE1LWIzNWItNjNlMTAyZTM5YmRlOmM3NTg3MDY2Y2MyMDQxY2E4NTQ0MDZhOTQyYTcxMTk2";
        CmdUtils.setPref("lingvoApiKey", CmdUtils.lingvoApiKey)
    }
    else {
        CmdUtils.lingvoApiKey = lingvoApiKey;
    }
});


// setup selection event sink
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (CmdUtils.DEBUG) {
        //console.log("got message: ", request.message, request.data, request.event );
        //CmdUtils.notify(request.data, request.message+" / "+request.event );
    }
    switch(request.message)
    {
        case 'selection':
            CmdUtils.selectedText = request.data.text || "";
            CmdUtils.selectedHtml = request.data.html || "";
        break;

        default:
            sendResponse({data: 'Invalid arguments'});
        break;
    }
});

chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
    if (CmdUtils.DEBUG) if (tab) console.log("onUpdated", tab.url);  
    CmdUtils.updateActiveTab();  
});

chrome.tabs.onActivated.addListener(function(actInfo) {
    if (CmdUtils.DEBUG) console.log("onActivated", actInfo);
    CmdUtils.updateActiveTab();  
});

chrome.tabs.onHighlighted.addListener( function(higInfo) {
    if (CmdUtils.DEBUG) console.log("onHighlighted", higInfo);  
    CmdUtils.updateActiveTab();  
});

chrome.browserAction.onClicked.addListener(function(tab) {
   console.log('test');
});
