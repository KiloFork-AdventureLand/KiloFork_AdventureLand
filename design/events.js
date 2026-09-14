var events={
	"anniversary":{
		"name":"Ten Years of Adventure Land",
		"modal":"event-anniversary",
		"sprite":"sixcake",
		"announcement":{"title":"10 Years of Adventure","color":"#F0B742","accent":"#ED86AB","effect":"confetti","text":"Find players for cake and Anniversary Gifts."},
		"type":"seasonal",
	},
	"abtesting":{
		"name":"A/B Testing",
		"modal":"event-abtesting",
		"sprite":"thehelmet",
		"announcement":{"color":"#EC526D","accent":"#78D6A0","effect":"sparks","text":"Join the team battle."},
		"duration":8*60,
		"join":true,
		"type":"daily",
	},
	"goobrawl":{
		"name":"Goo Brawl",
		"modal":"event-goobrawl",
		"sprite":"rgoo",
		"announcement":{"color":"#F78159","accent":"#A5DC6C","effect":"bubbles","text":"Join the goo fight."},
		"duration":9*60,
		"join":true,
		"type":"daily",
	},
	"crabxx":{
		"name":"Giga Crab",
		"modal":"event-crabxx",
		"sprite":"crabxx",
		"announcement":{"color":"#F18B64","accent":"#73D5DB","effect":"splash","text":"Help take down Giga Crab."},
		"duration":60*40,
		"join":true,
		"type":"daily",
	},
	"franky":{
		"name":"Franky",
		"modal":"event-franky",
		"sprite":"franky",
		"announcement":{"color":"#9FCF6D","accent":"#C29BE7","effect":"sparks","text":"Franky is awake."},
		"duration":60*40,
		"join":true,
		"type":"nightly",
	},
	"icegolem":{
		"name":"Ice Golem",
		"modal":"event-icegolem",
		"sprite":"icegolem",
		"announcement":{"color":"#8BD4F4","accent":"#E0F6FF","effect":"snow","text":"Face the Ice Golem."},
		"duration":60*40,
		"join":true,
		"type":"nightly",
	},
	"holidayseason":{
		"name":"Holiday Season",
		"modal":"event-holidayseason",
		"sprite":"grinch",
		"announcement":{"color":"#7ACA8B","accent":"#EE8B92","effect":"snow","text":"Collect candy canes and gifts."},
		"duration":60*60*24*30,
		//"join":true,
		"type":"seasonal",
	},
	"lunarnewyear":{
		"name":"Lunar New Year",
		"modal":"event-lunarnewyear",
		"sprite":"redenvelopev4",
		"announcement":{"color":"#EF7272","accent":"#F3D16E","effect":"fireworks","text":"Envelopes are dropping across the land."},
		"duration":60*60*24*15,
		//"join":true,
		"type":"seasonal",
	},
	"valentines":{
		"name":"Valentines",
		"modal":"event-valentines",
		"sprite":"cupid",
		"announcement":{"color":"#F08AB6","accent":"#F5C8D9","effect":"hearts","text":"Candy Pops and Love Goo await."},
		"duration":60*60*24*10,
		//"join":true,
		"type":"seasonal",
	},
	"egghunt":{
		"name":"Egg Hunt",
		"modal":"event-egghunt",
		"sprite":"basketofeggs",
		"announcement":{"color":"#AFD778","accent":"#D7A1E8","effect":"confetti","text":"Hunt for eggs across the land."},
		"duration":60*60*24*15,
		//"join":true,
		"type":"seasonal",
	},
	"halloween":{
		"name":"Halloween",
		"modal":"event-halloween",
		"sprite":"candy0",
		"announcement":{"color":"#F5A05B","accent":"#AD91DC","effect":"embers","text":"Collect candy from monsters."},
		"duration":60*60*24*30,
		//"join":true,
		"type":"seasonal",
	},
};

