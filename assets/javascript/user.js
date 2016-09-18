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
		// Calls: stats.setHighScores
		// Sets: name, email, id

	storeScores: function(scoreArr){}
		// Updates stats shown on page
		// Calls: stats.setHighScores
		// Sets: (none)
};


// Method definitions
// user.auth
Object.defineProperty(user, "auth", { value: function() {
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
			const hasScores = snapshot.child(user.ID + "/highScores").exists();

			if (isNewUser) {
				firebase.database().ref("users/" + user.ID).set({
					name: user.name,
					email: user.email
				});
			} else if (hasScores) {
				stats.setHighScores(snapshot.child(user.ID + "/highScores").val());
			}
		});
	}), function(error) { throw error; };
}});

// user.storeScores
Object.defineProperty(user, "storeScores", { value: function(highScores) {
	firebase.database().ref("users/" + user.ID).set({ highScores });
}});