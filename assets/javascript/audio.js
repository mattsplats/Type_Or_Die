"use strict";

// Updates to display
const audio = {
	// SFX
	completeWord: new Audio("assets/ding.mp3"),


	// Methods
	play: function(state){},
		// Play audio for given game state
		// Sets: property for targeted Audio object
};


// Method definitions
Object.defineProperties(audio, {
	"play": { value: function(state) {
		switch (state) {
			case "completeWord": completeWord(); break;
		}

		function completeWord() {
			audio.completeWord.play();
			audio.completeWord = new Audio("assets/ding.mp3");
		}
	}},
});

Object.seal(audio);