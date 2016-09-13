// Main game object
let game = {
	// Game state vars
	activeWords: [],  // Words on screen
	matchingWords: [],  // Words still matching input string
	sourceWords: [],  // Available word list built from API (strings only)
	currentLetter: 0,
	ready: false,

	// Stats vars
	score: 0,
	bestWpm: 0,
	currentStreak: 0,
	longestStreak: 0,
	hits: 0,
	misses: 0,
	startTime: 0,
	timeOffset: 0,  // Accumulates time the player is not allowed to input characters

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
				.replace(/(3 wolf moon|kickstarter|helvetica|thundercats|williamsburg|brooklyn|iceland|austin|pabst|master|cleanse|echo park|marfa|portland|knausgaard|godard|la croix|four loko|pok pok|edison)/g, function(x){
					let y = x[0].toUpperCase();
					for (let i = 1; i < x.length; i++) {
						x[i - 1] == " " ? y += x[i].toUpperCase() : y += x[i];
					}
					return y;
				});

			// Build initial array of matching words and phrases (checking phrases first)
			const srcArr = str.match(/(you probably haven't heard of them|man braid|man bun|photo booth|banh mi|edison bulb|roof party|single-origin coffee|kale chips|master cleanse|everyday carry|enamel pin|green juice|direct trade|art party|four dollar toast|subway tile|jean shorts|hot chicken|echo park|fanny pack|food truck|shabby chic|craft beer|street art|next level|small batch|four loko|air plant|drinking vinegar|raw denim|copper mug|bicycle rights|tote bag|trust fund|pork belly|activated charcoal|before they sold out|coloring book|la croix|blue bottle|put a bird on it|pok pok|3 wolf moon|deep v|[^.,\n ]{3,})/gi);
			
			console.log(srcArr);

			// Remove duplicates and undesired words
			for (let i = 0; i < srcArr.length; i++) {
				if (game.sourceWords.indexOf(srcArr[i]) == -1 && !/cornhole|fap|hell/.test(srcArr[i])) {
					game.sourceWords.push(srcArr[i]);
				}
			}

			console.log(game.sourceWords);

			// Initial game setup when no words are present
			if (game.activeWords.length == 0) {
				game.newWord(0);
				game.newWord(1);
				game.newWord(2);
				game.updateStats();
				game.startTime = Date.now();
				game.ready = true;
			}
		});
	},

	newWord: function(index) {
		// If word is replacing an existing word (a word was completed), increment score, update stats, reset game vars
		if (game.activeWords[index]) {
			const matchArr = game.activeWords[index].str.match(/[ -]/g);
			const wordsCompleted = (matchArr ? matchArr.length : 0) + 1;
			
			game.score += wordsCompleted;
			game.hits += game.currentLetter;
			game.currentStreak += wordsCompleted;
			game.updateStats();

			game.currentLetter = 0;
			game.matchingWords = [];	
		}

		// Create new word object, remove word from sourceWords, get more words if sourceWords is running low
  		// Word.number stores the number used in the span IDs at HTML creation time (for later modification)
    	const word = {
			str: game.sourceWords[0],
			number: index
		};
		game.sourceWords.splice(0, 1);
		if (game.sourceWords.length < 10) { game.getMoreWords(); }

		// Create and output series of spans for each character in the word
		let html = "<h2>";
		for (let i = 0; i < word.str.length; i++) {
			html += "<span id='word_" + index + "_letter_" + i + "'>" + word.str[i] + "</span>";
		}
		html += "</h2>";
		$("#out_" + index).html(html);

		// Add word to activeWords, allow keyboard input
		game.activeWords[index] = word;
		// game.ready = true;
	},

	resetWordHtml: function(word) {
		for (let i = 0; i < game.currentLetter; i++) {
			$("#word_" + word.number + "_letter_" + i).css("color", "black");
		}
	},

	wrongKey: function(wordList) {
		// Removes animation wait time from WPM calculation (so you're not penalized for time spent waiting)
		const animationTime = 110;
		game.timeOffset += animationTime;

		// Game state and stats update, game.ready == false so no letters can be input while word animation is playing
		game.ready = false;
		game.hits += game.currentLetter;
		game.misses++;
		game.currentStreak = 0;

		// Missed word animation, game.ready == true when the animation completes
		for (let i = 0; i < wordList.length; i++) {
			$("#out_" + wordList[i].number).css("left", -3);
			setTimeout(function(){ $("#out_" + wordList[i].number).css("left", 6); }, 30);
			setTimeout(function(){ $("#out_" + wordList[i].number).css("left", -6); }, 70);
			setTimeout(function(){ $("#out_" + wordList[i].number).css("left", 3); }, 100);
			setTimeout(function(){ $("#out_" + wordList[i].number).css("left", 0); game.ready = true; }, animationTime);
		}

		game.currentLetter = 0;
		game.updateStats();
	},

	updateStats: function() {
		// Words per minute and accuracy calculations, based stored stats and current time
		const wpm = game.score / ((Date.now() - game.startTime - game.timeOffset) / 1000 / 60) || 0;
		const acc = 100 * game.hits / (game.hits + game.misses) || 0;

		if (game.currentStreak > game.longestStreak) { game.longestStreak = game.currentStreak; }
		if (wpm > game.bestWpm) { game.bestWpm = wpm; }

		$("#score").html("<h3>Score: " + (game.score * 10) + "</h3>");
		$("#wpm").html("WPM: " + wpm.toFixed(1) + "<br/>Best WPM: " + game.bestWpm.toFixed(1));
		$("#acc").html("Accuracy: " + game.hits + " / " + (game.hits + game.misses) + " ( " + acc.toFixed(1) + "% )");
		$("#streak").html("Current streak: " + game.currentStreak + "<br/>Longest streak: " + game.longestStreak);
	}
};

// Onload block
$(function() {

	// Main input processing function (on any keypress)
	$(document).on("keypress", function(e) {
		// If game is ready for input and keystroke is on the allowed list
		if (game.ready && /./.test(String.fromCharCode(e.which))) {
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
				// *NOTE: assumes no two words in activeWords are identical*
				if (game.currentLetter == game.matchingWords[0].str.length) {
					game.newWord(game.matchingWords[0].number);
				}
			}
			else {
				game.wrongKey(missedWords);
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