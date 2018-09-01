//
// Utils
//

if (!Utils) var Utils = {};

const TO_STRING = Object.prototype.toString;

// === {{{ Utils.paramsToString(params, prefix = "?") }}} ===
// Takes the given object containing keys and values into a query string
// suitable for inclusion in an HTTP GET or POST request.
//
// {{{params}}} is the object of key-value pairs.
//
// {{{prefix}}} is an optional string prepended to the result,
// which defaults to {{{"?"}}}.
Utils.paramsToString = function paramsToString(params, prefix) {
	var stringPairs = [];

	function addPair(key, value) {
		// explicitly ignoring values that are functions/null/undefined
		if (typeof value !== "function" && value != null)
			stringPairs.push(
				encodeURIComponent(key) + "=" + encodeURIComponent(value));
	}
	for (var key in params)
		if (Utils.isArray(params[key]))
			params[key].forEach(function p2s_each(item) {
				addPair(key, item)
			});
		else
			addPair(key, params[key]);
	return (prefix == null ? "?" : prefix) + stringPairs.join("&");
};

// === {{{ Utils.urlToParams(urlString) }}} ===
// Given a {{{urlString}}}, returns an object containing keys and values
// retrieved from its query-part.
Utils.urlToParams = function urlToParams(url) {
	var params = {},
		dict = {
			__proto__: null
		};
	for (let param of /^(?:[^?]*\?)?([^#]*)/.exec(url)[1].split("&")) {
		let [key, val] = /[^=]*(?==?(.*))/.exec(param);
		val = val.replace(/\+/g, " ");
		try {
			key = decodeURIComponent(key)
		} catch (e) {};
		try {
			val = decodeURIComponent(val)
		} catch (e) {};
		params[key] = key in dict ? [].concat(params[key], val) : val;
		dict[key] = 1;
	}
	return params;
};

Utils.setTimeout = setTimeout;
Utils.isArray = Array.isArray;

Utils.reportWarning = function(aMessage, stackFrameNumber) {
	console.warn(aMessage);
};

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
Utils.FNV_OFFSET_32 = 0x811c9dc5;

Utils.hashFnv32a = function (input) {
    var hval = Utils.FNV_OFFSET_32;

    // Strips unicode bits, only the lower 8 bits of the values are used
    for (var i = 0; i < input.length; i++) {
        hval = hval ^ (input.charCodeAt(i) & 0xFF);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }

    return hval >>> 0;
};


// borrowed from utils.js of original Ubiquity

// === {{{ Utils.sort(array, key, descending = false) }}} ===
// Sorts an {{{array}}} without implicit string conversion and returns it,
// optionally performing Schwartzian Transformation
// by specified {{{key}}}. e.g.:
// {{{
// [42, 16, 7].sort() //=> [16, 42, 7]
// sort([42, 16, 7])  //=> [7, 16, 42]
// sort(["abc", "d", "ef"], "length") //=> ["d", "ef", "abc"]
// sort([1, 2, 3], x => -x)   //=> [3, 2, 1]
// }}}
//
// {{{array}}} is the target array.
//
// {{{key}}} is an optional string specifying the key property
// or a function that maps each of {{{array}}}'s item to a sort key.
//
// Sorts descending if {{{descending}}}.

Utils.sort = function(array, key, descending) {
    array.forEach(
        function transform(v, i, a) { a[i] = {key: this(v), val: v} },
        typeof key == "function" ? key : key != null ? x => x[key] : x => x);
    // Because our Monkey uses Merge Sort, "swap the values if plus" works.
    array.sort(descending
        ? (a, b) => a.key < b.key
        : (a, b) => a.key > b.key)
    array.forEach(function mrofsnart(v, i, a) { a[i] = v.val });
    return array;
};

Utils.sortBy = Utils.sort;

// === {{{ Utils.escapeHtml(string) }}} ===
// Returns a version of the {{{string}}} safe for insertion into HTML.
// Useful when you just want to concatenate a bunch of strings into
// an HTML fragment and ensure that everything's escaped properly.

Utils.escapeHtml = function(s) {
    return String(s).replace(Utils.escapeHtml.re, Utils.escapeHtml.fn)
};
Utils.escapeHtml.re = /[&<>\"\']/g;
Utils.escapeHtml.fn = function escapeHtml_sub($) {
    switch ($) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#39;";
    }
};

// === {{{ Utils.isEmpty(value) }}} ===
// Returns whether or not the {{{value}}} has no own properties.

Utils.isEmpty = function(val) { return !keys(val).length }

// === {{{ Utils.classOf(value) }}} ===
// Returns the internal {{{[[Class]]}}} property of the {{{value}}}.
// See [[http://bit.ly/CkhjS#instanceof-considered-harmful]].

Utils.classOf = function(val) { return TO_STRING.call(val).slice(8, -1) }

// == {{{ Utils.regexp(pattern, flags) }}} ==
// Creates a regexp just like {{{RegExp}}}, except that it:
// * falls back to a quoted version of {{{pattern}}} if the compile fails
// * returns the {{{pattern}}} as is if it's already a regexp
//
// {{{
// RegExp("[")          // SyntaxError("unterminated character class")
// RegExp(/:/, "y")     // TypeError("can't supply flags when ...")
// regexp("[")          // /\[/
// regexp(/:/, "y")     // /:/
// }}}
// Also contains regexp related functions.

Utils.regexp = function(pattern, flags) {
    if (Utils.classOf(pattern) === "RegExp") return pattern;
    try {
        return RegExp(pattern, flags);
    } catch (e) {
        return RegExp(regexp.quote(pattern), flags);
    }
}
