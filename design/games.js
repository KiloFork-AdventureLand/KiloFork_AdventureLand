var games={
	"tarot":{
		"npc":"twitch",
		"cards":["chariot","death","devil","emperor","empress","fool","fortune","hangman","hermit","hierophant","judgment","justice","lovers","magician","moon","priestess","star","strength","sun","temperance","theworld","tower"],
		"hours":23,
	},
	"dice":{

	},
	"wheel":{
		// Fortune's Wheel: an even-money spin. Slices alternate between the two sides; the house keeps its edge from net winnings.
		"min":10000,
		"spin":4000, // ms between the spin and its settlement
		"sides":["sun","moon"],
		"slices":[
			["indigo","moon","#3D34A5"],
			["pink","sun","#FF82CE"],
			["teal","moon","#25E2CD"],
			["orange","sun","#FF7500"],
			["blue","moon","#6264DC"],
			["red","sun","#E03C28"],
			["green","moon","#20B562"],
			["gold","sun","#FFBB31"],
			["purple","moon","#A328B3"],
			["peach","sun","#F68F37"],
			["sky","moon","#98DCFF"],
			["blush","sun","#FEC9ED"],
			["pine","moon","#00604B"],
			["lemon","sun","#FFE737"],
		],
	},
	"slots":{
		"gold":1000000,
		"glyphs":["1","2","3","4","5","6","7","8","A","L"],
	},
};

var odds={
	"slots":1.0/640,
	"slots_good":1.0/525,
};



var cards=["2","3","4","5","6","7","8","9","10","ace","king","knight","page","queen"];
for(var i=0;i<cards.length;i++){
	var c=cards[i];
	games["tarot"]["cards"].push(c+"cups");
	games["tarot"]["cards"].push(c+"pentacles");
	games["tarot"]["cards"].push(c+"swords");
	games["tarot"]["cards"].push(c+"wands");
}

if(typeof module!=="undefined") module.exports={games:games,odds:odds};
