"use strict";

// Updates to display
const audio = {
	// SFX objects
	easy: { 
		intro: new Audio("assets/sfx/easy/intro.mp3"),
		hit: new Audio("assets/sfx/easy/hit.mp3"),
		remove: new Audio("assets/sfx/easy/remove.mp3"),
		complete: new Audio("assets/sfx/easy/complete.mp3"),
		over: new Audio("assets/sfx/easy/over.mp3")
	},

	hard: {
		intro: new Audio("assets/sfx/hard/intro.mp3"),
		hit: new Audio("assets/sfx/hard/hit.mp3"),
		remove: new Audio("assets/sfx/hard/remove.mp3"),
		complete: new Audio("assets/sfx/hard/complete.mp3"),
		over: new Audio("assets/sfx/hard/over.mp3")
	},

	insane: {
		intro: new Audio("assets/sfx/insane/intro.mp3"),
		hit: new Audio("assets/sfx/insane/hit.mp3"),
		remove: new Audio("assets/sfx/insane/remove.mp3"),
		complete: new Audio("assets/sfx/insane/complete.mp3"),
		over: new Audio("assets/sfx/insane/over.mp3")
	},


	// Methods
	play: function(state){},
		// Play audio for given game state
		// Sets: property for targeted Audio object

	pause: function(state){},
	// Stop audio for given game state
};


// Method definitions
Object.defineProperties(audio, {
	"play": { value: function(state) {
		audio[game.currentDifficulty][state] = new Audio("assets/sfx/" + game.currentDifficulty + "/" + state + ".mp3");
		audio[game.currentDifficulty][state].play();
	}},

	"pause": { value: function(state) {
		audio[game.currentDifficulty][state].pause();
	}}
});

Object.seal(audio);