"use strict";

// Main game object declaration
const game = {
	// Game state vars
	currentLetter: 0,  // Current matching letter for words remaining in matchingWords
	currentWord: 0,  // Used only to give a unique identifier to each word
	currentTimeout: 0,  // Time to next word
	currentSource: "",  // Currently selected word source
	currentDifficulty: "hard",  // Current game difficulty
	ready: false,
	over: false,

	// Word arrays
	sourceWords: [],  // Source for adding words to game
	activeWords: [],  // Words on screen
	matchingWords: [],  // Words still matching input string
	missedWords: [],  // Words that do not match input string (on current keystroke)

	// Difficulty vars
	length: 1,  // Length of a game in words (game will end when game.length words have been completed/missed)
	startingTimeout: 2100,  // Msec before first new word is added
	minTimeout: 1200,  // Minimum msec between new words being added
	maxWords: 6,  // Most words to be shown on screen at one time
	wordSpeed: 1000,  // Speed of each word relative to its size, smaller numbers are faster

	// Constants
	speedupFactor: 1.015,  // Muliplier for the rate at which new words are added, applies after each added word
	wordBuffer: 10,  // Minimum buffer of source words (will trigger an XHR more if sourceWords.length < wordBuffer)
	missTimeout: 250,  // Msec after which a miss is triggered where new input is not allowed (like iFrames)


	// Methods
	init: function(){},
		// Initializes game - makes all necessary queries for data (XHR or Firebase db) and creates main event listeners
		// Calls: data.get
		// Sets: (none)
	
	start: function(){},
		// Start adding words to output div on timer (see // Constants for timing vars)
		// Calls: stats.reset, addWord, end, stats.update
		// Sets: currentLetter, currentWord, stats.startTime, ready, over

	end: function(){},
		// Sets game over state, sets up for next game, stores new high score
		// Calls: display.gameOver, chooseOptions, stats.addHighScore
		// Sets: ready, over

	addWord: function(){},
		// Creates a new word, calls data.get if sourceWords is running low
		// Calls: data.get, display.addWord
		// Sets: stats.timeOffset, stats.emptyStart, sourceWords, activeWords, matchingWords, currentWord

	removeWord: function(word){},
		// Word not completed in time - removes passed word from game, updates game state & stats
		// Calls: stats.update, display.removeWord
		// Sets: stats.score, stats.scoreDelta, stats.scoreMultiplier, stats.currentStreak, activeWords, matchingWords, currentLetter

	resetWord: function(word, index){},
		// Resets previously matching word to initial state
		// Calls: display.resetWord
		// Sets: missingWords, matchingWords

	completeWord: function(word){},
		// Word successfully completed - removes passed word from game, updates game state & stats
		// Calls: stats.update, display.blowUpWord
		// Sets: stats.score, stats.scoreDelta, stats.scoreMultiplier, stats.hits, stats.currentStreak, activeWords, matchingWords, stats.emptyStart, display.blowUpWord, end

	wrongKey: function(){},
		// Animates any words remaining in matchingWords when current keystroke results in no word matches, updates game state & stats
		// Calls: stats.update, display.shakeWord
		// Sets: stats.timeOffset, stats.scoreDelta, stats.scoreMultiplier, ready, stats.hits, stats.misses, stats.currentStreak, stats.currentLetter

	chooseOptions: function(){}
		// Provides option selection for new game, starts new game with chosen options
		// Calls: display.showOptions, display.startGame
		// Sets: over, currentSource, sourceWords, currentDifficulty, length, startingTimeout, minTimeout, maxWords, wordSpeed, stats.scorePlusMult, stats.scoreMinusMult
};


