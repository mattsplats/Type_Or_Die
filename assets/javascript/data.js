"use strict";

// Data acquisition, processing, and storage (i.e. word lists)
const data = {
	// Word lists from APIs
	hipsterWords: [],
	latinWords: [],
	baconWords: [],
	randomWords: [],

	// Methods
	isReady: function(){},
		// Returns boolean ready state of word lists (true === all lists populated, game can start)
		// Calls: (none)
		// Sets: (none)

	get: function(source){},
		// Returns word list from requested source (if source === all, updates all lists and returns null)
		// Calls: (none)
		// Sets: any or all data.Words properties
};


// Method definitions
Object.defineProperties(data, {
	"isReady": { value: function() {
		return (data.hipsterWords.length && data.latinWords.length && data.baconWords.length && data.randomWords.length);
	}},

	"get": { value: function(source) {
		switch (source) {
			case "hipster": hipster(); return data.hipsterWords;
			case "latin": latin(); return data.latinWords;
			case "bacon": bacon(); return data.baconWords;
			case "random": random(); return data.randomWords;
			case "all": hipster(); latin(); bacon(); random(); return null;
		}

		// hipsterjesus.com XHR/processing
		function hipster() {
			$.get("http://hipsterjesus.com/api/", { paras: 5, type: "hipster-centric", html: "false" }).done(function(response){
				const str = response.text
					// Lowercase all words with a starting uppercase letter (beginning of sentences)
					.replace(/(\b[A-Z][a-z])/g, function(x){  
						return x.toLowerCase();
					})
					// Replace escaped &amp; with &
					.replace(/(&amp;)/g, "&")
					// Uppercase first letter of these words
					.replace(/(3 wolf moon|lyft|etsy|kickstarter|helvetica|thundercats|williamsburg|brooklyn|iceland|austin|pabst|master cleanse|echo park|marfa|portland|knausgaard|godard|la croix|four loko|pok pok|edison)/g, function(x){
						let y = x[0].toUpperCase();
						for (let i = 1; i < x.length; i++) {
							x[i - 1] === " " ? y += x[i].toUpperCase() : y += x[i];
						}
						return y;
					});

				// Build initial array of matching words and phrases (checking phrases first)
				const srcArr = str.match(/(you probably haven't heard of them|messenger bag|man braid|man bun|photo booth|banh mi|edison bulb|roof party|single-origin coffee|kale chips|master cleanse|everyday carry|enamel pin|green juice|direct trade|art party|four dollar toast|subway tile|jean shorts|hot chicken|echo park|fanny pack|food truck|shabby chic|craft beer|street art|next level|small batch|four loko|air plant|drinking vinegar|raw denim|copper mug|bicycle rights|tote bag|trust fund|pork belly|activated charcoal|before they sold out|coloring book|la croix|blue bottle|put a bird on it|pok pok|3 wolf moon|deep v|[^.,\n ]{3,})/gi);

				// Remove duplicates and undesired words
				for (let i = 0; i < srcArr.length; i++) {
					if (data.hipsterWords.indexOf(srcArr[i]) === -1 && !/cornhole|fap|hell|IPhone/.test(srcArr[i])) {
						data.hipsterWords.push(srcArr[i]);
					}
				}
			});
		}

		// lorem ipsum XHR/processing
		function latin() {
			$.get("http://www.randomtext.me/api/lorem/p-1/100").done(function(response){
				// Lowercase all words with a starting uppercase letter (beginning of sentences)
				const str = response.text_out.replace(/(\b[A-Z][a-z])/g, function(x){ return x.toLowerCase(); });

				// Build initial array of matching words and phrases (checking phrases first)
				const srcArr = str.match(/([^.,\n<>/ ]{3,})/g);

				// Remove duplicates
				for (let i = 0; i < srcArr.length; i++) {
					if (data.latinWords.indexOf(srcArr[i]) === -1 && !/lorem|ipsum/.test(srcArr[i])) {
						data.latinWords.push(srcArr[i]);
					}
				}
			});
		}

		// bacon ipsum XHR/processing
		function bacon() {
			$.get("https://baconipsum.com/api/", { type: "all-meat", sentences: "5" }).done(function(response){ 
				// Lowercase all words with a starting uppercase letter (beginning of sentences)
				const str = response[0].replace(/(\b[A-Z][a-z])/g, function(x){ return x.toLowerCase(); });

				// Build initial array of matching words and phrases (checking phrases first)
				const srcArr = str.match(/(pork ribs|beef ribs|pork chop|pork loin|pork belly|beef jerky|corned beef|ham hock|spare ribs|short ribs|short loin|strip steak|filet mignon|ground round|ball tip|[^.,\n/ ]{3,})/g);

				// Remove duplicates and undesired words
				for (let i = 0; i < srcArr.length; i++) {
					if (data.baconWords.indexOf(srcArr[i]) === -1 && !/kevin/.test(srcArr[i])) {
						data.baconWords.push(srcArr[i]);
					}
				}
			});
		}

		// randomWord XHR/processing
		function random() {
			let counter = 0;
			getWord();

			function getWord() {
				$.get("http://www.setgetgo.com/randomword/get.php").done(function(response){ 
					if (data.randomWords.indexOf(response) === -1) { data.randomWords.push(response); }
					counter++;
					if (counter < 50) { getWord(); }
				});
			}
		}
	}}
});

Object.seal(data);