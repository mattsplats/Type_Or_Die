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
	wordsCompleted: 0,
	hits: 0,
	misses: 0,
	startTime: 0,  // Game start time for WPM calc
	timeOffset: 0,  // Time removed from WPM calc
	emptyStart: 0,  // Start time when game has no words to match
	scoreMult: 100,  // Multiplier for score display

	// Highscore table vars
	scoreCount: 0,
	numScores: 0,
	maxScores: 5,

	update: function(){},
		// Updates stats shown on page
		// Calls: (none)
		// Sets: score, longestStreak

	reset: function(){},
		// Zeroes out all game stats (except startTime, which is set with each call to game.start)
		// Calls: (none)
		// Sets: all stats except startTime

	push: function(){}
		// Adds current stats as new row to highscore table
		// Calls: (none)
		// Sets: (none)
};


// Method definitions
// stats.update
Object.defineProperty(stats, "update", { value: function() {
	stats.wpm = stats.wordsCompleted / ((Date.now() - stats.startTime - stats.timeOffset) / 1000 / 60) || 0;
	stats.acc = 100 * stats.hits / (stats.hits + stats.misses) || 0;

	if (stats.score < 0) { stats.score = 0; }
	if (stats.currentStreak > stats.longestStreak) { stats.longestStreak = stats.currentStreak; }

	$("#score").html(stats.score * stats.scoreMult);
	$("#wpm").html(stats.wpm.toFixed(1));
	$("#acc").html(stats.hits + " / " + (stats.hits + stats.misses) + " ( " + stats.acc.toFixed(1) + "% )");
	$("#streak").html(stats.currentStreak);
	$("#longest").html(stats.longestStreak);
}});

// stats.reset
Object.defineProperty(stats, "reset", { value: function(){
	stats.score = 0;
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

// stats.push
Object.defineProperty(stats, "push", { value: function(){
	const template = "<tr id='num_" + stats.scoreCount + "''><th class='text-center hipster-text'>" + (stats.score * stats.scoreMult) + "</th>" +
		"<th class='text-center hipster-text'>" + stats.wpm.toFixed(1) + "</th>" +
		"<th class='text-center hipster-text'>" + stats.hits + " / " + (stats.hits + stats.misses) + " ( " + stats.acc.toFixed(1) + "% )" + "</th>" +
		"<th class='text-center hipster-text'>" + stats.longestStreak + "</th>" +
	"</tr>";

	$("#highscore-stats").prepend(template);
	stats.scoreCount++;
	stats.numScores++;

	if (stats.numScores > stats.maxScores) {
		$("#num_" + (stats.scoreCount - stats.maxScores)).remove();
	}
}});