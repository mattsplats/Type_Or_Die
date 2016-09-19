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

	// Constants (safe to modify)
	length: 10,  // Length of a game in words (game will end when game.length words have been completed/missed)
	speedupFactor: 1.02,  // Muliplier for the rate at which new words are added, applies after each added word
	startingTimeout: 3600,  // Msec before first new word is added
	minTimeout: 1000,  // Minimum msec between new words being added
	maxWords: 5,  // Most words to be shown on screen at one time

	// Constants (UNSAFE TO MODIFY)
	wordLiveTime: 6700,  // Timeout until word is removed
	wordBuffer: 10,  // Minimum buffer of source words (will trigger an XHR more if sourceWords < wordBuffer)


	// Methods
	init: function(){},
		// Initializes game - makes all necessary queries for data (XHR or Firebase db) and shows selection buttons
		// Calls: data.get, showButtons
		// Sets: (none)
	
	start: function(){},
		// Start adding words to output div on timer (see // Constants for timing vars)
		// Calls: stats.reset, addWord, end, stats.update
		// Sets: stats.startTime, ready

	end: function(){},
		// Shows "game over" screen and buttons to play again
		// Calls: showButtons
		// Sets: ready

	addWord: function(){},
		// Places a new falling word on screen, sets a timeout to call removeWord if not completed in wordLiveTime
		// Calls: data.get
		// Sets: stats.timeOffset, stats.emptyStart, sourceWords, activeWords, matchingWords, currentWord

	removeWord: function(word){},
		// Word not completed in time - removes passed word from game, updates game state & stats
		// Calls: stats.update
		// Sets: stats.score, activeWords, matchingWords, currentLetter

	resetWord: function(word, index){},
		// Resets HTML for passed word and removes word from matchingWords @ index
		// Calls: (none)
		// Sets: missingWords, matchingWords

	completeWord: function(word){},
		// Word successfully completed - removes passed word from game, updates game state & stats
		// Calls: stats.update
		// Sets: stats.score, stats.wordsCompleted, stats.hits, stats.currentStreak, currentLetter, activeWords, matchingWords, stats.emptyStart

	wrongKey: function(){},
		// Animates any words remaining in matchingWords when current keystroke results in no word matches, updates game state & stats
		// Calls: stats.update
		// Sets: stats.timeOffset, ready, stats.hits, stats.misses, stats.currentStreak, stats.currentLetter

	showButtons: function(){}
		// Shows word list selector buttons, modifies #output div css, adds onClick handler for these buttons
		// Calls: start
		// Sets: currentSource, sourceWords
};


// Method definitions
// game.init
Object.defineProperty(game, "init", { value: function() {
	data.get("all");
	game.showButtons();
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
		} else { game.end(); }
	}

	stats.startTime = Date.now();
	stats.update();
	game.ready = true;
}});

