CmdUtils.makeSearchCommand({
    name: "kpop",
    uuid: "479E0CB6-981C-4485-AA7B-8296AB383EA7",
    url: "https://www.googleapis.com/customsearch/v1element?key=AIzaSyCVAXiUzRYsML1Pv6RwSG1gunmMikTzQqY"
    + "&rsz=filtered_cse&num=10&hl=en&prettyPrint=false&source=gcsc&gss=.com&sig=1ca94331d67f5f17586b15e6157d4d31"
    + "&cx=013709182478043431485:iamdx1ify4g&q=loona&cse_tok=AF14hlhii0RJwBEB-GnPaSVyHgGxl4TduQ:1537186860244"
    + "&oq=%s",
    defaultUrl: "https://www.miusiq.net",
    arguments: [{role: "object", nountype: noun_arb_text, label: "query"}],
    description: "Search for K-Pop releases",
    icon: "/commands/more/kpop.png",
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
