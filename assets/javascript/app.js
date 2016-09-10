// Main game object
let game = {
	word: "",
	wordOutput: ""
};

// On load
$(function() {
	$("#button").on("click", function(event) {
		game.word = $("#input").html();
		for (const letter of word) {
			wordOutput += "<span>" + letter + "</span>";
		}
		$("#output") = wordOutput;
	});
});