// game.end
Object.defineProperty(game, "end", { value: function() {
	game.ready = false;
	var userName=user.displayName
	var wpm = stats.wordsCompleted / ((Date.now() - stats.startTime - stats.timeOffset) / 1000 / 60) || 0;
	var acc = 100 * stats.hits / (stats.hits + stats.misses) || 0;
	var longestStreak = stats.longestStreak
	database.ref().push({
    userName:userName,
    wpm:wpm,
    acc:acc,
    longestStreak:longestStreak,
});
database.ref().on("child_added", function(snapshot){	
	var row = $("<tr>")
	var userName = 
	row.append("<td>" + User Name: + "</td>")
	var wpm = 
	row.append("<td>" + WPM: + "</td>")
	var acc = 
	row.append("<td>" + Accuracy%: + "</td>")
	var longestStreak = 
	row.append("<td>" + Longest Streak: + "</td>")

$("#score-table").append(row);

	$("#output").addClass("flex").html("<div class='text-center'><h1>Thanks for playing!</h1></div>");
	game.showButtons();
}});

// game.addWord
Object.defineProperty(game, "addWord", { value: function() {
	// If no words were available to type, add the lost time to timeOffset
	if (stats.emptyStart > 0) {
		stats.timeOffset += Date.now() - stats.emptyStart;
		stats.emptyStart = 0;
	}

	// Create new word object, remove word from sourceWords, get more words if sourceWords is running low
	const word = {
		str: game.sourceWords[0],
		number: game.currentWord  // Stores the number used in the div and span IDs at HTML creation time
	};
	game.sourceWords.splice(0, 1);
	if (game.sourceWords.length < game.wordBuffer) { game.sourceWords = data.get(game.currentSource); }

	// Create and output series of spans for each character in the word
	let html = "<div id='word_" + game.currentWord + "' class='fallingWord'><div id='word_" + game.currentWord + "_wrapper'><h2>";
	for (let i = 0; i < word.str.length; i++) {
		html += "<span id='word_" + game.currentWord + "_letter_" + i + "'>" + word.str[i] + "</span>";
	}
	html += "</h2></div></div>";
	$("#output").append(html);

	// Randomize y position of new word
	const maxXPos = parseInt(/[0-9]+/.exec($("#game-body").css("width"))[0]) - (word.str.length * 18) - 16;
	const rand = Math.floor(Math.random() * maxXPos) + 10;
	$("#word_" + game.currentWord).css("left", rand);

	game.activeWords.push(word);
	game.currentWord++;

	// If word is not completed before falling off screen
	setTimeout(function(){ game.removeWord(word); }, game.wordLiveTime);
}});

// game.removeWord
Object.defineProperty(game, "removeWord", { value: function(word) {
	if (game.activeWords.indexOf(word) != -1) {
		stats.score--;
		stats.update();

		// Remove word from HTML and from activeWords
		$("#word_" + word.number).remove();
		game.activeWords.splice(game.activeWords.indexOf(word), 1)

		// If the word still matches the current input, currentLetter = 0 (so new words will match)
		if (game.matchingWords.indexOf(word) != -1) {
			if (game.matchingWords.length == 1) { game.currentLetter = 0; }
			game.matchingWords.splice(game.matchingWords.indexOf(word), 1);
		}
	}
}});

// game.resetWord
Object.defineProperty(game, "resetWord", { value: function(word, index) {
	game.missedWords.push(word);

	for (let i = 0; i < game.currentLetter; i++) {
		$("#word_" + word.number + "_letter_" + i).css("color", "black");
		if ($("#word_" + word.number + "_letter_" + i).html() == "_") { $("#word_" + word.number + "_letter_" + i).html(" "); }
	}

	game.matchingWords.splice(index, 1);
}});

// game.completeWord
Object.defineProperty(game, "completeWord", { value: function(word) {
	// Increment score, update stats, reset game vars
	const matchArr = word.str.match(/[ -]/g);
	const wordsInPhrase = (matchArr ? matchArr.length : 0) + 1;
	
	stats.score += wordsInPhrase;
	stats.wordsCompleted += wordsInPhrase;
	stats.hits += word.str.length;
	stats.currentStreak += wordsInPhrase;
	stats.update();

	game.currentLetter = 0;
	game.activeWords.splice(game.activeWords.indexOf(word), 1);
	game.matchingWords = [];
	$("#word_" + word.number).remove();

	// Timer check if screen is empty
	if (game.activeWords.length == 0) {
		stats.emptyStart = Date.now();
	}
}});

// game.wrongKey
Object.defineProperty(game, "wrongKey", { value: function() {
	const animationTime = 150;
	
	// Prohibits further input while animation is playing
	game.ready = false;

	stats.hits += game.currentLetter;
	stats.misses++;
	stats.currentStreak = 0;
	stats.timeOffset += animationTime;  // Removes animation wait time from WPM calculation (so you're not penalized for time spent waiting)
	stats.update();

	game.currentLetter = 0;

	// Missed word animation, game.ready == true when the animation completes
	for (let i = 0; i < game.missedWords.length; i++) {
		$("#word_" + game.missedWords[i].number + "_wrapper").addClass("wordShake");
		setTimeout(function(){ $("#word_" + game.missedWords[i].number + "_wrapper").removeClass("wordShake"); game.ready = true; }, animationTime);
	}
}});

// game.showButtons
Object.defineProperty(game, "showButtons", { value: function() {
	const template = "<div><button class='btn btn-default startGame' id='hipster' data-type='hipster'>Hipster Words</button> &nbsp;&nbsp; " + 
		"<button class='btn btn-default startGame' id='latin' data-type='latin'>Latin Words</button></div>";

	$("#output").addClass("flex").append(template);

	$(".startGame").on("click", function(e){
		if (data.isReady()) {
			// Set source to selected word source, get words from that source
			game.currentSource = $(this).data("type");
			game.sourceWords = data.get(game.currentSource);
			game.start();

			$("#output").removeClass("flex");
			$("#output").empty();
		}
	});
}});