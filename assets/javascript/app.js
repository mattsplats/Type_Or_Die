"use strict";

// Calculate width of text from DOM element or string. By Phil Freo <http://philfreo.com>
$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').appendTo(document.body);
    var htmlText = text || this.val() || this.text();
    htmlText = $.fn.textWidth.fakeEl.text(htmlText).html(); //encode to Html
    htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
    $.fn.textWidth.fakeEl.html(htmlText).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};

// Main game object
let game = {
	// Game state vars
	activeWords: [],  // Words on screen
	matchingWords: [],  // Words still matching input string
	missedWords: [],
	sourceWords: [],  // Available word list built from API (strings only)
	currentLetter: 0,  // Current matching letter for words remaining in matchingWords
	currentWord: 0,  // Used only to give a unique identifier to each word
	currentTimeout: 0,  // Time to next word
	ready: false,

	// Stats vars
	score: 0,
	wordsCompleted: 0,
	bestWpm: 0,
	currentStreak: 0,
	longestStreak: 0,
	hits: 0,
	misses: 0,
	startTime: 0,
	timeOffset: 0,  // Accumulates time the player is not allowed to input characters
	emptyStart: 0,  // Starts counter for time screen is empty

	// Timing & word addition constants
	speedupFactor: 1.015,  // Muliplier for the rate at which new words are added, applies after each added word
	startingTimeout: 3500,  // Msec before first new word is added
	minTimeout: 1000,  // Minimum msec between new words being added
	wordLiveTime: 6700,  // Msec a word remains on screen
	maxWords: 5,  // Most words to be shown on screen at one time

	// Methods
	init: function() {
		game.getMoreWords();
	},

	getMoreWords: function() {
		$.get("http://hipsterjesus.com/api/", { paras: 5, type: "hipster-centric", html: "false" }).done(function(response){
			const str = response.text
				// Lowercase all words with a starting uppercase letter (beginning of sentences)
				.replace(/(\b[A-Z][a-z])/g, function(x){  
					return x.toLowerCase();
				})
				// Replace escaped &amp; with &
				.replace(/(&amp;)/g, "&")
				// Uppercase first letter of these words
				.replace(/(3 wolf moon|kickstarter|helvetica|thundercats|williamsburg|brooklyn|iceland|austin|pabst|master cleanse|echo park|marfa|portland|knausgaard|godard|la croix|four loko|pok pok|edison)/g, function(x){
					let y = x[0].toUpperCase();
					for (let i = 1; i < x.length; i++) {
						x[i - 1] == " " ? y += x[i].toUpperCase() : y += x[i];
					}
					return y;
				});

			// Build initial array of matching words and phrases (checking phrases first)
			const srcArr = str.match(/(you probably haven't heard of them|messenger bag|man braid|man bun|photo booth|banh mi|edison bulb|roof party|single-origin coffee|kale chips|master cleanse|everyday carry|enamel pin|green juice|direct trade|art party|four dollar toast|subway tile|jean shorts|hot chicken|echo park|fanny pack|food truck|shabby chic|craft beer|street art|next level|small batch|four loko|air plant|drinking vinegar|raw denim|copper mug|bicycle rights|tote bag|trust fund|pork belly|activated charcoal|before they sold out|coloring book|la croix|blue bottle|put a bird on it|pok pok|3 wolf moon|deep v|[^.,\n ]{3,})/gi);

			// Remove duplicates and undesired words
			for (let i = 0; i < srcArr.length; i++) {
				if (game.sourceWords.indexOf(srcArr[i]) == -1 && !/cornhole|fap|hell|IPhone/.test(srcArr[i])) {
					game.sourceWords.push(srcArr[i]);
				}
			}

			// Initial game setup when no words are present
			if (!game.ready) {
				game.newWord();

				// Add new words on timer
				game.currentTimeout = game.startingTimeout;
				function anotherWord(){
				    clearTimeout(timer);
				    if (game.activeWords.length < game.maxWords) { game.newWord(); }
				    game.currentTimeout / game.speedupFactor < game.minTimeout ? game.currentTimeout = game.minTimeout : game.currentTimeout /= game.speedupFactor;
				    timer = setTimeout(anotherWord, game.currentTimeout);
				}
				let timer = setTimeout(anotherWord, game.currentTimeout);

				game.updateStats();
				game.startTime = Date.now();
				game.ready = true;
			}
		});
	},

	newWord: function() {
		if (game.emptyStart > 0) {
			game.timeOffset += Date.now() - game.emptyStart;
			game.emptyStart = 0;
		}

		// Create new word object, remove word from sourceWords, get more words if sourceWords is running low
    	const word = {
			str: game.sourceWords[0],
			number: game.currentWord  // Stores the number used in the div and span IDs at HTML creation time
		};
		game.sourceWords.splice(0, 1);
		if (game.sourceWords.length < 10) { game.getMoreWords(); }

		// Create and output series of spans for each character in the word
		let html = "<div id='word_" + game.currentWord + "' class='fallingWord'><div id='word_" + game.currentWord + "_wrapper'><h2>";
		for (let i = 0; i < word.str.length; i++) {
			html += "<span id='word_" + game.currentWord + "_letter_" + i + "'>" + word.str[i] + "</span>";
		}
		html += "</h2></div></div>";
		$("#output").append(html);

		// Randomize y position of new word
		let maxXPos = parseInt(/[0-9]+/.exec($("#game-body").css("width"))[0]) - $.fn.textWidth("<div class='fallingWord'>" + word.str + "</div>") - 100;
		maxXPos = maxXPos < 0 ? 0 : maxXPos;
		const rand = Math.floor(Math.random() * maxXPos);
		$("#word_" + game.currentWord).css("left", rand);

		const index = game.activeWords.length;
		game.activeWords.push(word);
		game.currentWord++;

		// If word is not completed before falling off screen
		setTimeout(function(){
			if (game.activeWords.indexOf(word) != -1) {
				game.score--;
				game.updateStats();

				$("#word_" + word.number).remove();
				game.activeWords.splice(game.activeWords.indexOf(word), 1)

				if (game.matchingWords.indexOf(word) != -1) {
					if (game.matchingWords.length == 1) { game.currentLetter = 0; }
					game.matchingWords.splice(game.matchingWords.indexOf(word), 1);
				}
			}
		}, game.wordLiveTime); 
	},

	completeWord: function(word) {
		// Increment score, update stats, reset game vars
		const matchArr = word.str.match(/[ -]/g);
		const wordsInPhrase = (matchArr ? matchArr.length : 0) + 1;
		
		game.score += wordsInPhrase;
		game.wordsCompleted++;
		game.hits += word.str.length;
		game.currentStreak += wordsInPhrase;
		game.updateStats();

		game.currentLetter = 0;
		game.matchingWords = [];

		game.activeWords.splice(game.activeWords.indexOf(word), 1);
		$("#word_" + word.number).remove();

		// Timer check if screen is empty
		if (game.activeWords.length == 0) {
			game.emptyStart = Date.now();
		}
	},

	resetWordHtml: function(word) {
		for (let i = 0; i < game.currentLetter; i++) {
			$("#word_" + word.number + "_letter_" + i).css("color", "black");
		}
	},

	wrongKey: function() {
		// Removes animation wait time from WPM calculation (so you're not penalized for time spent waiting)
		const animationTime = 150;
		game.timeOffset += animationTime;

		// Game state and stats update, game.ready == false so no letters can be input while word animation is playing
		game.ready = false;
		game.hits += game.currentLetter;
		game.misses++;
		game.currentStreak = 0;

		// Missed word animation, game.ready == true when the animation completes
		for (let i = 0; i < game.missedWords.length; i++) {
			// Underline removal
			for (let j = 0; j < game.missedWords[i].str.length; j++) {
				if ($("#word_" + game.missedWords[i].number + "_letter_" + j).html() == "_") { $("#word_" + game.missedWords[i].number + "_letter_" + j).html(" "); }
			}
			$("#word_" + game.missedWords[i].number + "_wrapper").addClass("wordShake");
			setTimeout(function(){ $("#word_" + game.missedWords[i].number + "_wrapper").removeClass("wordShake"); }, animationTime);
		}

		game.currentLetter = 0;
		game.updateStats();

		setTimeout(function(){ game.ready = true; }, animationTime);
	},

	updateStats: function() {
		// Words per minute and accuracy calculations, based stored stats and current time
		const wpm = game.wordsCompleted / ((Date.now() - game.startTime - game.timeOffset) / 1000 / 60) || 0;
		const acc = 100 * game.hits / (game.hits + game.misses) || 0;

		if (game.score < 0) { game.score = 0; }
		if (game.currentStreak > game.longestStreak) { game.longestStreak = game.currentStreak; }
		if (wpm > game.bestWpm) { game.bestWpm = wpm; }

		$("#score").html("<h3>Score: " + (game.score * 100) + "</h3>");
		$("#wpm").html("WPM: " + wpm.toFixed(1) + "<br/>Best WPM: " + game.bestWpm.toFixed(1));
		$("#acc").html("Accuracy: " + game.hits + " / " + (game.hits + game.misses) + " ( " + acc.toFixed(1) + "% )");
		$("#streak").html("Current streak: " + game.currentStreak + "<br/>Longest streak: " + game.longestStreak);

		console.log(game.timeOffset);
	}
};

// Onload block
$(function() {

	// Main input processing function (on any keypress)
	$(document).on("keypress", function(e) {
		// Prevent spacebar from scrolling the page
		if (String.fromCharCode(e.which) == " ") { e.preventDefault(); }

		// If game is ready for input and keystroke is on the allowed list
		if (game.ready && /./.test(String.fromCharCode(e.which))) {
			game.missedWords = [];  // Keeps an array of all remaining possible matches that miss this cycle

			// If checkWords is empty, copy all words from activeWords
			if (game.matchingWords.length == 0) { game.matchingWords = game.activeWords.slice(); }

			// Check all remaining words in checkingWords for matches
			for (let i = 0; i < game.matchingWords.length; i++) {
				const word = game.matchingWords[i];

				// If the latest keystroke matches the current letter, make it red, and replace spaces with underlines
				if (word.str[game.currentLetter] == String.fromCharCode(e.which)) {
					$("#word_" + word.number + "_letter_" + game.currentLetter).css("color", "red");
					if (word.str[game.currentLetter] == " ") { $("#word_" + word.number + "_letter_" + game.currentLetter).html("_"); }
				} else {
					// Add word to missedWords, reset letter colors, remove word from matchingWords, decrement loop counter
					game.missedWords.push(word);
					game.resetWordHtml(word);
					game.matchingWords.splice(i, 1);
					i--;
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

	// Clear stats button - resets all stats to zero
	$("#clearStats").on("click", function(e){
		game.score = 0;
		game.bestWpm = 0;
		game.currentStreak = 0;
		game.longestStreak = 0;
		game.hits = 0;
		game.misses = 0;
		game.startTime = Date.now();
		game.timeOffset = 0;
		game.updateStats();
	});

	game.init();
});