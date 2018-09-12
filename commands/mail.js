CmdUtils.CreateCommand({
    name: "email",
    uuid: "65947074-CF99-4114-827E-0FC7CB348CE1",
    arguments: [{role: "object",     nountype: noun_arb_text, label: "subject"},
                {role: "goal",       nountype: noun_type_stored_email, label: "contact"},
              //{role: "instrument", nountype: ["gmail"], label: "mail service",  default: "gmail"},
                {role: "source",     nountype: noun_type_number, label: "user", default: 0},
    ],
    description: "Compose a email.",
    help: "This text is displayed at the command list page.",
    timeout: 0,
    builtIn: true,
    _namespace: "Mail",
    author: "g/christensen",
    icon: "res/email.png",
    preview: function(pblock, args, {Bin}) {

    },
    execute: function(args, {Bin}) {
        let gmail = "https://mail.google.com/mail/u/"
        let gmail_compose = "?ui=2&view=cm";

        let user = args.source && args.source.text? args.source.text: "0";

        let url = gmail + user + "/" + gmail_compose;

        if (args.object.text)
            url += "&su=" + encodeURIComponent(args.object.text);

        if (args.goal && args.goal.text) {
            url += "&to=" + encodeURIComponent(args.goal.text);
            Utils.makeBin(__STORED_EMAIL_UUID, bin => {
                let contacts = bin.contacts();
                if (!contacts)
                    contacts = [];

                if (!contacts.find(c => c.toLowerCase() === args.goal.text.toLowerCase())) {
                    contacts.push(args.goal.text);
                    bin.contacts(contacts);
                }
            });
        }

        // &body=...

        CmdUtils.addTab(url);
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "forget-email",
    uuid: "C1B5C976-2BBE-4DD6-95E9-A65CC84E1B51",
    arguments: [{role: "object", nountype: noun_type_stored_email, label: "email"}],
    description: "Do not show the specified email in suggestions anymore.",
    timeout: 0,
    builtIn: true,
    _namespace: "Mail",
    author: "g/christensen",
    icon: "res/forget-email.png",
    preview: function(pblock, args, {Bin}) {

    },
    execute: function(args, {Bin}) {
        if (args.object.text)
            Utils.makeBin(__STORED_EMAIL_UUID, bin => {
                let contacts = bin.contacts();
                if (!contacts)
                    contacts = [];

                    let em;
                    if (em = contacts.find(c => {return c.toLowerCase() === args.object.text.toLowerCase()})) {
                        contacts.splice(contacts.indexOf(em), 1);
                        bin.contacts(contacts);
                    }
            });
        CmdUtils.closePopup();
    }
});

CmdUtils.CreateCommand({
    name: "forget-emails",
    uuid: "8CF164B7-1505-47BE-8DDD-7D1E3781ABF1",
    arguments: [{role: "object", nountype: noun_arb_text, label: "pattern"}],
    description: "Forget multiple emails at once.",
    help: `Syntax: <i><u>forget-emails</u></i> <b>pattern</b><br>
           Arguments:<br>
           - <b>pattern</b>: <b>all</b> or a string/regular expression.`,
    timeout: 0,
    builtIn: true,
    _namespace: "Mail",
    author: "g/christensen",
    icon: "res/forget-email.png",
    preview: function(pblock, args, {Bin}) {

    },
    execute: function(args, {Bin}) {
        if (args.object.text) {
            Utils.makeBin(__STORED_EMAIL_UUID, bin => {
                let contacts = bin.contacts();
                if (!contacts)
                    contacts = [];

                if (args.object.text.toLowerCase() === "all")
                    bin.contacts([]);
                else {
                    let matcher = RegExp(args.object.text, "i");
                    bin.contacts(contacts.filter(c => !c.match(matcher)));
                }
            });
        }
        CmdUtils.closePopup();
    }
});