// Method definitions
Object.defineProperties(game, {
	"init": { value: function() {
		data.get("all");
		game.chooseOptions();  // Uncomment this to bypass login / authentication step

		// User signin popup
		$("#auth").on('click', user.auth);

		// Main input processing function (on any keypress)
		$(document).on("keypress", function(e) {
			// Prevent spacebar from scrolling the page
			if (String.fromCharCode(e.which) == " ") { e.preventDefault(); }

			if (e.which == 13) {
				while (game.matchingWords.length > 0) {
					game.resetWord(game.matchingWords[0], 0);
				}
				game.currentLetter = 0;
			// If game is ready for input and keystroke is on the allowed list
			} else if (game.ready && /./.test(String.fromCharCode(e.which))) {
				game.missedWords = [];  // Keeps an array of all remaining possible matches that miss this cycle

				// If matchingWords is empty, copy all words from activeWords
				if (game.matchingWords.length == 0) { game.matchingWords = game.activeWords.slice(); }

				// Check all remaining words in checkingWords for matches
				for (let i = 0; i < game.matchingWords.length; i++) {
					const word = game.matchingWords[i];

					// If the latest keystroke matches the current letter, make it red, and replace spaces with underlines
					if (word.str[game.currentLetter] == String.fromCharCode(e.which)) {
						display.updateWord(word);
					} else {
						game.resetWord(word, i);
						i--;  // Decrement loop counter (the current word has been removed from matchingWords: next word was @ i+1, now @ i)
					}
				}

				// If a match is found, increment currentLetter
				if (game.matchingWords.length > 0) {
					game.currentLetter++;

					// If word is complete, replace with new word
					for (let i = 0; i < game.matchingWords.length; i++) {
						if (game.currentLetter == game.matchingWords[i].str.length) {
							game.completeWord(game.matchingWords[i]);
							audio.play("completeWord");
							i--;  // Decrement loop counter (the current word has been removed from matchingWords: next word was @ i+1, now @ i)
						}
					}
					if (game.matchingWords.length == 0) { game.currentLetter = 0; }
				}
				else {
					game.wrongKey();
				}
			}
		});

		// High score radio button event
		$("input[type=radio][name=scoreList]").on('change', function() {
			switch($(this).val()) {
				case "easy": display.highScores(stats.easyScoreArr, -1);  break;
				case "hard": display.highScores(stats.hardScoreArr, -1);  break;
				case "insane": display.highScores(stats.insaneScoreArr, -1);  break;
			}
		});
	}},

	"start": { value: function() {
		// Game state & stats reset for new game
		game.currentLetter = 0;
		game.currentWord = 0;
		stats.reset();
		
		let timer = setTimeout(anotherWord, 0);
		game.currentTimeout = game.startingTimeout;

		// Adds new word every time timer's callback function executes
		// Reduces currentTimeout by speedupFactor on each new added word
		function anotherWord() {
		    clearTimeout(timer);
		    if (game.currentWord < game.length) {
			    if (game.activeWords.length < game.maxWords) {
			    	game.addWord();
			    	game.currentTimeout / game.speedupFactor < game.minTimeout ? game.currentTimeout = game.minTimeout : game.currentTimeout /= game.speedupFactor;
			    }
			    timer = setTimeout(anotherWord, game.currentTimeout);
			}
		}

		stats.startTime = Date.now();
		stats.update();
		game.over = false;
		game.ready = true;
	}},

	"end": { value: function() {
		game.over = true;
		game.ready = false;
		
		display.gameOver();
		game.chooseOptions();
		stats.addHighScore();
	}},

	"addWord": { value: function() {
		// If no words were available to type, add the lost time to timeOffset
		if (stats.emptyStart > 0) {
			stats.timeOffset += Date.now() - stats.emptyStart;
			stats.emptyStart = 0;
		}

		// Create new word object, remove word from sourceWords 
		const word = {
			str: game.sourceWords[0],
			number: game.currentWord  // Stores the number used in the div and span IDs at HTML creation time
		};
		game.sourceWords.splice(0, 1);

		// Get more words if sourceWords is running low
		if (game.sourceWords.length < game.wordBuffer) { game.sourceWords = data.get(game.currentSource); }

		// Show word on screen
		display.addWord(word);

		game.activeWords.push(word);
		game.currentWord++;
	}},

	"removeWord": { value: function(word) {
		stats.score -= word.str.length * stats.scoreMinusMult;
		stats.scoreDelta = -(word.str.length * stats.scoreMinusMult);
		if (stats.scoreMultiplier > 1) { stats.scoreMultiplier--; }
		stats.currentStreak = 0;
		stats.update();

		// Remove word from activeWords and matchingWords
		game.activeWords.splice(game.activeWords.indexOf(word), 1)
		if (game.matchingWords.indexOf(word) != -1) {
			if (game.matchingWords.length == 1) { game.currentLetter = 0; }  // If the word still matches the current input, currentLetter = 0 (so new words will match)
			game.matchingWords.splice(game.matchingWords.indexOf(word), 1);
		}

		// Remove word from display and trigger associated animations
		display.removeWord(word);

		// If game over conditions hold, trigger game over
		if (game.currentWord == game.length && game.activeWords.length == 0 && !game.over) { game.end(); }
	}},

	"resetWord": { value: function(word, index) {
		display.resetWord(word);
		game.missedWords.push(word);
		game.matchingWords.splice(index, 1);
	}},

	"completeWord": { value: function(word) {
		// Increment score, update stats, reset game vars
		stats.score += word.str.length * stats.scorePlusMult * stats.scoreMultiplier;
		stats.scoreDelta = word.str.length * stats.scorePlusMult * stats.scoreMultiplier;
		stats.hits += word.str.length;
		stats.currentStreak++;
		stats.update();

		game.activeWords.splice(game.activeWords.indexOf(word), 1);
		game.matchingWords.splice(game.matchingWords.indexOf(word), 1);

		// "Blow up word" animation
		display.blowUpWord(word);

		// Timer check if screen is empty
		if (game.activeWords.length == 0) {
			stats.emptyStart = Date.now();
		}

		if (game.currentWord == game.length && game.activeWords.length == 0 && !game.over) { game.end(); }
	}},

	"wrongKey": { value: function() {
		// Prohibits further input while animation is playing
		game.ready = false;
		
		stats.scoreDelta = 0;
		if (stats.scoreMultiplier > 1) { stats.scoreMultiplier--; }
		stats.hits += game.currentLetter;
		stats.misses++;
		stats.currentStreak = 0;
		stats.timeOffset += game.missTimeout;  // Removes forced wait time from WPM calculation (so you're not penalized for time spent waiting)
		stats.update();

		game.currentLetter = 0;

		// Missed word animation
		for (let i = 0; i < game.missedWords.length; i++) {
			display.shakeWord(game.missedWords[i]);
		}

		setTimeout(function(){ game.ready = true; }, game.missTimeout);
	}},

	"chooseOptions": { value: function() {
		display.showOptions();

		$(".startGame").on("click", function(e){
			if (data.isReady()) {
				game.over = false;

				// Set source to selected word source, get words from that source
				game.currentSource = $(this).data("type");
				game.sourceWords = data.get(game.currentSource);

				// Set difficulty
				if ($("#easy").prop("checked")) { easy(); }
				else if ($("#hard").prop("checked")) { hard(); }
				else { insane(); }

				display.startGame();
			}
		});

		function easy() {
			game.currentDifficulty = "easy";
			// game.length = 50;
			game.startingTimeout = 2500;
			game.minTimeout = 1500;
			game.maxWords = 5;
			game.wordSpeed = 1500;

			stats.scorePlusMult = 100;
			stats.scoreMinusMult = 25;
		}

		function hard() {
			game.currentDifficulty = "hard";
			// game.length = 80;
			game.startingTimeout = 2100;
			game.minTimeout = 1200;
			game.maxWords = 6;
			game.wordSpeed = 1000;

			stats.scorePlusMult = 200;
			stats.scoreMinusMult = 50;
		}

		function insane() {
			game.currentDifficulty = "insane";
			// game.length = 120;
			game.startingTimeout = 1800;
			game.minTimeout = 1000;
			game.maxWords = 7;
			game.wordSpeed = 600;

			stats.scorePlusMult = 300;
			stats.scoreMinusMult = 100;
		}
	}}
});