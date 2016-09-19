"use strict";

// Data acquisition, processing, and storage (i.e. word lists)
const data = {
	// Word lists from APIs
	hipsterWords: [],
	latinWords: [],

	// Methods
	isReady: function(){},
		// Returns boolean ready state of word lists (true == all lists populated, game can start)
		// Calls: (none)
		// Sets: (none)

	get: function(source){},
		// Returns word list from requested source (if source == all, updates all lists and returns null)
		// Calls: (none)
		// Sets: any or all data.Words properties
};


// Method definitions
// data.isReady
Object.defineProperty(data, "isReady", { value: function() {
	return (data.hipsterWords.length && data.latinWords.length);
}});

// data.get
Object.defineProperty(data, "get", { value: function(source) {
	switch (source) {
		case "hipster": hipster(); return data.hipsterWords;
		case "latin": latin(); return data.latinWords;
		case "all":
			hipster();
			latin();
			return null;
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
						x[i - 1] == " " ? y += x[i].toUpperCase() : y += x[i];
					}
					return y;
				});

			// Build initial array of matching words and phrases (checking phrases first)
			const srcArr = str.match(/(you probably haven't heard of them|messenger bag|man braid|man bun|photo booth|banh mi|edison bulb|roof party|single-origin coffee|kale chips|master cleanse|everyday carry|enamel pin|green juice|direct trade|art party|four dollar toast|subway tile|jean shorts|hot chicken|echo park|fanny pack|food truck|shabby chic|craft beer|street art|next level|small batch|four loko|air plant|drinking vinegar|raw denim|copper mug|bicycle rights|tote bag|trust fund|pork belly|activated charcoal|before they sold out|coloring book|la croix|blue bottle|put a bird on it|pok pok|3 wolf moon|deep v|[^.,\n ]{3,})/gi);

			// Remove duplicates and undesired words
			for (let i = 0; i < srcArr.length; i++) {
				if (data.hipsterWords.indexOf(srcArr[i]) == -1 && !/cornhole|fap|hell|IPhone/.test(srcArr[i])) {
					data.hipsterWords.push(srcArr[i]);
				}
			}
		});
	}

	// lorem ipsum XHR/processing
	function latin() {
		$.get("http://www.randomtext.me/api/lorem/p-1/100").done(function(response){ 
			data.latinWords = response.text_out.match(/([^.,\n<>/ ]{3,})/g);
		});
	}
}});