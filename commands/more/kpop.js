CmdUtils.makeSearchCommand({
    name: "kpop",
    uuid: "479E0CB6-981C-4485-AA7B-8296AB383EA7",
    url: "https://www.googleapis.com/customsearch/v1element?key=AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY"
       + "&cx=013709182478043431485:iamdx1ify4g&cse_tok=AF14hlgimVAieQABelm8yjQbfRimbYETvg:1537370729195"
       + "&q=%s",
    defaultUrl: "https://www.miusiq.net",
    arguments: [{role: "object", nountype: noun_arb_text, label: "query"}],
    description: "Search for K-Pop releases.",
    icon: "/commands/more/whiskas.png",
    builtIn: true,
    _hidden: true,
    _namespace: "More Commands",
    previewDelay: 1000,
    parser: {
        type: "json",
        container  : "results", // result item container
        title      : "title", // result item title
        href       : "unescapedUrl",
        thumbnail  : "richSnippet.cseThumbnail.src", // result item thumbnail
        body       : "content", // result item summary
        maxResults : 10
    }
});
