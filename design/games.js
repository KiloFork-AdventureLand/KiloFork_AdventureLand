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
		// Three reels for one fixed stake. The prize draw is fair by design: the weighted prizes average exactly the stake,
		// and the house keeps only its edge from the net win. Prize weights are chances out of "draws" spins.
		"gold":1000000,
		"spin":3600, // ms between the pull and its settlement
		"draws":30000,
		"prizes":[
			["glitch",1000000000,6],
			["goldingot",100000000,60],
			["gem0",20000000,300],
			["seashell",6000000,750],
			["whiskey",3000000,900],
			["wine",2000000,1200],
			["ale",1200000,2000],
		],
		// Display strips only; the draw above decides the prize and the reels are parked to show it.
		"reels":[
			["ale","wine","gem0","ale","whiskey","seashell","ale","goldingot","wine","ale","whiskey","glitch","wine","seashell","ale","gem0","whiskey","wine","seashell","goldingot"],
			["wine","ale","seashell","whiskey","ale","goldingot","gem0","ale","wine","glitch","ale","seashell","whiskey","wine","ale","goldingot","wine","gem0","whiskey","seashell"],
			["ale","seashell","wine","ale","gem0","whiskey","goldingot","ale","wine","whiskey","ale","glitch","seashell","wine","ale","gem0","whiskey","wine","goldingot","seashell"],
		],
	},
};

var cards=["2","3","4","5","6","7","8","9","10","ace","king","knight","page","queen"];
for(var i=0;i<cards.length;i++){
	var c=cards[i];
	games["tarot"]["cards"].push(c+"cups");
	games["tarot"]["cards"].push(c+"pentacles");
	games["tarot"]["cards"].push(c+"swords");
	games["tarot"]["cards"].push(c+"wands");
}

if(typeof module!=="undefined") module.exports={games:games};
