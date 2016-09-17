"use strict";

// On page load
$(function() {

	// Main input processing function (on any keypress)
	$(document).on("keypress", function(e) {
		// Prevent spacebar from scrolling the page
		if (String.fromCharCode(e.which) == " ") { e.preventDefault(); }

		// If game is ready for input and keystroke is on the allowed list
		if (game.ready && /./.test(String.fromCharCode(e.which))) {
			game.missedWords = [];  // Keeps an array of all remaining possible matches that miss this cycle

			// If matchingWords is empty, copy all words from activeWords
			if (game.matchingWords.length == 0) { game.matchingWords = game.activeWords.slice(); }

			// Check all remaining words in checkingWords for matches
			for (let i = 0; i < game.matchingWords.length; i++) {
				const word = game.matchingWords[i];

				// If the latest keystroke matches the current letter, make it red, and replace spaces with underlines
				if (word.str[game.currentLetter] == String.fromCharCode(e.which)) {
					$("#word_" + word.number + "_letter_" + game.currentLetter).css("color", "red");
					if (word.str[game.currentLetter] == " ") { $("#word_" + word.number + "_letter_" + game.currentLetter).html("_"); }
				} else {
					game.resetWord(word, i);
					i--;  // Decrement loop counter (the current word has been removed from matchingWords: next word was @ i+1, now @ i)
				}
			}

			// If a match is found, increment currentLetter
			if (game.matchingWords.length > 0) {
				game.currentLetter++;

				// If word is complete, replace with new word
				// *NOTE: assumes no two words in activeWords are identical*
				if (game.currentLetter == game.matchingWords[0].str.length) {
					game.completeWord(game.matchingWords[0]);
				}
			}
			else {
				game.wrongKey();
			}
		}
	});

	game.init();
});