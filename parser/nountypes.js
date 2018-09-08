/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ubiquity.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Jono DiCarlo <jdicarlo@mozilla.com>
 *   Blair McBride <unfocused@gmail.com>
 *   Abimanyu Raja <abimanyuraja@gmail.com>
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   Satoshi Murakami <murky.satyr@gmail.com>
 *   Brandon Pung <brandonpung@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// === {{{ noun_arb_text }}} ===
// Suggests the input as is.
// * {{{text, html}}} : user input

var noun_arb_text = {
  label: "?",
  rankLast: true,
  noExternalCalls: true,
  cacheTime: -1,
  suggest: function nat_suggest(text, html, callback, selectionIndices) {
    return [NounUtils.makeSugg(text, html, null, 0.3, selectionIndices)];
  },
  // hack to import feed-specific globals into this module
  // see feed-parts/header/initial.js
  /*loadGlobals: function nat_loadGlobals(source) {
    for (let p of ["jQuery", "Date"]) global[p] = source[p];
    this.loadGlobals = function () {};
  }*/
};

// === {{{ noun_type_number }}} ===
// Suggests a number value. Defaults to 1.
// * {{{text, html}}} : number text
// * {{{data}}} : number

var noun_type_number = {
    label: "number",
    noExternalCalls: true,
    cacheTime: -1,
    suggest: function nt_number_suggest(text) {
        var num = +text;
        return isNaN(num) ? [] : [NounUtils.makeSugg(text, null, num)];
    },
    default: NounUtils.makeSugg("1", null, 1, 0.5),
};

// === {{{ noun_type_percentage }}} ===
// Suggests a percentage value.
// * {{{text, html}}} : "?%"
// * {{{data}}} : a float number (1.0 for 100% etc.)

var noun_type_percentage = {
  label: "percentage",
  noExternalCalls: true,
  cacheTime: -1,
  default: NounUtils.makeSugg("100%", null, 1, 0.3),
  suggest: function nt_percentage_suggest(text, html) {
    var number = parseFloat(text);
    if (isNaN(number)) return [];

    var score = text.replace(/[^-\d.Ee%]/g, "").length / text.length;
    var nopercent = text.indexOf("%") < 0;
    if (nopercent) score *= 0.9;

    var suggs = [NounUtils.makeSugg(number + "%", null, number / 100, score)];
    // if the number's 10 or less and there's no
    // % sign, also try interpreting it as a proportion instead of a
    // percent and offer it as a suggestion as well, but with a lower
    // score.
    if (nopercent && number <= 10)
      suggs.push(NounUtils.makeSugg(
        number * 100 + "%", null, number, score * 0.9));
    return suggs;
  },
};

// === {{{ noun_type_date }}} ===
// === {{{ noun_type_time }}} ===
// === {{{ noun_type_date_time }}} ===
// Suggests a date/time for input, using the mighty {{{Date.parse()}}}.
// Defaults to today/now.
// * {{{text, html}}} : date/time text
// * {{{data}}} : {{{Date}}} instance

function scoreDateTime(text) {
  // Give penalty for short input only slightly,
  // as Date.parse() can handle variety of lengths like:
  // "t" or "Wednesday September 18th 2009 13:29:54 GMT+0900",
  var score = Math.pow(text.length / 42, 1 / 17); // .8 ~
  return score > 1 ? 1 : score;
}

var noun_type_date = {
  label: "date",
  noExternalCalls: true,
  cacheTime: 0,
  default() { return this._sugg(Date.today()) },
  suggest: function nt_date_suggest(text) {
    var date = Date.parse(text);
    if (!date) return [];

    var score = scoreDateTime(text);
    if (date.isToday())
      score *= .5;
    if (date.getHours() || date.getMinutes() || date.getSeconds())
      score *= .7;

    return [this._sugg(date, score)];
  },
  _sugg: (date, score) =>
    NounUtils.makeSugg(date.toString("yyyy-MM-dd"), null, date, score),
};

var noun_type_time = {
  label: "time",
  noExternalCalls: true,
  cacheTime: 0,
  default() { return this._sugg(Date.parse("now")) },
  suggest: function nt_time_suggest(text, html) {
    var date = Date.parse(text);
    if (!date) return [];

    var score = scoreDateTime(text), now = Date.parse("now");
    if (Math.abs(now - date) > 9) { // not "now"
      if (!now.isSameDay(date))
        score *= .7; // not "today"
      if (!date.getHours() && !date.getMinutes() && !date.getSeconds())
        score *= .5; // "00:00:00"
    }
    return [this._sugg(date, score)];
  },
  _sugg: (date, score) =>
    NounUtils.makeSugg(date.toString("hh:mm:ss tt"), null, date, score),
};

var noun_type_date_time = {
  label: "date and time",
  noExternalCalls: true,
  cacheTime: 0,
  default() { return this._sugg(Date.parse("now")) },
  suggest: function nt_time_suggest(text) {
    var date = Date.parse(text);
    if (!date) return [];

    var score = scoreDateTime(text), now = Date.parse("now");
    if (Math.abs(now - date) > 9) { // not "now"
      if (now.isSameDay(date))
        score *= .7; // "today"
      if (!date.getHours() && !date.getMinutes() && !date.getSeconds())
        score *= .7; // "00:00:00"
    }
    return [this._sugg(date, score)];
  },
  _sugg: (date, score) =>
    NounUtils.makeSugg(date.toString("yyyy-MM-dd hh:mm tt"), null, date,
                      score),
};

// === {{{ noun_type_email }}} ===
// Suggests an email address (RFC2822 minus domain-lit).
// The regex is taken from:
// http://blog.livedoor.jp/dankogai/archives/51190099.html
// * {{{text, html}}} : email address

const EMAIL_ATOM = "[\\w!#$%&'*+/=?^`{}~|-]+";
var noun_type_email = {
    label: "email",
    noExternalCalls: true,
    cacheTime: -1,
    _email: RegExp("^(?:" + EMAIL_ATOM + "(?:\\." + EMAIL_ATOM +
        ')*|(?:\\"(?:\\\\[^\\r\\n]|[^\\\\\\"])*\\"))@(' +
        EMAIL_ATOM + "(?:\\." + EMAIL_ATOM + ")*)$"),
    _username: RegExp("^(?:" + EMAIL_ATOM + "(?:\\." + EMAIL_ATOM +
        ')*|(?:\\"(?:\\\\[^\\r\\n]|[^\\\\\\"])*\\"))$'),
    suggest: function nt_email_suggest(text, html, cb, selectionIndices) {
        if (this._username.test(text))
            return [NounUtils.makeSugg(text, html, null, 0.3, selectionIndices)];

        var match = text.match(this._email);
        if (!match) return [];

        var domain = match[1];
        // if the domain doesn't have a period or the TLD
        // has less than two letters, penalize
        var score = /\.(?:\d+|[a-z]{2,})$/i.test(domain) ? 1 : 0.8;

        return [NounUtils.makeSugg(text, html, null, score, selectionIndices)];
    }
};

var noun_type_tab = {
    label: "title or URL",
    noExternalCalls: true,
    suggest: function nt_tab_suggest(text, html, cb, selectedIndices) {
        let fakeReq = {readyState: 2};

        CmdUtils.tabs.search(text, CmdUtils.maxSuggestions, tabs => {
            fakeReq.readyState = 4;
            cb(tabs.map(tab =>
                CmdUtils.makeSugg(
                    tab.title || tab.url,
                    null, tab, CmdUtils.matchScore(tab.match), selectedIndices)));
        });

        return [fakeReq];
    },
};
