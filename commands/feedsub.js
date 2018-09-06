CmdUtils.CreateCommand({
    names: ["feedsub"],
    _namespace: "Syndication",
    description: "Subscribe to a RSS feed using Feedly. The command uses url opened in the current tab. " +
                 "Direct feed links, Instagram, Tumblr, Twitter and Youtube are supported.",
    icon: "res/icon-24.png",
    builtIn: true,
    preview: "Subscribe using Feedly",
    execute: function () {
      const feedlySubUrl = "https://feedly.com/i/subscription/feed/"; 
      let url = CmdUtils.getLocation();
      if (/twitter.com\//.test(url)) {
        let m = url.match(/twitter.com\/([^\/]*)/);
        let uid = m? m[1]: null;
        if (uid) {
          CmdUtils.addTab(feedlySubUrl
                          + encodeURIComponent("https://twitrss.me/twitter_user_to_rss/?user=" + uid));
        }
      }
	  else if (/tumblr.com/.test(url)) {
        let m = url.match(/([^.]*.tumblr.com)/);
        let uid = m? m[1]: null;
        if (uid) {
          CmdUtils.addTab(feedlySubUrl
                          + encodeURIComponent(uid + "/rss"));
        }
      }
      else if (/instagram.com\//.test(url)) {
          let m = url.match(/instagram.com\/([^\/]*)/);
          let uid = m? m[1]: null;
          if (uid) {
              CmdUtils.addTab(feedlySubUrl
                  + encodeURIComponent("https://web.stagram.com/rss/n/" + uid));
          }
      }
      else if (/youtube.com\//.test(url)) {
        let m = url.match(/youtube.com\/channel\/([^\/]*)/);
        let uid = m? m[1]: null;
        if (uid) {
          CmdUtils.addTab(feedlySubUrl
                          + encodeURIComponent("https://www.youtube.com/feeds/videos.xml?channel_id=" + uid));
        }
      }
      else {
          CmdUtils.addTab(feedlySubUrl + encodeURIComponent(url));
      }

      CmdUtils.closePopup();
    }
});