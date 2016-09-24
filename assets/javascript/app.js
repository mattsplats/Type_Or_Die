"use strict";

$(document.body).prepend($("<div>").addClass("bg").css("background-image", "url(assets/images/default.jpg)"));
$(document.body).prepend($("<div>").addClass("bg").css("background-image", "url(assets/images/bacon.jpg)"));
$(document.body).prepend($("<div>").addClass("bg").css("background-image", "url(assets/images/hipster.jpg)"));
$(document.body).prepend($("<div>").addClass("bg").css("background-image", "url(assets/images/insane.jpg)"));
$(".bg").remove();

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