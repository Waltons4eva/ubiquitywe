// this will send message to background and set CmdUtils.selectedText
function __ubiq_get_sel() {
    var sel = window.getSelection();
    var cc = sel.getRangeAt(0).cloneContents();
    var div = document.createElement('div');
    div.appendChild(cc);
    return {text: sel.toString(), html: div.innerHTML};
}

var __ubiq_send_sel = function(event) {
    if (chrome && chrome.runtime) chrome.runtime.sendMessage({
        message:"selection",
        data: __ubiq_get_sel(),
        event: event.type
    },function(response){});
};

// document.addEventListener('selectionchange', __ubiq_send_sel); // works in chrome
