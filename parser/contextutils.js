// Stub for ContextUtils

ContextUtils = {};

ContextUtils.getSelectionObject = function (context) {
    return {text: CmdUtils.selectedText, html: CmdUtils.selectedHtml, fake: false};
};