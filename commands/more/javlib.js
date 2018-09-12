{
    let retry_ctr = 0;

    function fix_href(a, return_url) {
        if (a) {
            let tail = a.href.split("/");
            tail = tail[tail.length - 1];
            a.href = "http://www.javlibrary.com/en/" + tail;

            return return_url ? a.href : a.outerHTML;
        }
        return "";
    }

    function get_data(pblock, data, xhr) {

        let page = jQuery(data);
        let html = "";

        let img = page.find("#video_jacket_img").get(0);
        if (img && img.src) {
            let rect = pblock.getBoundingClientRect();
            html += `<img id='javlib-cover' width='${rect.width - 20}' src='${img.src.replace("moz-extension:", "http:")}'/>`;

            let info = page.find("#video_info");

            if (info) {
                let movie_id = info.find("#video_id .text").text();
                let release_date = info.find("#video_date .text").text();
                let video_length = info.find("#video_length .text").parent().text();
                let director = fix_href(info.find("#video_director .director a")[0]);
                let maker = fix_href(info.find("#video_maker .maker a")[0]);
                let label = fix_href(info.find("#video_label .label a")[0]);

                html += `<div><a href='${xhr.url}'>${movie_id}</a> | ${release_date} | ${video_length}${director ? "| By " + director : ""} | ${maker}/${label}</div>`;

                html += `<div style='padding-top: 5px'>Genres: `;
                info.find("#video_genres .genre a").map((_, g) => html += fix_href(g) + " ");
                html += `</div>`;

                html += `<div style='padding-top: 5px'>Cast: `;
                info.find("#video_cast .star a").map((_, s) => html += fix_href(s) + " ");
                html += `</div>`;
            }

            pblock.innerHTML = html;

            if (pblock.scrollHeight === pblock.clientHeight)
                jQuery(pblock).find("#javlib-cover").width(538);
        }
        else if (page.find(".videos .video").length > 0) {
            page.find(".videos .video > a > .id").map((_, id) => html += `<a href='${fix_href(id.parentNode, true)}'>${id.textContent}</a> `);
            pblock.innerHTML = html;
            jQuery(pblock).find("a").click((e) => {
                e.preventDefault();
                make_request(pblock, e.target.href);
            });
        }
        else {
            pblock.innerHTML = "Not found.";
        }
    }

    function make_request(pblock, url) {
        let options = {
            url: url,
            dataType: "html",
            success: function (data) {
                retry_ctr = 0;
                get_data(pblock, data, this);
            },
            statusCode: {
                503: function (xhr) {
                    pblock.innerHTML = "Waiting for Cloudflare... When stuck, try to clear the recent history.";
                    if (retry_ctr < 2) {
                        retry_ctr += 1;
                        chrome.tabs.create({active: false, url: "http://javlibrary.com/en"}, new_tab => {
                            let retries = 0;
                            function checkForTitle() {
                                chrome.tabs.executeScript(new_tab.id,
                                    {code: `___title = document.getElementsByTagName('title'); 
                                            ___title && ___title.length > 0? ___title[0].textContent: ''`},
                                    function (title) {
                                        if (title && title.length > 0 && title[0].toLowerCase().indexOf("javlibrary") >= 0) {
                                            chrome.tabs.remove(new_tab.id);
                                            retries = 100;
                                            CmdUtils.previewAjax(pblock, options);
                                        }
                                    });

                                if (retries < 12) {
                                    retries += 1;
                                    setTimeout(checkForTitle, 1000);
                                }
                            }

                            checkForTitle();
                        });
                    }
                    else
                        pblock.innerHTML = "Error.";
                }
            },
            error: function (xhr) {
                pblock.innerHTML = "Error.";
            }
        };

        CmdUtils.previewAjax(pblock, options);
    }

    CmdUtils.CreateCommand({
        name: "javlibrary",
        uuid: "2464CA49-78EF-425E-8A49-ED5F5EA121D0",
        argument: [{role: "object", nountype: noun_arb_text, label: "movie code"}],
        description: "Search for movie information at <a href='http://javlibrary.com/en'>javlibrary</a>.",
        help: `Syntax: <i>javlib</i> <b>movie code</b><br>
               try: <i>javlib</i> <b>star-699</b>`,
        icon: "commands/more/jav.png",
        builtIn: true,
        timeout: 1000,
        _hidden: true,
        _namespace: NS_MORE_COMMANDS,
        execute: function execute({object: {text}}) {
            CmdUtils.closePopup();
        },
        preview: function preview(pblock, {object: {text}}) {
            if (text) {
                make_request(pblock, "http://www.javlibrary.com/en/vl_searchbyid.php?keyword=" + encodeURI(text.trim()));
            }
        },
    });

}