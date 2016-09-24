"use strict";

// On page load
$(function() {
	// Initialize Firebase
	const config = {
		apiKey: "AIzaSyDM9yXN5XfGo_atATfz8E9eoJpBM84o9sE",
		authDomain: "typinggame-5649e.firebaseapp.com",
		databaseURL: "https://typinggame-5649e.firebaseio.com",
		storageBucket: "typinggame-5649e.appspot.com",
		messagingSenderId: "271779327937"
	};
	firebase.initializeApp(config);


	// Initialize appropriate page
	switch (document.title) {
		case "Type or Die: Game": game.init(); break;
		case "Type or Die: Leaderboard": leaderboard.init(); break;
	}
});