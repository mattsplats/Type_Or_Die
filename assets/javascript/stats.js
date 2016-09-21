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
	scoreDelta: 0,  // Amouent added/removed from score on latest update
	startTime: 0,  // Game start time for WPM calc
	timeOffset: 0,  // Time removed from WPM calc
	emptyStart: 0,  // Start time when game has no words to match

	// Constants
	scorePlusMult: 100,  // Score multiplier for completing a word
	scoreMinusMult: 25,  // Score multiplier for not completing a word

	// Highscore table vars
	scoreArr: [],
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
		// Adds current stats as new row to highscore table, stores data, updates leaderboard
		// Calls: user.storeScores
		// Sets: (none)

	setHighScores: function(highScores){}
		// Shows retrieved high score data in highscore table
		// Calls: (none)
		// Sets: scoreArr
};


// Method definitions
// stats.update
Object.defineProperty(stats, "update", { value: function() {
	stats.wpm = (stats.hits / 5.1) / ((Date.now() - stats.startTime - stats.timeOffset) / 1000 / 60) || 0;
	stats.acc = 100 * stats.hits / (stats.hits + stats.misses) || 0;

	if (stats.score < 0) { stats.score = 0; }
	if (stats.currentStreak > stats.longestStreak) { stats.longestStreak = stats.currentStreak; }

	$("#score").html(stats.score);
	$("#score-diff").html($("<span>").html((stats.scoreDelta > 0 ? "+" : "") + (stats.scoreDelta != 0 ? stats.scoreDelta : ""))
		.css("color", stats.scoreDelta > 0 ? "green" : "red").fadeIn().fadeOut());
	$("#wpm").html(stats.wpm.toFixed(1));
	$("#acc").html(stats.hits + " / " + (stats.hits + stats.misses) + " ( " + stats.acc.toFixed(1) + "% )");
	$("#streak").html(stats.currentStreak);
	$("#longest").html(stats.longestStreak);
}});

// stats.reset
Object.defineProperty(stats, "reset", { value: function() {
	stats.score = 0;
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
}});

// stats.addHighScore
Object.defineProperty(stats, "addHighScore", { value: function() {
	const template = "<tr><th class='text-center hipster-text'>" + (stats.score) + "</th>" +
		"<th class='text-center hipster-text'>" + stats.wpm.toFixed(1) + "</th>" +
		"<th class='text-center hipster-text'>" + stats.hits + " / " + (stats.hits + stats.misses) + " ( " + stats.acc.toFixed(1) + "% )" + "</th>" +
		"<th class='text-center hipster-text'>" + stats.longestStreak + "</th>" +
	"</tr>";

	const scoreObj = {
		html: template,
		score: stats.score,
		wpm: stats.wpm,
		acc: stats.acc,
		longestStreak: stats.longestStreak
	};

	// Add new high score to array and sort
	stats.scoreArr.push(scoreObj);
	stats.scoreArr.sort(function(a, b) {
		if (a.score != b.score) { return b.score - a.score; }
		else { return b.wpm - a.wpm }
	});

	// Remove lowest score if we have more than maxScores scores
	if (stats.scoreArr.length > stats.maxScores) { stats.scoreArr.pop(); }

	// Display new scores
	$("#highscore-stats").empty();
	for (let i = 0; i < stats.scoreArr.length; i++) {
		$("#highscore-stats").append(stats.scoreArr[i].html);
	}

	// Store score array via stringify
	user.storeScores(JSON.stringify(stats.scoreArr));

	// Leaderboard update
	firebase.database().ref("leaderboard").once("value").then(function(snapshot) {
		let board = JSON.parse(snapshot.val()) || [];
		board.push(scoreObj);
		board.sort(function(a, b) {
			if (a.score != b.score) { return b.score - a.score; }
			else { return b.wpm - a.wpm }
		});
		if (board.length > stats.maxLeaderboardScores) { board.pop(); }
		firebase.database().ref("leaderboard").set(JSON.stringify(board));
	});
}});

// stats.setHighScores
Object.defineProperty(stats, "setHighScores", { value: function(highScores) {
	stats.scoreArr = JSON.parse(highScores);

	$("#highscore-stats").empty();
	for (let i = 0; i < stats.scoreArr.length; i++) {
		$("#highscore-stats").append(stats.scoreArr[i].html);
	}
}});