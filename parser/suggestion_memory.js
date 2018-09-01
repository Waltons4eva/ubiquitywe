// Stub for SuggestionMemory

function SuggestionMemory(id, connection) {
}

SuggestionMemory.prototype = {
  constructor: SuggestionMemory,
  toString() { return "[object SuggestionMemory]" },
  toJSON() { return this._table },

  remember: function (input, suggestion, ammount) {
    return 1;
  },

  getScore(input, suggestion) {
    return 1;
  },
  setScore(input, suggestion, score) {

  },

  getTopRanked(input, numResults) {
  },

  wipe(input, suggestion) {
  },
};
