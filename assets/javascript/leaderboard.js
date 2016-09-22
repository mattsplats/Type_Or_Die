"use strict";

// Leaderboard display
const leaderboard = {
	hiScoreTime: 80,  // Timeout delay for each new shown high score row


	// Methods
	init: function(){}
		// Displays leaderboard
};


// Method definitions
Object.defineProperties(leaderboard, {
	"init": { value: function() {
		firebase.database().ref("leaderboard").once("value").then(function(snapshot) {
			const heading = "\
				<th class='text-center hipster-text'>Score:</th>\
				<th class='text-center hipster-text'>WPM:</th>\
				<th class='text-center hipster-text'>Accuracy %:</th>\
				<th class='text-center hipster-text'>Longest Streak:</th>"
			$("#leaderboard-heading").html($("<tr>").html(heading).fadeIn());

			const leaderboard = JSON.parse(snapshot.val());
			for (let i = 0; i < leaderboard.length; i++) {
				setTimeout(function() { $("#leaderboard-stats").append($("<tr>").html(leaderboard[i].html).fadeIn()) }, i * 80);
			}
		});
	}}
});