"use strict";

// Stats processing and storage
const user = {
	// User info
	name: null,
	email: null,
	ID: null,  // Generated from email address, unique user ID in Firebase db


	// Methods
	auth: function(){},
		// User sign-in: gives popup for Google login
		// Calls: game.chooseOptions
		// Sets: name, email, id, stats.easyScores, stats.hardScores, stats.insaneScores

	storeScores: function(){}
		// Updates high scores arrays in Firebase DB
};


// Method definitions
Object.defineProperties(user, {
	"auth": { value: function() {
		// First, we perform the signInWithRedirect.
		// Creates the provider object.
		const auth = firebase.auth();
		const provider = new firebase.auth.GoogleAuthProvider();

		// You can add additional scopes to the provider:
		provider.addScope('email');

		// Sign in with redirect:
		auth.signInWithPopup(provider).then(function(result) {
			user.name = result.user.displayName;
			user.email = result.user.email;
			user.ID = user.email.match(/(.*)\./)[1];

			firebase.database().ref("users").once("value").then(function(snapshot) {
				const isNewUser = !snapshot.child(user.ID).exists();

				if (isNewUser) {
					firebase.database().ref("users/" + user.ID).set({
						name: user.name,
						email: user.email
					});
				}

				if (snapshot.child(user.ID + "/easyScores").exists()) {
					stats.easyScoreArr = JSON.parse(snapshot.child(user.ID + "/easyScores").val());
					display.highScores(stats.easyScoreArr, -1);
				}
				if (snapshot.child(user.ID + "/hardScores").exists()) { stats.hardScoreArr = snapshot.child(user.ID + "/hardScores").val(); }
				if (snapshot.child(user.ID + "/insaneScores").exists()) { stats.insaneScoreArr = snapshot.child(user.ID + "/insaneScores").val(); }
			});

			display.loginComplete();
		}), function(error) { throw error; };
	}},

	"storeScores": { value: function() {
		firebase.database().ref("users/" + user.ID).update({
			easyScores: JSON.stringify(stats.easyScoreArr),
			hardScores: JSON.stringify(stats.hardScoreArr),
			insaneScores: JSON.stringify(stats.insaneScoreArr)
		});
	}},
});

Object.seal(user);