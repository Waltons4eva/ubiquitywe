function SuggestionMemory3() {
    this._connection = Utils._connection;
}

{
    SuggestionMemory3.prototype = {
        _connection: null,
        constructor: SuggestionMemory3,
        toString() {
            return "[object SuggestionMemory3]"
        },

        Z: {__proto__: null}, // keep this empty!

        // === {{{ SuggestionMemory#remember(input, suggestion, ammount) }}}
        // Increases the strength of the association between {{{input}}} and
        // {{{suggestion}}}.
        remember: function SM_remember(input, suggestion, amount) {
            amount = +amount || 1;

            this._connection.select({
                from: "SuggestionMemory",
                where: {input: input}
            })
            .then(rows => {
                let insert = rows.length === 0;
                let scores;

                if (insert)
                    scores = {__proto__: null};
                else
                    scores = rows[0].scores;

                if (suggestion in scores) {
                    scores[suggestion] += amount;
                }
                else {
                    scores[suggestion] = amount;
                }

                if (insert) {
                    this._connection.insert({
                        into: "SuggestionMemory",
                        values: [{input: input, scores: scores}]
                    });
                }
                else {
                    this._connection.update({
                       in: "SuggestionMemory",
                       set: {scores: scores},
                       where: {input: input}
                    });
                }
            });
        },

        // === {{{ SuggestionMemory#getScore(input, suggestion) }}} ===
        // === {{{ SuggestionMemory#setScore(input, suggestion, score) }}} ===
        // Gets/Sets the number of times that {{{suggestion}}} has been associated
        // with {{{input}}}.
        getScore(input, suggestion) {
            return this._connection.select({
                from: "SuggestionMemory",
                where: {input: input}
            })
            .then(rows => {
                if (rows.length === 0)
                    return 0;
                return rows[0].scores[suggestion] || 0;
            });
        },
        setScore(input, suggestion, score) {
            //return this.remember(input, suggestion, score - this.getScore(input, suggestion));
        },

        // === {{{ SuggestionMemory#wipe(input, suggestion) }}} ===
        // Wipes the specified entry out of this suggestion memory instance.
        // Omitting both {{{input}}} and {{{suggestion}}} deletes everything.
        // Be careful with this.
        wipe: function SM_wipe(input, suggestion) {

        },

    };
}