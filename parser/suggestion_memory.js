function SuggestionMemory() {
    this._table = Utils.suggestionMemory;
}

SuggestionMemory.prototype = {
  constructor: SuggestionMemory,
  toString() { return "[object SuggestionMemory]" },
  toJSON() { return this._table },

    Z: {__proto__: null}, // keep this empty!

    _getScores(input) {
        return this._table[input] || (this._table[input] = {__proto__: null})
    },

    // === {{{ SuggestionMemory#remember(input, suggestion, ammount) }}}
    // Increases the strength of the association between {{{input}}} and
    // {{{suggestion}}}.
    remember: function SM_remember(input, suggestion, ammount) {
        ammount = +ammount || 1;
        var scores = this._getScores(input);
        if (suggestion in scores) {
            var score = scores[suggestion] += ammount;
        }
        else {
            var score = scores[suggestion] = ammount;
        }
        Utils.setPref("suggestionMemory", this._table);
        return score;
    },

    // === {{{ SuggestionMemory#getScore(input, suggestion) }}} ===
    // === {{{ SuggestionMemory#setScore(input, suggestion, score) }}} ===
    // Gets/Sets the number of times that {{{suggestion}}} has been associated
    // with {{{input}}}.
    getScore(input, suggestion) {
        return (this._table[input] || this.Z)[suggestion] || 0
    },
    setScore(input, suggestion, score) { return (
        this.remember(input, suggestion, score - this.getScore(input, suggestion))
    ) },

    // === {{{ SuggestionMemory#wipe(input, suggestion) }}} ===
    // Wipes the specified entry out of this suggestion memory instance.
    // Omitting both {{{input}}} and {{{suggestion}}} deletes everything.
    // Be careful with this.
    wipe: function SM_wipe(input, suggestion) {
        this._table = {__proto__: null};
        Utils.setPref("suggestionMemory", {__proto__: null});
    },

};
