// Main game object
let game = {
	// Properties
	isWord: false,
	score: 0,

	// Word vars
	currentLetter: 0,
	word: "",
	wordArr: [],
	wordOutput: "",

	// Timing vars
	startTime: Date.now(),

	// Methods
	init: function() {
		game.newWord();
	},

	newWord: function() {
		$.ajax({
            url: "http://www.setgetgo.com/randomword/get.php",
            method: "GET"
        }).done(function(response){
        	game.word = response;
			game.wordArr = [];
			game.wordOutput = "";
			game.currentLetter = 0;

			game.wordOutput += "<h2>";

			let i = 0;
			for (const letter of game.word) {
				game.wordArr.push(letter.toUpperCase());
				game.wordOutput += "<span id=letter_" + i + ">" + letter + "</span>";
				i++;
			}

			game.wordOutput += "</h2>";

			$("#output").html(game.wordOutput);
			$("#score").html("<h3>" + game.score + "</h3>");
			if (game.score > 0) {
				const wpm = (game.score / 10) / ((Date.now() - game.startTime) / 1000 / 60);
				$("#wpm").html(wpm.toFixed(1));
			}
			game.isWord = true;     	
        });
	}
};

// On load
$(function() {
	$(document).on("keyup", function(event) {
		if (game.isWord && (event.which >= 65) && (event.which <= 90)) {
			if (game.wordArr[game.currentLetter] == String.fromCharCode(event.which)) {
				$("#letter_" + game.currentLetter).css("color", "red");
				game.currentLetter++;
				if (game.currentLetter == game.word.length) {
					game.newWord();
					game.score += 10;
				}
			} else {
				for (let i = 0; i < game.wordArr.length; i++) {
					$("#letter_" + i).css("color", "black");
				}
				game.currentLetter = 0;
				$("#output").css("left", -3);
				setTimeout(function(){ $("#output").css("left", 6); }, 80);
				setTimeout(function(){ $("#output").css("left", -6); }, 160);
				setTimeout(function(){ $("#output").css("left", 3); }, 240);
			}
		}
	});

	game.init();
});