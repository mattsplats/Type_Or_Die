"use strict";

// Stats processing and storage
const stats = {
	// Primary stats
	score: 0,
	wpm: 0,
	acc: 0,
	currentStreak: 0,
	longestStreak: 0,

	// Secondary vars
	hits: 0,
	misses: 0,
	scoreMultiplier: 1,
	scoreDelta: 0,  // Amouent added/removed from score on latest update
	startTime: 0,  // Game start time for WPM calc
	timeOffset: 0,  // Time removed from WPM calc
	emptyStart: 0,  // Start time when game has no words to match

	// Constants
	scorePlusMult: 100,  // Score multiplier for completing a word
	scoreMinusMult: 25,  // Score multiplier for not completing a word
	doublePoint: 3,  // Breakpoints for multiplier increases (i.e. if streak = doublePoint, scoreMultiplier == 2, etc.)
	triplePoint: 6,
	quadPoint: 10,
	quintPoint: 15,

	// Highscore table vars
	easyScoreArr: [],
	hardScoreArr: [],
	insaneScoreArr: [],
	maxScores: 5,
	maxLeaderboardScores: 10,

	update: function(){},
		// Updates stats shown on page
		// Calls: (none)
		// Sets: score, longestStreak

	reset: function(){},
		// Zeroes out all game stats (except startTime, which is set with each call to game.start)
		// Calls: (none)
		// Sets: all stats except startTime

	addHighScore: function(){},
		// Adds current stats as new row to highscore table for given difficulty, stores data, updates leaderboard
		// Calls: user.storeScores
		// Sets: (none)

	setHighScores: function(scoreArr, difficulty){}
		// Sets retrieved high score data
		// Calls: (none)
		// Sets: appropriate scoreArr
};


// Method definitions
Object.defineProperties(stats, {
	"update": { value: function() {
		stats.wpm = (stats.hits / 5.1) / ((Date.now() - stats.startTime - stats.timeOffset) / 1000 / 60) || 0;
		stats.acc = 100 * stats.hits / (stats.hits + stats.misses) || 0;

		if (stats.score < 0) { stats.score = 0; }
		if (stats.currentStreak > stats.longestStreak) { stats.longestStreak = stats.currentStreak; }

		// Increases score multiplier if currentStreak has passed breakpoints
		switch (stats.currentStreak) {
			case stats.doublePoint:
			case stats.triplePoint:
			case stats.quadPoint:
			case stats.quintPoint: stats.scoreMultiplier++; break;
		}

		display.stats();
	}},

	"reset": { value: function() {
		stats.score = 0;
		stats.scoreMultiplier = 1;
		stats.scoreDelta = 0;
		stats.wpm = 0;
		stats.acc = 0;
		stats.currentStreak = 0;
		stats.longestStreak = 0;

		stats.wordsCompleted = 0;
		stats.hits = 0;
		stats.misses = 0;
		stats.timeOffset = 0;
		stats.emptyStart = 0;
	}},

	"addHighScore": { value: function() {
		// Update appropriate scores and display
		updateScores();

		if (user.email) {
			// Store all user score arrays
			user.storeScores();

			// Leaderboard update
			firebase.database().ref("leaderboard/" + game.currentDifficulty).once("value").then(function(snapshot) {
				let board = JSON.parse(snapshot.val()) || [];
				scoreObj.player = user.name;
				board.push(scoreObj);
				board.sort(function(a, b) {
					if (a.score != b.score) { return b.score - a.score; }
					else { return b.wpm - a.wpm }
				});
				if (board.length > stats.maxLeaderboardScores) { board.pop(); }
				firebase.database().ref("leaderboard/" + game.currentDifficulty).set(JSON.stringify(board));
			});
		}

		function updateScores() {
			const scoreObj = {
				score: stats.score,
				wpm: stats.wpm,
				acc: stats.acc,
				hits: stats.hits,
				misses: stats.misses,
				longestStreak: stats.longestStreak,
				source: game.currentSource
			};

			let arr;
			switch (game.currentDifficulty) {
				case "easy": arr = stats.easyScoreArr;  break;
				case "hard": arr = stats.hardScoreArr;  break;
				case "insane": arr = stats.insaneScoreArr;  break;
			}

			// Add new high score to array and sort
			arr.push(scoreObj);
			arr.sort(function(a, b) {
				if (a.score != b.score) { return b.score - a.score; }
				else { return b.wpm - a.wpm }
			});

			// Remove lowest score if we have more than maxScores scores
			if (arr.length > stats.maxScores) { arr.pop(); }

			// Display new scores (uses index of added high score)
			display.highScores(arr, arr.indexOf(scoreObj));
		}
	}}
});