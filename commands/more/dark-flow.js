CmdUtils.CreateCommand({
    name: "dark flow",
    argument: [{role: "object", nountype: noun_arb_text, label: "URL"}],
    description: "Follow the URL in Dark Flow.",
    homepage: "https://github.com/GChristensen/dark-flow#readme",
    icon: "commands/more/dark-flow.png",
    builtIn: true,
    _hidden: true,
    _namespace: "More Commands",
    execute: function execute({object: {text}}) {
        chrome.runtime.sendMessage("dark-flow@firefox", {message: "dark-flow:follow-url", url: text}, null);
        CmdUtils.closePopup();
    },
    preview: "Follow the URL in Dark Flow"
});