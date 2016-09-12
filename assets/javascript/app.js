// Main game object
let game = {
	// Game state vars
	activeWords: [],
	matchingWords: [],
	currentLetter: 0,
	ready: false,

	// Stats vars
	score: 0,
	currentStreak: 0,
	longestStreak: 0,
	hits: 0,
	misses: 0,
	startTime: Date.now(),
	timeOffset: 0,

	// Methods
	init: function() {
		game.newWord(0);
		game.newWord(1);
		game.newWord(2);
		game.updateStats();
		setTimeout(function(){ game.timeOffset /= 3; }, 200);
	},

	newWord: function(index) {
		// Do not allow keyboard input (until ajax request completes)
		game.ready = false;

		// If word is replacing an existing word (a word was completed), increment score, update stats, reset game vars
		if (game.activeWords[index]) {
			game.score += 10;
			game.hits += game.currentLetter;
			game.currentStreak++
			if (game.currentStreak > game.longestStreak) { game.longestStreak = game.currentStreak; }

			game.currentLetter = 0;
			game.matchingWords = [];
			game.updateStats();
		}

		// Log start time of request
		const startTime = Date.now();

		// Request new word
		$.ajax({
            url: "http://www.setgetgo.com/randomword/get.php",
            method: "GET",
            data: {
            	len: 6
            }
        }).done(function(response){
        	// Add request time to timeOffset
			game.timeOffset += Date.now() - startTime;

        	const word = {
				str: response,
				number: index
			};

			// Create and output series of spans for each character in the word
			let html = "<h2>";
			for (let i = 0; i < word.str.length; i++) {
				html += "<span id='word_" + index + "_letter_" + i + "'>" + word.str[i] + "</span>";
			}
			html += "</h2>";
			$("#out_" + index).html(html);

			// Add word to activeWords
			game.activeWords[index] = word;
			
			// Allow keyboard input
			game.ready = true;
        });
	},

	resetWordHtml: function(word) {
		for (let i = 0; i < game.currentLetter; i++) {
			$("#word_" + word.number + "_letter_" + i).css("color", "black");
		}
	},

	wordMiss: function(wordList) {
		const animationTime = 110;
		game.timeOffset += animationTime;

		game.ready = false;
		game.hits += game.currentLetter;
		game.misses++;
		game.currentStreak = 0;

		
		for (const word of wordList) {
			$("#out_" + word.number).css("left", -3);
			setTimeout(function(){ $("#out_" + word.number).css("left", 6); }, 30);
			setTimeout(function(){ $("#out_" + word.number).css("left", -6); }, 70);
			setTimeout(function(){ $("#out_" + word.number).css("left", 3); }, 100);
			setTimeout(function(){ $("#out_" + word.number).css("left", 0); game.ready = true; }, animationTime);
		}

		game.currentLetter = 0;
		game.updateStats();
	},

	updateStats: function() {
		const wpm = (game.score / 10) / ((Date.now() - game.startTime - game.timeOffset) / 1000 / 60) || 0;
		const acc = 100 * game.hits / (game.hits + game.misses) || 0;

		$("#score").html("<h3>Score: " + game.score + "</h3>");
		$("#wpm").html("WPM: " + wpm.toFixed(1));
		$("#acc").html("Accuracy: " + game.hits + " / " + (game.hits + game.misses) + " ( " + acc.toFixed(1) + "% )");
		$("#streak").html("Perfect streak: " + game.currentStreak + "<br/>Longest streak: " + game.longestStreak);
	}
};

// On load block
$(function() {

	// Main input processing function (on any keypress)
	$(document).on("keypress", function(e) {
		// If game is ready for input and keystroke is a letter
		if (game.ready && (e.which >= 65) && (e.which <= 122)) {
			let missedWords = [];  // Keeps an array of all remaining possible matches that miss this cycle

			// If checkWords is empty, copy all words from activeWords
			if (game.matchingWords.length == 0) { game.matchingWords = game.activeWords.slice(); }

			// Check all remaining words in checkingWords for matches
			for (let i = 0; i < game.matchingWords.length; i++) {
				const word = game.matchingWords[i];

				// If the latest keystroke matches the current letter, make it red
				if (word.str[game.currentLetter] == String.fromCharCode(e.which)) {
					$("#word_" + word.number + "_letter_" + game.currentLetter).css("color", "red");
				} else {
					// Add word to missedWords, reset letter colors, remove word from matchingWords, decrement loop counter
					missedWords.push(word);
					game.resetWordHtml(word);
					game.matchingWords.splice(i, 1);
					i--;
				}
			}

			// If a match is found, increment currentLetter
			if (game.matchingWords.length > 0) {
				game.currentLetter++;

				// If word is complete, replace with new word
				if (game.currentLetter == game.matchingWords[0].str.length) {
					game.newWord(game.matchingWords[0].number);
				}
			}
			else {
				game.wordMiss(missedWords);
			}
		}
	});

	// Clear stats button - resets all stats to zero
	$("#clearStats").on("click", function(e){
		game.score = 0;
		game.currentStreak = 0;
		game. longestStreak = 0;
		game.hits = 0;
		game.misses = 0;
		game.startTime = Date.now();
		game.timeOffset = 0;
		game.updateStats();
	})

	game.init();
});