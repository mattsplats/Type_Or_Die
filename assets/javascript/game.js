"use strict";

// Main game object declaration
const game = {
	// Game state vars
	currentLetter: 0,  // Current matching letter for words remaining in matchingWords
	currentWord: 0,  // Used only to give a unique identifier to each word
	currentTimeout: 0,  // Time to next word
	currentSource: "",  // Currently selected word source
	ready: false,
	over: false,

	// Word arrays
	sourceWords: [],  // Source for adding words to game
	activeWords: [],  // Words on screen
	matchingWords: [],  // Words still matching input string
	missedWords: [],  // Words that do not match input string (on current keystroke)

	// Difficulty vars
	length: 3,  // Length of a game in words (game will end when game.length words have been completed/missed)
	startingTimeout: 2000,  // Msec before first new word is added
	minTimeout: 1000,  // Minimum msec between new words being added
	maxWords: 5,  // Most words to be shown on screen at one time
	wordSpeed: 1200,  // Speed of each word relative to its size, smaller numbers are faster

	// Constants
	speedupFactor: 1.01,  // Muliplier for the rate at which new words are added, applies after each added word
	wordBuffer: 10,  // Minimum buffer of source words (will trigger an XHR more if sourceWords.length < wordBuffer)
	missTimeout: 250,  // Msec after which a miss is triggered where new input is not allowed (like iFrames)


	// Methods
	init: function(){},
		// Initializes game - makes all necessary queries for data (XHR or Firebase db)
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
		// Sets: currentSource, sourceWords, over
};


// Method definitions
// game.init
Object.defineProperty(game, "init", { value: function() {
	data.get("all");
	game.chooseOptions();
}});

// game.start
Object.defineProperty(game, "start", { value: function() {
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
}});

// game.end
Object.defineProperty(game, "end", { value: function() {
	game.over = true;
	game.ready = false;
	
	display.gameOver();
	game.chooseOptions();
	stats.addHighScore();
}});

// game.addWord
Object.defineProperty(game, "addWord", { value: function() {
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
}});

// game.removeWord
Object.defineProperty(game, "removeWord", { value: function(word) {
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
}});

// game.resetWord
Object.defineProperty(game, "resetWord", { value: function(word, index) {
	display.resetWord(word);
	game.missedWords.push(word);
	game.matchingWords.splice(index, 1);
}});

// game.completeWord
Object.defineProperty(game, "completeWord", { value: function(word) {
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
}});

// game.wrongKey
Object.defineProperty(game, "wrongKey", { value: function() {
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
}});

// game.chooseOptions
Object.defineProperty(game, "chooseOptions", { value: function() {
	display.showOptions();

	$(".startGame").on("click", function(e){
		if (data.isReady()) {
			game.over = false;

			// Set difficulty
			if ($("#option1").prop("checked")) { game.wordSpeed = 1200; }
			else if ($("#option2").prop("checked")) { game.wordSpeed = 900; }
			else { game.wordSpeed = 600; }

			// Set source to selected word source, get words from that source
			game.currentSource = $(this).data("type");
			game.sourceWords = data.get(game.currentSource);

			display.startGame();
		}
	});
}});