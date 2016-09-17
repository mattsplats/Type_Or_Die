"use strict";	

// Stats processing and storage
let stats = {
	score: 0,
	wordsCompleted: 0,
	currentStreak: 0,
	longestStreak: 0,
	hits: 0,
	misses: 0,
	startTime: 0,  // Game start time for WPM calc
	timeOffset: 0,  // Time removed from WPM calc
	emptyStart: 0,  // Start time when game has no words to match

	update: function(){},
		// Updates stats shown on page
		// Calls: (none)
		// Sets: score, longestStreak

	reset: function(){}
		// Zeroes out all game stats (except startTime, which is set with each call to game.start)
		// Calls: (none)
		// Sets: all stats except startTime
};


// Method definitions
// stats.update
Object.defineProperty(stats, "update", { value: function() {
	const wpm = stats.wordsCompleted / ((Date.now() - stats.startTime - stats.timeOffset) / 1000 / 60) || 0;
	const acc = 100 * stats.hits / (stats.hits + stats.misses) || 0;

	if (stats.score < 0) { stats.score = 0; }
	if (stats.currentStreak > stats.longestStreak) { stats.longestStreak = stats.currentStreak; }

	$("#score").html(stats.score * 100);
	$("#wpm").html(wpm.toFixed(1));
	$("#acc").html(stats.hits + " / " + (stats.hits + stats.misses) + " ( " + acc.toFixed(1) + "% )");
	$("#streak").html(stats.currentStreak);
	$("#longest").html(stats.longestStreak);
}});

// stats.reset
Object.defineProperty(stats, "reset", { value: function(){
	stats.score = 0;
	stats.wordsCompleted = 0;
	stats.currentStreak = 0;
	stats.longestStreak = 0;
	stats.hits = 0;
	stats.misses = 0;
	stats.timeOffset = 0;
	stats.emptyStart = 0;
}});