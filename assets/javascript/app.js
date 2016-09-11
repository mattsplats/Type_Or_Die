// Main game object
let game = {
	// Properties
	currentLetter: 0,
	ready: false,
	score: 0,

	// Word object arrays
	activeWords: [],
	matchingWords: [],

	// Timing vars
	startTime: Date.now(),

	// Methods
	init: function() {
		game.newWord(0);
		game.newWord(1);
		game.newWord(2);
	},

	newWord: function(index) {
		$.ajax({
            url: "http://www.setgetgo.com/randomword/get.php",
            method: "GET",
            data: {
            	len: 6
            }
        }).done(function(response){
        	let word = {
				str: response,
				arr: [],
				html: "",
				number: index
			};

			// Create and output series of spans for each character in the word
			word.html += "<h2>";
			for (let i = 0; i < word.str.length; i++) {
				word.arr.push(word.str.charAt(i).toLowerCase());
				word.html += "<span id='word_" + index + "_letter_" + i + "'>" + word.arr[i] + "</span>";
			}
			word.html += "</h2>";
			$("#out_" + index).html(word.html);

			// Add word to activeWords and a copy to checkWords
			game.activeWords[index] = word;

			// Update all displayed stats
			game.updateStats();

			// Allow game to proceed
			game.ready = true;
        });
	},

	resetWordHtml: function(word) {
		// Reset all letters to initial state
		for (let i = 0; i < word.str.length; i++) {
			$("#word_" + word.number + "_letter_" + i).css("color", "black");
		}
	},

	wordMissAnimation: function(word) {
		$("#out_" + word.number).css("left", -3);
		setTimeout(function(){ $("#out_" + word.number).css("left", 6); }, 30);
		setTimeout(function(){ $("#out_" + word.number).css("left", -6); }, 70);
		setTimeout(function(){ $("#out_" + word.number).css("left", 3); }, 100);
		setTimeout(function(){ $("#out_" + word.number).css("left", 0); }, 110);
	},

	updateStats: function() {
		const wpm = (game.score / 10) / ((Date.now() - game.startTime) / 1000 / 60);
		$("#wpm").html(wpm.toFixed(1));
		$("#score").html("<h3>" + game.score + "</h3>");
	}
};

// On load
$(function() {
	$(document).on("keypress", function(event) {
		// If game is ready for input and keystroke is a letter
		if (game.ready && (event.which >= 65) && (event.which <= 122)) {

			const keystroke = String.fromCharCode(event.which).toLowerCase();
			let match = false;
			let missedWords = [];

			// If checkWords is empty, copy all words from activeWords
			if (game.matchingWords.length == 0) { game.matchingWords = game.activeWords.slice(); }

			// Check all remaining words in checkingWords for matches
			for (let i = 0; i < game.matchingWords.length; i++) {
				let word = game.matchingWords[i];

				// If the latest keystroke matches the current letter in the checked word
				if (word.arr[game.currentLetter] == keystroke) {

					// Update red letters on screen, advance game letter, indicate a match (non-miss)
					$("#word_" + word.number + "_letter_" + game.currentLetter).css("color", "red");
					match = true;

					// If word is complete, replace with new word, increment score
					if (game.currentLetter == word.str.length - 1) {
						game.ready = false;
						game.score += 10;
						game.currentLetter = 0;
						game.matchingWords = [];
						game.newWord(word.number);
						game.updateStats();
					}
				
				} else {
					// Reset and remove non-matching words
					game.resetWordHtml(word);
					missedWords.push(word);
					game.matchingWords.splice(i, 1);
					i--;
				}
			}

			// If new word has been issued, do not execute
			if (game.ready) {

				// If a match is found, increment currentLetter
				if (match) { game.currentLetter++; }
				else {
					// If no matches are found, reset currentLetter to 0, animate all relevant words
					game.currentLetter = 0;
					for (const word of missedWords) {
						game.wordMissAnimation(word);
					}
					game.updateStats();
				}
			}

			console.log(game.currentLetter);
			console.log(game.matchingWords);
		}
	});

	game.init();
});