// Seeded rooms never determine loot or votes. Reply pools are sampled on the server.
events.dreams={
	"name": "Cave of Many Dreams",
	"modal": "cave-of-many-dreams",
	"sprite": "stonekey",
	"type": "daily",
	"duration": 1440,
	"party": 3,
	"vote_ms": 20000,
	"encounters": [
		{
			"id": "e01",
			"name": "Dice in a Tin Cup",
			"actor": "dice_operator",
			"group": "mixed",
			"kind": "dice",
			"text": "One roll each. Read your bet before you shake the cup.",
			"options": [
				{
					"id": "small",
					"label": "Bet 2,000 cave gold: win on 4–6",
					"effect": "dice",
					"cost": 2000,
					"win": 4000
				},
				{
					"id": "large",
					"label": "Bet 5,000 cave gold: win on 4–6",
					"effect": "dice",
					"cost": 5000,
					"win": 10000
				},
				{
					"id": "six",
					"label": "Bet 2,000 on a six: win 12,000",
					"effect": "dice6",
					"cost": 2000,
					"win": 12000
				},
				{
					"id": "die",
					"label": "Bet 6 Amber for a Loaded Die: win on a six",
					"effect": "die",
					"amber": 6
				},
				{
					"id": "favor",
					"label": "Roll for a guide: lose and fight a collector",
					"effect": "favor"
				},
				{
					"id": "door",
					"label": "Let the die choose a guarded room",
					"effect": "dice_room"
				}
			]
		},
		{
			"id": "e02",
			"name": "The Unclaimed Parcel",
			"actor": "archive_vendor",
			"group": "mixed",
			"kind": "parcel",
			"text": "Someone paid for this box and never came back. Something inside keeps knocking.",
			"options": [
				{
					"id": "e02_0",
					"effect": "venture",
					"label": "Cut the seal. Something inside is scratching.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Inside: a parcel, and a very angry note.",
							"reward": "cave_parcel"
						},
						{
							"weight": 1,
							"text": "The owner heard you. Three guards are coming.",
							"fight": [
								"cave_guard",
								3
							]
						}
					]
				},
				{
					"id": "e02_1",
					"effect": "venture",
					"label": "Pry the hinges off quietly.",
					"outcomes": [
						{
							"weight": 1,
							"text": "You lifted the lid without ringing the alarm.",
							"reward": "cave_parcel"
						}
					],
					"needs": "tool"
				},
				{
					"id": "e02_2",
					"label": "Spend 20 seconds checking the trap.",
					"effect": "careful"
				},
				{
					"id": "e02_3",
					"effect": "venture",
					"label": "Pay the owner 2,000 cave gold.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The owner hands over the parcel.",
							"reward": "cave_parcel"
						}
					],
					"cost": 2000
				},
				{
					"id": "e02_4",
					"effect": "venture",
					"label": "Ring the alarm and claim what the guards carry.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The guards heard the bell.",
							"fight": [
								"cave_guard",
								3
							]
						}
					]
				},
				{
					"id": "e02_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e03",
			"name": "Feed the Vault",
			"actor": "monster_handler",
			"group": "mixed",
			"kind": "lure",
			"text": "The big one swallowed the key. We can draw it out with these rats.",
			"options": [
				{
					"id": "e03_0",
					"effect": "venture",
					"label": "Open the rat gate. Fight six rats for the parcel.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Six rats spill out of the feeding pen.",
							"fight": [
								"cave_rat",
								6
							]
						}
					]
				},
				{
					"id": "e03_1",
					"effect": "venture",
					"label": "Put your hand through the bars.",
					"outcomes": [
						{
							"weight": 1,
							"text": "You reached the latch.",
							"reward": "cave_parcel"
						},
						{
							"weight": 1,
							"text": "A wolf caught your sleeve.",
							"fight": [
								"cave_wolf",
								2
							]
						}
					]
				},
				{
					"id": "e03_2",
					"effect": "venture",
					"label": "Buy the bait for 2 Amber. It will distract a patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it wrapped until you need it.",
							"flags": [
								"decoy"
							]
						}
					],
					"amber": 2
				},
				{
					"id": "e03_3",
					"effect": "venture",
					"label": "Free the tame rat. Let it follow us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The rat knows whose side it is on.",
							"ally": "cave_rat"
						}
					]
				},
				{
					"id": "e03_4",
					"effect": "venture",
					"label": "Sell the spare feed for 2,000 cave gold.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The handler counts out the gold.",
							"gold": 2000
						}
					]
				},
				{
					"id": "e03_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e04",
			"name": "The Hot Metal",
			"actor": "inventor",
			"group": "mixed",
			"kind": "forge",
			"text": "The metal is ready. Strike now, or cool it first. It may crack if we rush.",
			"options": [
				{
					"id": "e04_0",
					"effect": "venture",
					"label": "Hammer the glowing blade. It may wake the forge.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The blade came free.",
							"reward": "cave_boss"
						},
						{
							"weight": 1,
							"text": "The forge keeper wants it back.",
							"fight": [
								"cave_lockbreaker",
								1
							]
						}
					]
				},
				{
					"id": "e04_1",
					"effect": "venture",
					"label": "Pay 4 Amber for a cold cast.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The smith opens a cooled mold.",
							"reward": "cave_parcel"
						}
					],
					"amber": 4
				},
				{
					"id": "e04_2",
					"effect": "venture",
					"label": "Wake the forge keeper on purpose.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The keeper drags its hammer from the fire.",
							"fight": [
								"cave_lockbreaker",
								1
							]
						}
					]
				},
				{
					"id": "e04_3",
					"effect": "venture",
					"label": "Borrow the smith’s pry bar.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Mind the hot end.",
							"flags": [
								"tool"
							]
						}
					]
				},
				{
					"id": "e04_4",
					"effect": "venture",
					"label": "Take the metal scraps: 2 Amber.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The smith pushes the scraps across the bench.",
							"amber": 2
						}
					]
				},
				{
					"id": "e04_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e05",
			"name": "The Guard’s Contract",
			"actor": "pact_broker",
			"group": "mixed",
			"kind": "hire",
			"text": "I can fight beside you. My price is the next reward we find.",
			"options": [
				{
					"id": "e05_0",
					"effect": "venture",
					"label": "Hire the guard for 2,000 cave gold.",
					"outcomes": [
						{
							"weight": 1,
							"text": "I will watch your back.",
							"ally": "cave_npc"
						}
					],
					"cost": 2000
				},
				{
					"id": "e05_1",
					"effect": "venture",
					"label": "Let the guard lead. No money up front.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A deal is a deal. Follow me.",
							"ally": "cave_npc"
						},
						{
							"weight": 1,
							"text": "The guard whistles. His friends step out.",
							"fight": [
								"cave_guard",
								3
							]
						}
					]
				},
				{
					"id": "e05_2",
					"effect": "venture",
					"label": "Fight the guard for the contract chest.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Then come and earn it.",
							"fight": [
								"cave_npc",
								1
							]
						}
					]
				},
				{
					"id": "e05_3",
					"effect": "venture",
					"label": "Take a route with fewer guards.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep this pass where they can see it.",
							"flags": [
								"truce"
							]
						}
					]
				},
				{
					"id": "e05_4",
					"effect": "venture",
					"label": "Buy a spare lamp for 1 Amber.",
					"outcomes": [
						{
							"weight": 1,
							"text": "You will want this below.",
							"flags": [
								"lamp"
							]
						}
					],
					"amber": 1
				},
				{
					"id": "e05_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e06",
			"name": "The Trapped Surveyor",
			"actor": "cave_cartographer",
			"group": "mixed",
			"kind": "rescue",
			"text": "Help! They have me cornered. My tools are yours if we get out.",
			"options": [
				{
					"id": "save",
					"label": "Fight the monsters and save them",
					"effect": "save"
				},
				{
					"id": "watch",
					"label": "Stand back and see who survives",
					"effect": "watch"
				},
				{
					"id": "lure",
					"label": "Draw the monsters toward us",
					"effect": "lure"
				},
				{
					"id": "aid",
					"label": "Hire them after the fight: 2,000 cave gold",
					"effect": "hire",
					"cost": 2000
				},
				{
					"id": "finish",
					"label": "Attack the traveler and the monsters.",
					"effect": "both"
				},
				{
					"id": "cover",
					"label": "Cover their escape. They leave a smaller reward.",
					"effect": "cover"
				}
			]
		},
		{
			"id": "e07",
			"name": "Borrow a Uniform",
			"actor": "expedition_captain",
			"group": "mixed",
			"kind": "disguise",
			"text": "These coats might fool the sentries. Unless they recognize my face.",
			"options": [
				{
					"id": "e07_0",
					"effect": "venture",
					"label": "Pay 2 Amber for a guard’s coat. Skip the next guardroom.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep the hood up.",
							"flags": [
								"truce"
							]
						}
					],
					"amber": 2
				},
				{
					"id": "e07_1",
					"effect": "venture",
					"label": "Steal the captain’s coat.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The captain has not noticed. Yet.",
							"flags": [
								"truce"
							],
							"gold": 2000
						},
						{
							"weight": 1,
							"text": "That coat has a bell sewn into it.",
							"fight": [
								"cave_guard",
								3
							]
						}
					]
				},
				{
					"id": "e07_2",
					"effect": "venture",
					"label": "Challenge the captain for the coat.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The captain draws both blades.",
							"fight": [
								"cave_rogue",
								1
							]
						}
					]
				},
				{
					"id": "e07_3",
					"effect": "venture",
					"label": "Take a discarded lamp from the locker.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The oil is still good.",
							"flags": [
								"lamp"
							]
						}
					]
				},
				{
					"id": "e07_4",
					"effect": "venture",
					"label": "Search the pockets.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Someone left a parcel in the lining.",
							"reward": "cave_parcel"
						}
					]
				},
				{
					"id": "e07_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e08",
			"name": "Pick a Fighter",
			"actor": "monster_handler",
			"group": "mixed",
			"kind": "arena",
			"text": "One gate holds crabs. The other holds wolves. Clear either pen and the purse is yours.",
			"options": [
				{
					"id": "e08_0",
					"effect": "venture",
					"label": "Choose three crabs. Slow, but armored.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The crab pen opens.",
							"fight": [
								"cave_crab",
								3
							]
						}
					]
				},
				{
					"id": "e08_1",
					"effect": "venture",
					"label": "Choose six bats. Keep them off your priest.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The bats spread around the room.",
							"fight": [
								"cave_bat",
								6
							]
						}
					]
				},
				{
					"id": "e08_2",
					"effect": "venture",
					"label": "Choose the wolf pair. They move together.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Two wolves circle the party.",
							"fight": [
								"cave_wolf",
								2
							]
						}
					]
				},
				{
					"id": "e08_3",
					"effect": "venture",
					"label": "Choose the Lockbreaker. One large opponent.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The Lockbreaker steps into the ring.",
							"fight": [
								"cave_lockbreaker",
								1
							]
						}
					]
				},
				{
					"id": "e08_4",
					"effect": "venture",
					"label": "Let the handler choose your opponent.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The handler calls the fight off. Take the purse.",
							"reward": "cave_parcel",
							"gold": 3000
						},
						{
							"weight": 1,
							"text": "The handler opens two pens.",
							"fight": [
								"cave_wolf",
								4
							]
						}
					]
				},
				{
					"id": "e08_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e09",
			"name": "Finish the Golem",
			"actor": "inventor",
			"group": "mixed",
			"kind": "construct",
			"text": "It only needs a power stone. I think it still knows who built it.",
			"options": [
				{
					"id": "e09_0",
					"effect": "venture",
					"label": "Use 4 Amber to repair its chest.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The golem stands beside you.",
							"ally": "cave_sentinel"
						}
					],
					"amber": 4
				},
				{
					"id": "e09_1",
					"effect": "venture",
					"label": "Fit the loose power stone.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The golem follows your voice.",
							"ally": "cave_sentinel"
						},
						{
							"weight": 1,
							"text": "The golem mistakes you for intruders.",
							"fight": [
								"cave_sentinel",
								1
							]
						}
					]
				},
				{
					"id": "e09_2",
					"effect": "venture",
					"label": "Remove the stone while it is awake.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The golem closes its fist around the stone.",
							"fight": [
								"cave_sentinel",
								1
							]
						}
					]
				},
				{
					"id": "e09_3",
					"effect": "venture",
					"label": "Salvage the broken plates: 2 Amber.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The old joints fall apart.",
							"amber": 2
						}
					]
				},
				{
					"id": "e09_4",
					"label": "Spend 20 seconds opening its storage hatch.",
					"effect": "careful"
				},
				{
					"id": "e09_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e10",
			"name": "The Handler and the Wolves",
			"actor": "monster_handler",
			"group": "mixed",
			"kind": "wolves",
			"text": "Do not pull the red chain. Those wolves are level 100. They bite from both sides.",
			"options": [
				{
					"id": "e10_0",
					"label": "Pull the red chain: six level 100 wolves.",
					"effect": "wolves"
				},
				{
					"id": "e10_1",
					"effect": "venture",
					"label": "Open the small pen instead.",
					"outcomes": [
						{
							"weight": 1,
							"text": "These wolves are younger. Still hungry.",
							"fight": [
								"cave_wolf",
								2
							]
						}
					]
				},
				{
					"id": "e10_2",
					"effect": "venture",
					"label": "Buy bait for 2 Amber. Turn a patrol against itself.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Throw it between the guards.",
							"flags": [
								"decoy"
							]
						}
					],
					"amber": 2
				},
				{
					"id": "e10_3",
					"effect": "venture",
					"label": "Reach for the handler’s purse.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The handler was asleep.",
							"reward": "cave_parcel"
						},
						{
							"weight": 1,
							"text": "The handler was pretending.",
							"fight": [
								"cave_wolf",
								4
							]
						}
					]
				},
				{
					"id": "e10_4",
					"effect": "venture",
					"label": "Pay 2,000 cave gold for the locked crate.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep your fingers away from the red chain.",
							"reward": "cave_parcel"
						}
					],
					"cost": 2000
				},
				{
					"id": "e10_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e11",
			"name": "Two People Claim the Chest",
			"actor": "duelist",
			"group": "mixed",
			"kind": "conflict",
			"text": "I carried the chest here. She says the key makes it hers. Decide before we draw our swords.",
			"options": [
				{
					"id": "left",
					"label": "Stand with the first fighter",
					"effect": "left"
				},
				{
					"id": "right",
					"label": "Stand with the second fighter",
					"effect": "right"
				},
				{
					"id": "neither",
					"label": "Take no side",
					"effect": "neither"
				},
				{
					"id": "both",
					"label": "Fight both of them",
					"effect": "both"
				},
				{
					"id": "peace",
					"label": "Offer 3,000 cave gold for peace",
					"effect": "peace",
					"cost": 3000
				},
				{
					"id": "testimony",
					"label": "Back the stronger fighter",
					"effect": "testimony"
				}
			]
		},
		{
			"id": "e12",
			"name": "The Bell Ropes",
			"actor": "bell_keeper",
			"group": "mixed",
			"kind": "bell",
			"text": "The short rope opens the lock. The long rope calls the guards. The labels fell off.",
			"options": [
				{
					"id": "e12_0",
					"effect": "venture",
					"label": "Pull the short rope. Wake three guards.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Three guards answer the bell.",
							"fight": [
								"cave_guard",
								3
							]
						}
					]
				},
				{
					"id": "e12_1",
					"effect": "venture",
					"label": "Pull the long rope. Wake the keeper.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A deeper bell answers.",
							"fight": [
								"cave_mothkeeper",
								1
							]
						}
					]
				},
				{
					"id": "e12_2",
					"label": "Cut the red rope: level 100 wolves.",
					"effect": "wolves"
				},
				{
					"id": "e12_3",
					"effect": "venture",
					"label": "Take the loose bell as a decoy.",
					"outcomes": [
						{
							"weight": 1,
							"text": "It will draw a guard away from the next fight.",
							"flags": [
								"decoy"
							]
						}
					]
				},
				{
					"id": "e12_4",
					"label": "Use a pry bar to open the bell’s base.",
					"effect": "use_tool"
				},
				{
					"id": "e12_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e13",
			"name": "The Strong Magnet",
			"actor": "inventor",
			"group": "mixed",
			"kind": "magnet",
			"text": "It pulls metal out of the cracks. Last time it pulled an entire suit of armor.",
			"options": [
				{
					"id": "e13_0",
					"effect": "venture",
					"label": "Turn the magnet all the way up.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A locked case tears free of the ceiling.",
							"reward": "cave_boss"
						},
						{
							"weight": 1,
							"text": "The magnet pulls an armored sentinel toward you.",
							"fight": [
								"cave_sentinel",
								1
							]
						}
					]
				},
				{
					"id": "e13_1",
					"effect": "venture",
					"label": "Collect the loose metal: 2 Amber.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Small pieces are safer.",
							"amber": 2
						}
					]
				},
				{
					"id": "e13_2",
					"effect": "venture",
					"label": "Pull the sentinel’s shield toward the party.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The sentinel comes with its shield.",
							"fight": [
								"cave_sentinel",
								1
							]
						}
					]
				},
				{
					"id": "e13_3",
					"effect": "venture",
					"label": "Pay 2 Amber to use the small magnet.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A little box slides out of the wall.",
							"reward": "cave_parcel"
						}
					],
					"amber": 2
				},
				{
					"id": "e13_4",
					"effect": "venture",
					"label": "Take a magnetic latch as a pry tool.",
					"outcomes": [
						{
							"weight": 1,
							"text": "It grips the next locked hatch.",
							"flags": [
								"tool"
							]
						}
					]
				},
				{
					"id": "e13_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e14",
			"name": "Two Couriers, One Badge",
			"actor": "expedition_captain",
			"group": "mixed",
			"kind": "conflict",
			"text": "One of us is carrying stolen cargo. He says it is me.",
			"options": [
				{
					"id": "left",
					"label": "Stand with the first fighter",
					"effect": "left"
				},
				{
					"id": "right",
					"label": "Stand with the second fighter",
					"effect": "right"
				},
				{
					"id": "neither",
					"label": "Take no side",
					"effect": "neither"
				},
				{
					"id": "both",
					"label": "Fight both of them",
					"effect": "both"
				},
				{
					"id": "peace",
					"label": "Offer 3,000 cave gold for peace",
					"effect": "peace",
					"cost": 3000
				},
				{
					"id": "testimony",
					"label": "Back the stronger fighter",
					"effect": "testimony"
				}
			]
		},
		{
			"id": "e15",
			"name": "Edda’s Letter",
			"actor": "prisoner",
			"group": "mixed",
			"kind": "letter",
			"text": "Give this to the captain, or help me burn it. He must not read it while I am here.",
			"options": [
				{
					"id": "e15_0",
					"effect": "venture",
					"label": "Give the sealed letter to the captain.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The captain pays for the message.",
							"reward": "cave_rescue",
							"gold": 3000
						},
						{
							"weight": 1,
							"text": "The letter names you as the thief.",
							"fight": [
								"cave_npc",
								2
							]
						}
					]
				},
				{
					"id": "e15_1",
					"effect": "venture",
					"label": "Open the letter in front of the captain.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The captain reaches for his sword.",
							"fight": [
								"cave_npc",
								1
							]
						}
					]
				},
				{
					"id": "e15_2",
					"effect": "venture",
					"label": "Pay 2,000 cave gold for a guide instead.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Edda takes the long way around the guards.",
							"ally": "cave_npc"
						}
					],
					"cost": 2000
				},
				{
					"id": "e15_3",
					"effect": "venture",
					"label": "Take Edda’s spare lamp.",
					"outcomes": [
						{
							"weight": 1,
							"text": "She has already lit another.",
							"flags": [
								"lamp"
							]
						}
					]
				},
				{
					"id": "e15_4",
					"label": "Read the letter carefully: 20 seconds.",
					"effect": "careful"
				},
				{
					"id": "e15_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e16",
			"name": "Trade the Crates",
			"actor": "monster_handler",
			"group": "mixed",
			"kind": "trade",
			"text": "My crate is sealed. Yours smells like Amber. Want to trade?",
			"options": [
				{
					"id": "e16_0",
					"effect": "venture",
					"label": "Swap your sealed crate for theirs.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Their crate contains a parcel and 4,000 gold.",
							"reward": "cave_parcel",
							"gold": 4000
						},
						{
							"weight": 1,
							"text": "Their crate contains live bats.",
							"fight": [
								"cave_bat",
								6
							]
						}
					]
				},
				{
					"id": "e16_1",
					"effect": "venture",
					"label": "Pay 3 Amber to open both crates.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The trader lets you choose a parcel.",
							"reward": "cave_parcel"
						}
					],
					"amber": 3
				},
				{
					"id": "e16_2",
					"effect": "venture",
					"label": "Take the guarded crate.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Two hired swords step in front of it.",
							"fight": [
								"cave_npc",
								2
							]
						}
					]
				},
				{
					"id": "e16_3",
					"effect": "venture",
					"label": "Sell the empty crates for 1,500 cave gold.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The trader needs the wood.",
							"gold": 1500
						}
					]
				},
				{
					"id": "e16_4",
					"effect": "venture",
					"label": "Take the loose hinges for a pry bar.",
					"outcomes": [
						{
							"weight": 1,
							"text": "They are still strong.",
							"flags": [
								"tool"
							]
						}
					]
				},
				{
					"id": "e16_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e17",
			"name": "The Copying Shadow",
			"actor": "pact_broker",
			"group": "mixed",
			"kind": "shadow",
			"text": "It copies the strongest person it sees. Send one of us forward.",
			"options": [
				{
					"id": "e17_0",
					"effect": "venture",
					"label": "Step into the shadow. Fight a copy of your strongest fighter.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Your shadow steps away from your feet.",
							"shadow": true
						}
					]
				},
				{
					"id": "e17_1",
					"effect": "venture",
					"label": "Throw a stone into the shadow.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The stone comes back wrapped in cloth.",
							"reward": "cave_parcel"
						},
						{
							"weight": 1,
							"text": "Something followed the stone back.",
							"fight": [
								"cave_bat",
								5
							]
						}
					]
				},
				{
					"id": "e17_2",
					"effect": "venture",
					"label": "Pay 2 Amber to keep the lamp burning.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The shadow retreats from the parcel.",
							"reward": "cave_parcel"
						}
					],
					"amber": 2
				},
				{
					"id": "e17_3",
					"effect": "venture",
					"label": "Borrow the watcher’s lamp.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it close to the floor.",
							"flags": [
								"lamp"
							]
						}
					]
				},
				{
					"id": "e17_4",
					"label": "Watch the shadow for 20 seconds.",
					"effect": "careful"
				},
				{
					"id": "e17_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e18",
			"name": "The Broken Lift",
			"actor": "inventor",
			"group": "mixed",
			"kind": "lift",
			"text": "The lift is stuck. Hold off the creatures while I turn the wheel.",
			"options": [
				{
					"id": "e18_0",
					"effect": "venture",
					"label": "Turn the lift wheel hard.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A supply cage rises into reach.",
							"reward": "cave_rescue"
						},
						{
							"weight": 1,
							"text": "The cage is full of rats.",
							"fight": [
								"cave_rat",
								8
							]
						}
					]
				},
				{
					"id": "e18_1",
					"effect": "venture",
					"label": "Hire the lift guard for 2,000 cave gold.",
					"outcomes": [
						{
							"weight": 1,
							"text": "I am done guarding a broken lift.",
							"ally": "cave_npc"
						}
					],
					"cost": 2000
				},
				{
					"id": "e18_2",
					"label": "Pry open the service hatch.",
					"effect": "use_tool"
				},
				{
					"id": "e18_3",
					"effect": "venture",
					"label": "Salvage the cable: 2 Amber.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The loose cable comes free.",
							"amber": 2
						}
					]
				},
				{
					"id": "e18_4",
					"effect": "venture",
					"label": "Call down to the lower landing.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Two wolves answer from below.",
							"fight": [
								"cave_wolf",
								2
							]
						}
					]
				},
				{
					"id": "e18_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e19",
			"name": "The Farmer’s Guess",
			"actor": "fungus_farmer",
			"group": "mixed",
			"kind": "mushroom",
			"text": "The pale ones hide Amber. The spotted ones attract spiders. I sorted them in the dark.",
			"options": [
				{
					"id": "e19_0",
					"effect": "venture",
					"label": "Pick the spotted mushrooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The farmer buys the whole basket.",
							"reward": "cave_parcel",
							"gold": 3000
						},
						{
							"weight": 1,
							"text": "The picking wakes the bats above you.",
							"fight": [
								"cave_bat",
								6
							]
						}
					]
				},
				{
					"id": "e19_1",
					"effect": "venture",
					"label": "Pick the plain ones: 2 Amber.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The farmer marks the safe patch.",
							"amber": 2
						}
					]
				},
				{
					"id": "e19_2",
					"label": "Plant a crop. Return after one minute for 3 Amber.",
					"effect": "plant"
				},
				{
					"id": "e19_3",
					"effect": "venture",
					"label": "Ask for a sack of bait.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The rats like these mushrooms.",
							"flags": [
								"decoy"
							]
						}
					]
				},
				{
					"id": "e19_4",
					"effect": "venture",
					"label": "Clear the farmer’s rat pen.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The farmer opens the pen.",
							"fight": [
								"cave_rat",
								6
							]
						}
					]
				},
				{
					"id": "e19_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e20",
			"name": "Hire a Thief",
			"actor": "prisoner",
			"group": "mixed",
			"kind": "rogue",
			"text": "The rogue fights with two daggers. Monsters are closing in. He has seen you watching.",
			"options": [
				{
					"id": "save",
					"label": "Fight the monsters and save them",
					"effect": "save"
				},
				{
					"id": "watch",
					"label": "Stand back and see who survives",
					"effect": "watch"
				},
				{
					"id": "lure",
					"label": "Draw the monsters toward us",
					"effect": "lure"
				},
				{
					"id": "aid",
					"label": "Hire them after the fight: 2,000 cave gold",
					"effect": "hire",
					"cost": 2000
				},
				{
					"id": "finish",
					"label": "Attack the traveler and the monsters.",
					"effect": "both"
				},
				{
					"id": "cover",
					"label": "Cover their escape. They leave a smaller reward.",
					"effect": "cover"
				}
			]
		},
		{
			"id": "e21",
			"name": "Change the Map",
			"actor": "cave_cartographer",
			"group": "mixed",
			"kind": "route",
			"text": "I know a shorter way. There is a locked guardroom in the middle of it.",
			"options": [
				{
					"id": "e21_0",
					"effect": "venture",
					"label": "Buy a guard’s pass for 3 Amber. Skip one guardroom.",
					"outcomes": [
						{
							"weight": 1,
							"text": "One use. Then tear it up.",
							"flags": [
								"truce"
							]
						}
					],
					"amber": 3
				},
				{
					"id": "e21_1",
					"effect": "venture",
					"label": "Take the guarded shortcut.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The shortcut ends at three guards.",
							"fight": [
								"cave_guard",
								3
							]
						}
					]
				},
				{
					"id": "e21_2",
					"effect": "venture",
					"label": "Trust the crossed-out route.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The old route still leads to a supply box.",
							"reward": "cave_parcel"
						},
						{
							"weight": 1,
							"text": "The old route belongs to wolves now.",
							"fight": [
								"cave_wolf",
								3
							]
						}
					]
				},
				{
					"id": "e21_3",
					"effect": "venture",
					"label": "Hire the mapmaker for 2,000 cave gold.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The mapmaker packs her things.",
							"ally": "cave_npc"
						}
					],
					"cost": 2000
				},
				{
					"id": "e21_4",
					"effect": "venture",
					"label": "Take the spare lantern.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Mark your way back.",
							"flags": [
								"lamp"
							]
						}
					]
				},
				{
					"id": "e21_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e22",
			"name": "One More Turn",
			"actor": "inventor",
			"group": "mixed",
			"kind": "pressure",
			"text": "One more turn might release the chest. It might also break the cage behind us.",
			"options": [
				{
					"id": "e22_0",
					"effect": "venture",
					"label": "Give the wheel one more turn.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The last latch opens.",
							"reward": "cave_boss"
						},
						{
							"weight": 1,
							"text": "The pressure wakes the sentinel.",
							"fight": [
								"cave_sentinel",
								1
							]
						}
					]
				},
				{
					"id": "e22_1",
					"effect": "venture",
					"label": "Release all the pressure at once.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The keeper hears the pipe burst.",
							"fight": [
								"cave_lockbreaker",
								1
							]
						}
					]
				},
				{
					"id": "e22_2",
					"label": "Open the valve slowly: 20 seconds.",
					"effect": "careful"
				},
				{
					"id": "e22_3",
					"label": "Use a pry bar on the jammed latch.",
					"effect": "use_tool"
				},
				{
					"id": "e22_4",
					"effect": "venture",
					"label": "Take the loose fittings: 2 Amber.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The fittings are cold enough to carry.",
							"amber": 2
						}
					]
				},
				{
					"id": "e22_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e23",
			"name": "Keep the Crate Cold",
			"actor": "expedition_captain",
			"group": "mixed",
			"kind": "escort",
			"text": "Keep those bats away from the crate. I need to reach the next landing.",
			"options": [
				{
					"id": "e23_0",
					"label": "Escort the porter to the stairs.",
					"effect": "escort"
				},
				{
					"id": "e23_1",
					"effect": "venture",
					"label": "Open the crate before moving it.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The ice kept the parcel dry.",
							"reward": "cave_rescue"
						},
						{
							"weight": 1,
							"text": "The crate held sleeping crabs.",
							"fight": [
								"cave_crab",
								4
							]
						}
					]
				},
				{
					"id": "e23_2",
					"effect": "venture",
					"label": "Pay 2,000 cave gold to unload it here.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The porter breaks the ice around the parcel.",
							"reward": "cave_parcel"
						}
					],
					"cost": 2000
				},
				{
					"id": "e23_3",
					"effect": "venture",
					"label": "Keep the porter as a guard instead.",
					"outcomes": [
						{
							"weight": 1,
							"text": "He sets down the crate and draws a sword.",
							"ally": "cave_npc"
						}
					]
				},
				{
					"id": "e23_4",
					"effect": "venture",
					"label": "Take the spare lamp from the cart.",
					"outcomes": [
						{
							"weight": 1,
							"text": "The porter hands you the lamp.",
							"flags": [
								"lamp"
							]
						}
					]
				},
				{
					"id": "e23_5",
					"label": "Leave it alone.",
					"effect": "leave"
				}
			]
		},
		{
			"id": "e24",
			"name": "The Same Prisoner Twice",
			"actor": "prisoner",
			"group": "mixed",
			"kind": "twins",
			"text": "She says she is me. One of us is a thief. Look at our weapons before you decide.",
			"options": [
				{
					"id": "left",
					"label": "Stand with the first fighter",
					"effect": "left"
				},
				{
					"id": "right",
					"label": "Stand with the second fighter",
					"effect": "right"
				},
				{
					"id": "neither",
					"label": "Take no side",
					"effect": "neither"
				},
				{
					"id": "both",
					"label": "Fight both of them",
					"effect": "both"
				},
				{
					"id": "peace",
					"label": "Offer 3,000 cave gold for peace",
					"effect": "peace",
					"cost": 3000
				},
				{
					"id": "testimony",
					"label": "Back the stronger fighter",
					"effect": "testimony"
				}
			]
		},
		{
			"id": "e25",
			"name": "The Prisoner and the Captain",
			"actor": "prisoner",
			"group": "mixed",
			"kind": "conflict",
			"text": "The captain wants me back in chains. He has the key. I have proof he sold the last patrol.",
			"options": [
				{
					"id": "left",
					"label": "Stand with the first fighter",
					"effect": "left"
				},
				{
					"id": "right",
					"label": "Stand with the second fighter",
					"effect": "right"
				},
				{
					"id": "neither",
					"label": "Take no side",
					"effect": "neither"
				},
				{
					"id": "both",
					"label": "Fight both of them",
					"effect": "both"
				},
				{
					"id": "peace",
					"label": "Offer 3,000 cave gold for peace",
					"effect": "peace",
					"cost": 3000
				},
				{
					"id": "testimony",
					"label": "Back the stronger fighter",
					"effect": "testimony"
				}
			]
		},
		{
			"id": "e26",
			"name": "The Ceiling Falls",
			"actor": "cave_cartographer",
			"group": "bad",
			"kind": "collapse",
			"text": "The ceiling is coming down. Drop the tools or stay and fight your way clear.",
			"options": [
				{
					"id": "pay",
					"label": "Lose 3,000 cave gold and move on",
					"effect": "pay",
					"cost": 3000
				},
				{
					"id": "fight",
					"label": "Fight through the guards",
					"effect": "bad_fight"
				},
				{
					"id": "drop",
					"label": "Leave 2 Amber behind",
					"effect": "pay",
					"amber": 2
				},
				{
					"id": "brace",
					"label": "Brace for the first pack",
					"effect": "bad_fight"
				},
				{
					"id": "wait",
					"label": "Wait: lose 45 seconds",
					"effect": "time",
					"seconds": 45
				},
				{
					"id": "rush",
					"label": "Rush through: fight two packs",
					"effect": "bad_double"
				}
			]
		},
		{
			"id": "e27",
			"name": "Stopped by a Guard",
			"actor": "collector",
			"group": "bad",
			"kind": "toll",
			"text": "Pay from your cave purse, or deal with my guards.",
			"options": [
				{
					"id": "pay",
					"label": "Lose 3,000 cave gold and move on",
					"effect": "pay",
					"cost": 3000
				},
				{
					"id": "fight",
					"label": "Fight through the guards",
					"effect": "bad_fight"
				},
				{
					"id": "drop",
					"label": "Leave 2 Amber behind",
					"effect": "pay",
					"amber": 2
				},
				{
					"id": "brace",
					"label": "Brace for the first pack",
					"effect": "bad_fight"
				},
				{
					"id": "wait",
					"label": "Wait: lose 45 seconds",
					"effect": "time",
					"seconds": 45
				},
				{
					"id": "rush",
					"label": "Rush through: fight two packs",
					"effect": "bad_double"
				}
			]
		},
		{
			"id": "e28",
			"name": "The Rope Snaps",
			"actor": "bell_keeper",
			"group": "bad",
			"kind": "alarm",
			"text": "The bell is ringing. We can muffle it, but one pack is already coming.",
			"options": [
				{
					"id": "pay",
					"label": "Lose 3,000 cave gold and move on",
					"effect": "pay",
					"cost": 3000
				},
				{
					"id": "fight",
					"label": "Fight through the guards",
					"effect": "bad_fight"
				},
				{
					"id": "drop",
					"label": "Leave 2 Amber behind",
					"effect": "pay",
					"amber": 2
				},
				{
					"id": "brace",
					"label": "Brace for the first pack",
					"effect": "bad_fight"
				},
				{
					"id": "wait",
					"label": "Wait: lose 45 seconds",
					"effect": "time",
					"seconds": 45
				},
				{
					"id": "rush",
					"label": "Rush through: fight two packs",
					"effect": "bad_double"
				}
			]
		},
		{
			"id": "e29",
			"name": "The Cargo Is Stuck",
			"actor": "expedition_captain",
			"group": "bad",
			"kind": "cargo",
			"text": "The cart is blocking the passage. Leave the cargo, or hold them off while I pull.",
			"options": [
				{
					"id": "pay",
					"label": "Lose 3,000 cave gold and move on",
					"effect": "pay",
					"cost": 3000
				},
				{
					"id": "fight",
					"label": "Fight through the guards",
					"effect": "bad_fight"
				},
				{
					"id": "drop",
					"label": "Leave 2 Amber behind",
					"effect": "pay",
					"amber": 2
				},
				{
					"id": "brace",
					"label": "Brace for the first pack",
					"effect": "bad_fight"
				},
				{
					"id": "wait",
					"label": "Wait: lose 45 seconds",
					"effect": "time",
					"seconds": 45
				},
				{
					"id": "rush",
					"label": "Rush through: fight two packs",
					"effect": "bad_double"
				}
			]
		},
		{
			"id": "e30",
			"name": "The Wrong Receipt",
			"actor": "pact_broker",
			"group": "bad",
			"kind": "debt",
			"text": "That receipt belongs to someone who owes us money. We are collecting.",
			"options": [
				{
					"id": "pay",
					"label": "Lose 3,000 cave gold and move on",
					"effect": "pay",
					"cost": 3000
				},
				{
					"id": "fight",
					"label": "Fight through the guards",
					"effect": "bad_fight"
				},
				{
					"id": "drop",
					"label": "Leave 2 Amber behind",
					"effect": "pay",
					"amber": 2
				},
				{
					"id": "brace",
					"label": "Brace for the first pack",
					"effect": "bad_fight"
				},
				{
					"id": "wait",
					"label": "Wait: lose 45 seconds",
					"effect": "time",
					"seconds": 45
				},
				{
					"id": "rush",
					"label": "Rush through: fight two packs",
					"effect": "bad_double"
				}
			]
		},
		{
			"id": "e31",
			"name": "The Shop with One Item",
			"actor": "archive_vendor",
			"group": "positive",
			"kind": "merchant",
			"text": "One item. One sale. You pay, and the cave chooses who gets it.",
			"options": [
				{
					"id": "buy",
					"label": "Buy the item shown",
					"effect": "buy"
				},
				{
					"id": "leave",
					"label": "Leave it alone",
					"effect": "leave"
				},
				{
					"id": "inspect",
					"label": "Check the item first",
					"effect": "inspect"
				},
				{
					"id": "decline",
					"label": "Keep our gold",
					"effect": "leave"
				},
				{
					"id": "reserve",
					"label": "Leave it for someone else",
					"effect": "leave"
				},
				{
					"id": "story",
					"label": "Ask where it came from",
					"effect": "story"
				}
			]
		},
		{
			"id": "e32",
			"name": "Clear the Crab Pens",
			"actor": "monster_handler",
			"group": "positive",
			"kind": "hunt",
			"text": "Kill six crabs in 90 seconds. I will pay for every clean sweep. One try.",
			"options": [
				{
					"effect": "hunt",
					"label": "Start the regular timed hunt.",
					"id": "e32_0"
				},
				{
					"effect": "hunt_double",
					"label": "Hunt twice as many for two parcels.",
					"id": "e32_1"
				},
				{
					"effect": "hunt_quick",
					"label": "Hunt half as many for 2 Amber.",
					"id": "e32_2"
				},
				{
					"effect": "hunt_helper",
					"label": "Take a helper. Earn one parcel.",
					"id": "e32_3"
				},
				{
					"effect": "hunt_late",
					"label": "Take 30 extra seconds. Earn 2 Amber.",
					"id": "e32_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e32_5"
				}
			]
		},
		{
			"id": "e33",
			"name": "Catch the Bats",
			"actor": "bell_keeper",
			"group": "positive",
			"kind": "hunt_bats",
			"text": "Eight bats in 75 seconds. They stole the keys off my belt.",
			"options": [
				{
					"effect": "hunt",
					"label": "Start the regular timed hunt.",
					"id": "e33_0"
				},
				{
					"effect": "hunt_double",
					"label": "Hunt twice as many for two parcels.",
					"id": "e33_1"
				},
				{
					"effect": "hunt_quick",
					"label": "Hunt half as many for 2 Amber.",
					"id": "e33_2"
				},
				{
					"effect": "hunt_helper",
					"label": "Take a helper. Earn one parcel.",
					"id": "e33_3"
				},
				{
					"effect": "hunt_late",
					"label": "Take 30 extra seconds. Earn 2 Amber.",
					"id": "e33_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e33_5"
				}
			]
		},
		{
			"id": "e34",
			"name": "Rats with Silver Teeth",
			"actor": "collector",
			"group": "positive",
			"kind": "hunt_rats",
			"text": "Ten rats in 60 seconds. Bring me a quiet room and I will open my purse.",
			"options": [
				{
					"effect": "hunt",
					"label": "Start the regular timed hunt.",
					"id": "e34_0"
				},
				{
					"effect": "hunt_double",
					"label": "Hunt twice as many for two parcels.",
					"id": "e34_1"
				},
				{
					"effect": "hunt_quick",
					"label": "Hunt half as many for 2 Amber.",
					"id": "e34_2"
				},
				{
					"effect": "hunt_helper",
					"label": "Take a helper. Earn one parcel.",
					"id": "e34_3"
				},
				{
					"effect": "hunt_late",
					"label": "Take 30 extra seconds. Earn 2 Amber.",
					"id": "e34_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e34_5"
				}
			]
		},
		{
			"id": "e35",
			"name": "Move the Caravan",
			"actor": "expedition_captain",
			"group": "positive",
			"kind": "escort_safe",
			"text": "Walk me to the stairs. I will give you the parcel when we arrive.",
			"options": [
				{
					"id": "e35_0",
					"label": "Walk together to the stairs",
					"effect": "escort"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e35_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e35_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e35_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e35_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e35_5"
				}
			]
		},
		{
			"id": "e36",
			"name": "Craft with Cave Amber",
			"actor": "collector",
			"group": "positive",
			"kind": "recipes",
			"text": "Amber holds an edge better than it looks. Cole can make something from it.",
			"options": [
				{
					"id": "e36_0",
					"label": "Show me the recipes",
					"effect": "recipes"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e36_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e36_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e36_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e36_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e36_5"
				}
			]
		},
		{
			"id": "e37",
			"name": "Try the Dice",
			"actor": "dice_operator",
			"group": "positive",
			"kind": "practice_dice",
			"text": "No stake this time. Roll a six and I will give you a piece of Amber.",
			"options": [
				{
					"id": "e37_0",
					"label": "Roll once",
					"effect": "free_die"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e37_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e37_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e37_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e37_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e37_5"
				}
			]
		},
		{
			"id": "e38",
			"name": "Borrow a Tool",
			"actor": "cave_cartographer",
			"group": "positive",
			"kind": "tool",
			"text": "Take the pry bar or the spare lamp. Either one may help with the next room.",
			"options": [
				{
					"id": "e38_0",
					"label": "Take the pry bar",
					"effect": "tool"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e38_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e38_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e38_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e38_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e38_5"
				}
			]
		},
		{
			"id": "e39",
			"name": "Plant Something",
			"actor": "fungus_farmer",
			"group": "positive",
			"kind": "plant",
			"text": "Choose a patch. I will give you what grows before you leave this floor.",
			"options": [
				{
					"id": "e39_0",
					"label": "Plant the pale seeds",
					"effect": "plant"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e39_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e39_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e39_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e39_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e39_5"
				}
			]
		},
		{
			"id": "e40",
			"name": "Practice with Wooden Swords",
			"actor": "duelist",
			"group": "positive",
			"kind": "practice",
			"text": "Break my guard in 30 seconds. I will stop before anyone gets hurt.",
			"options": [
				{
					"id": "e40_0",
					"label": "Start the practice bout",
					"effect": "practice"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e40_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e40_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e40_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e40_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e40_5"
				}
			]
		},
		{
			"id": "e41",
			"name": "Trade Materials",
			"actor": "collector",
			"group": "positive",
			"kind": "exchange",
			"text": "I will trade two Amber for my wrapped parcel. You can keep your Amber instead.",
			"options": [
				{
					"id": "e41_0",
					"label": "Trade 2 Amber for a parcel",
					"effect": "exchange"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e41_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e41_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e41_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e41_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e41_5"
				}
			]
		},
		{
			"id": "e42",
			"name": "A Door for the Rat",
			"actor": "monster_handler",
			"group": "positive",
			"kind": "ratdoor",
			"text": "That rat knows a way under the wall. Follow it and I will mark the next room.",
			"options": [
				{
					"id": "e42_0",
					"label": "Mark the next room",
					"effect": "reveal"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e42_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e42_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e42_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e42_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e42_5"
				}
			]
		},
		{
			"id": "e43",
			"name": "Call a Guard Away",
			"actor": "expedition_captain",
			"group": "positive",
			"kind": "decoy",
			"text": "I can keep one guard busy. Tell me which fight you want help with.",
			"options": [
				{
					"id": "e43_0",
					"label": "Help with our next fight",
					"effect": "decoy"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e43_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e43_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e43_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e43_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e43_5"
				}
			]
		},
		{
			"id": "e44",
			"name": "Check the Maker’s Mark",
			"actor": "archive_vendor",
			"group": "positive",
			"kind": "appraise",
			"text": "I can tell you what the rogue is holding. Look at the blades before you trust him.",
			"options": [
				{
					"id": "e44_0",
					"label": "Mark the next room",
					"effect": "reveal"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e44_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e44_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e44_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e44_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e44_5"
				}
			]
		},
		{
			"id": "e45",
			"name": "Show Edda the Way Out",
			"actor": "prisoner",
			"group": "positive",
			"kind": "escort_safe",
			"text": "Let me follow you to the stairs. I still have my last wages.",
			"options": [
				{
					"id": "e45_0",
					"label": "Walk together to the stairs",
					"effect": "escort"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e45_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e45_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e45_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e45_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e45_5"
				}
			]
		},
		{
			"id": "e46",
			"name": "Is It Worth the Price?",
			"actor": "collector",
			"group": "positive",
			"kind": "merchant",
			"text": "I found this in a shop that closed years ago. This is my only copy.",
			"options": [
				{
					"id": "buy",
					"label": "Buy the item shown",
					"effect": "buy"
				},
				{
					"id": "leave",
					"label": "Leave it alone",
					"effect": "leave"
				},
				{
					"id": "inspect",
					"label": "Check the item first",
					"effect": "inspect"
				},
				{
					"id": "decline",
					"label": "Keep our gold",
					"effect": "leave"
				},
				{
					"id": "reserve",
					"label": "Leave it for someone else",
					"effect": "leave"
				},
				{
					"id": "story",
					"label": "Ask where it came from",
					"effect": "story"
				}
			]
		},
		{
			"id": "e47",
			"name": "Follow the Thread",
			"actor": "fungus_farmer",
			"group": "positive",
			"kind": "moths",
			"text": "Keep the lamp still. The moths will settle, and I can catch one without hurting it.",
			"options": [
				{
					"id": "e47_0",
					"label": "Hold the lamp steady",
					"effect": "moths"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e47_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e47_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e47_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e47_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e47_5"
				}
			]
		},
		{
			"id": "e48",
			"name": "Send Supplies Outside",
			"actor": "cave_cartographer",
			"group": "positive",
			"kind": "send",
			"text": "You can send some of your cave purse home now. It will be safe if the rest goes wrong.",
			"options": [
				{
					"id": "e48_0",
					"label": "Send 5,000 cave gold home",
					"effect": "bank"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e48_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e48_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e48_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e48_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e48_5"
				}
			]
		},
		{
			"id": "e49",
			"name": "Make a Tool",
			"actor": "inventor",
			"group": "positive",
			"kind": "tool",
			"text": "A wedge opens locks. A lamp keeps moths still. Pick whichever you need.",
			"options": [
				{
					"id": "e49_0",
					"label": "Take the pry bar",
					"effect": "tool"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e49_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e49_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e49_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e49_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e49_5"
				}
			]
		},
		{
			"id": "e50",
			"name": "Before You Leave",
			"actor": "bell_keeper",
			"group": "positive",
			"kind": "farewell",
			"text": "You made it this far. Take the Amber or open the little box.",
			"options": [
				{
					"id": "e50_0",
					"label": "Take 2 Amber",
					"effect": "gift"
				},
				{
					"effect": "venture",
					"label": "Ask for someone to come with us.",
					"outcomes": [
						{
							"weight": 1,
							"text": "A traveler picks up a weapon.",
							"ally": "cave_npc"
						}
					],
					"id": "e50_1"
				},
				{
					"effect": "venture",
					"label": "Take a lamp for the lower rooms.",
					"outcomes": [
						{
							"weight": 1,
							"text": "There is enough oil left.",
							"flags": [
								"lamp"
							]
						}
					],
					"id": "e50_2"
				},
				{
					"effect": "venture",
					"label": "Take bait to distract the next patrol.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Keep it out of your food bag.",
							"flags": [
								"decoy"
							]
						}
					],
					"id": "e50_3"
				},
				{
					"effect": "venture",
					"label": "Take 1 Amber and keep moving.",
					"outcomes": [
						{
							"weight": 1,
							"text": "Good luck down there.",
							"amber": 1
						}
					],
					"id": "e50_4"
				},
				{
					"label": "Leave it alone.",
					"effect": "leave",
					"id": "e50_5"
				}
			]
		}
	],
	"cast": {
		"dice_operator": [
			{
				"name": "Noll",
				"skin": "marmor10c",
				"cx": {
					"head": "makeup117",
					"hair": "hairdo103",
					"hat": "hat103",
					"chin": "beard104"
				}
			},
			{
				"name": "Bix",
				"skin": "marmor10d",
				"cx": {
					"head": "fmakeup03",
					"hair": "hairdo208",
					"hat": "hat103"
				}
			},
			{
				"name": "Carro",
				"skin": "marmor10h",
				"cx": {
					"head": "mmakeup01",
					"hair": "hairdo501",
					"hat": "hat103",
					"chin": "beard102"
				}
			}
		],
		"archive_vendor": [
			{
				"name": "Ilex",
				"skin": "mbody5b",
				"cx": {
					"head": "makeup117",
					"hair": "hairdo219",
					"hat": "hat311",
					"face": "tortoise_g",
					"back": "backpacks201"
				}
			},
			{
				"name": "Meda",
				"skin": "mbody5c",
				"cx": {
					"head": "fmakeup03",
					"hair": "hairdo420",
					"hat": "hat311",
					"face": "tortoise_g",
					"back": "backpacks201"
				}
			},
			{
				"name": "Osric",
				"skin": "mbody5b",
				"cx": {
					"head": "mmakeup01",
					"hair": "hairdo406",
					"hat": "hat311",
					"face": "bwglasses",
					"back": "backpacks201"
				}
			}
		],
		"monster_handler": [
			{
				"name": "Moss",
				"skin": "lchar1h",
				"cx": {
					"hat": "hat205",
					"back": "backpacks00"
				}
			},
			{
				"name": "Gannet",
				"skin": "lchar1h",
				"cx": {
					"hat": "hat202",
					"back": "backpacks03"
				}
			},
			{
				"name": "Burr",
				"skin": "lchar1h",
				"cx": {
					"hat": "hat208",
					"back": "backpacks01"
				}
			}
		],
		"duelist": [
			{
				"name": "Vey",
				"skin": "marmor6f",
				"cx": {
					"head": "fmakeup03",
					"hair": "hairdo105",
					"hat": "hat106"
				}
			},
			{
				"name": "Corren",
				"skin": "marmor6e",
				"cx": {
					"head": "mmakeup01",
					"hair": "hairdo206",
					"hat": "hat106"
				}
			},
			{
				"name": "Seri",
				"skin": "marmor6d",
				"cx": {
					"head": "fmakeup01",
					"hair": "hairdo116",
					"hat": "hat106"
				}
			}
		],
		"collector": [
			{
				"name": "Grumm",
				"skin": "xschar2d",
				"cx": {
					"back": "backpacks00"
				}
			},
			{
				"name": "Torren",
				"skin": "xschar2g",
				"cx": {
					"back": "backpacks03"
				}
			},
			{
				"name": "Mard",
				"skin": "xschar2h",
				"cx": {
					"back": "backpacks01"
				}
			}
		],
		"inventor": [
			{
				"name": "Pell",
				"skin": "marmor1b",
				"cx": {
					"head": "fmakeup01",
					"hair": "hairdo205",
					"hat": "hat210",
					"face": "coolblueg",
					"back": "backpacks200"
				}
			},
			{
				"name": "Neri",
				"skin": "marmor1f",
				"cx": {
					"head": "mmakeup02",
					"hair": "hairdo116",
					"hat": "hat211",
					"face": "coolblueg",
					"back": "backpacks200"
				}
			},
			{
				"name": "Hobb",
				"skin": "marmor1a",
				"cx": {
					"head": "mmakeup01",
					"hair": "hairdo219",
					"hat": "hat204",
					"face": "coolblueg",
					"back": "backpacks200"
				}
			}
		],
		"pact_broker": [
			{
				"name": "Orra",
				"skin": "mbody6b",
				"cx": {
					"head": "numakeup23"
				}
			},
			{
				"name": "Voss",
				"skin": "mbody6b",
				"cx": {
					"head": "blackhead",
					"face": "catbatg"
				}
			},
			{
				"name": "Isen",
				"skin": "mbody6b",
				"cx": {
					"head": "numakeup16"
				}
			}
		],
		"expedition_captain": [
			{
				"name": "Rusk",
				"skin": "lchar1d",
				"cx": {
					"back": "backpacks02"
				}
			},
			{
				"name": "Aldren",
				"skin": "lchar1f",
				"cx": {}
			},
			{
				"name": "Caro",
				"skin": "lchar1g",
				"cx": {}
			}
		],
		"bell_keeper": [
			{
				"name": "Dorr",
				"skin": "mm_blue",
				"cx": {}
			},
			{
				"name": "Orren",
				"skin": "mm_yellow",
				"cx": {}
			},
			{
				"name": "Nera",
				"skin": "mf_blue",
				"cx": {}
			}
		],
		"cave_cartographer": [
			{
				"name": "Senna",
				"skin": "mbody3f",
				"cx": {
					"head": "fmakeup02",
					"hair": "hairdo105",
					"hat": "hat221",
					"face": "tortoise_g",
					"back": "backpacks201"
				}
			},
			{
				"name": "Calder",
				"skin": "mbody3f",
				"cx": {
					"head": "mmakeup01",
					"hair": "hairdo116",
					"hat": "hat219",
					"face": "tortoise_g",
					"back": "backpacks201"
				}
			},
			{
				"name": "Wren",
				"skin": "mbody5d",
				"cx": {
					"head": "fmakeup01",
					"hair": "hairdo208",
					"hat": "hat221",
					"face": "bwglasses",
					"back": "backpacks201"
				}
			}
		],
		"fungus_farmer": [
			{
				"name": "Pip",
				"skin": "sarmor1c",
				"cx": {
					"head": "mmakeup04",
					"hat": "hat406",
					"back": "backpacks01"
				}
			},
			{
				"name": "Lup",
				"skin": "sarmor1c",
				"cx": {
					"head": "mmakeup05",
					"hat": "hat407",
					"back": "backpacks01"
				}
			},
			{
				"name": "Nib",
				"skin": "sarmor1b",
				"cx": {
					"head": "mmakeup04",
					"hat": "hat406",
					"back": "backpacks03"
				}
			}
		],
		"prisoner": [
			{
				"name": "Edda",
				"skin": "mbody2b",
				"cx": {
					"head": "fmakeup01",
					"hair": "hairdo105"
				}
			},
			{
				"name": "Merek",
				"skin": "mbody2b",
				"cx": {
					"head": "mmakeup02",
					"hair": "hairdo116",
					"chin": "beard100"
				}
			},
			{
				"name": "Sella",
				"skin": "mbody4c",
				"cx": {
					"head": "fmakeup03",
					"hair": "hairdo419"
				}
			}
		]
	},
	"merchant_stock": [
		[
			"broom",
			720000
		],
		[
			"tshirt0",
			160000
		],
		[
			"tshirt1",
			160000
		],
		[
			"tshirt2",
			160000
		],
		[
			"cave_loaded_die",
			216000
		]
	],
	"rare": {
		"darkmage": 0.002,
		"rogue_weapon": 0.01,
		"rogue_betrayal": 0.5
	},
	"rewards": {
		"parcel": "cave_parcel",
		"rescue": "cave_rescue",
		"boss": "cave_boss",
		"finish": "cave_finish"
	},
	"gold_limit": 60000,
	"amber_limit": 36
};
