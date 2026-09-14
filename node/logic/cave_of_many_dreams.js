// Shared server scope. Content owns choices and actors; generated_maps owns admission and travel.
function cave_random() {
	return crypto.randomInt(0x100000000) / 0x100000000;
}
function cave_pick(values) {
	return values[Math.floor(cave_random() * values.length)];
}
function cave_shuffle(values) {
	var out = values.slice();
	for (var i = out.length - 1; i > 0; i--) {
		var j = Math.floor(cave_random() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}
function cave_players(run) {
	return run.members
		.filter((m) => !m.left)
		.map((m) => get_player(m.name))
		.filter((p) => p && generated_entry(p)?.record === run && !p.dc && !p.socket.disconnected);
}
function cave_say(run, message) {
	for (var p of cave_players(run)) p.socket.emit("game_log", { message, color: "#D4BB88" });
}
function cave_start(run) {
	run.cave = {
		gold: 0,
		amber: 0,
		gold_earned: 0,
		amber_earned: 0,
		claimed: new Set(),
		rooms: [],
		actors: new Set(),
		vote: null,
		serial: 0,
		last_publish: 0,
		flags: {},
		kills: {},
		issued: 0,
	};
	var pool = cave_shuffle(G.events.dreams.encounters.filter((e) => !["e20", "e31"].includes(e.id)));
	for (var i = 0; i < run.floors.length; i++) {
		var floor = run.manifest[i],
			start = floor.definition.spawns[0];
		var rooms = floor.definition.rooms
			.filter((r) => r.bounds[2] - r.bounds[0] >= 192 && r.bounds[3] - r.bounds[1] >= 192)
			.sort((a, b) => Math.hypot(a.x - start[0], a.y - start[1]) - Math.hypot(b.x - start[0], b.y - start[1]));
		var chosen = [
			rooms[2],
			rooms[Math.floor(rooms.length * 0.36)],
			rooms[Math.floor(rooms.length * 0.72)],
			rooms[5],
			rooms[Math.floor(rooms.length * 0.5)],
			rooms[rooms.length - 2],
		];
		for (var ambient of rooms.filter(
			(r) => !chosen.includes(r) && r !== rooms[0] && r !== rooms[1] && r !== rooms[rooms.length - 1],
		)) {
			run.cave.rooms.push({
				id: i + ":patrol:" + ambient.id,
				kind: "patrol",
				floor: i,
				map: floor.key,
				x: ambient.x,
				y: ambient.y,
				bounds: ambient.bounds,
				required: false,
				started: false,
				done: false,
				actors: [],
				enemies: [],
			});
		}
		for (var extra of [rooms[1], rooms[rooms.length - 1]]) {
			run.cave.rooms.push({
				id: i + ":farm:" + extra.id,
				floor: i,
				map: floor.key,
				x: extra.x,
				y: extra.y,
				bounds: extra.bounds,
				required: false,
				kind: "farm",
				started: false,
				done: false,
				actors: [],
				enemies: [],
				waves: 0,
			});
		}
		for (var j = 0; j < chosen.length; j++) {
			var room = chosen[j];
			var encounter = j === 1 ? pool.shift() : j >= 3 ? pool.shift() : null;
			if (i === 0 && j === 3) encounter = G.events.dreams.encounters.find((e) => e.id === "e31");
			if (i === 1 && j === 3) encounter = G.events.dreams.encounters.find((e) => e.id === "e20");
			run.cave.rooms.push({
				id: i + ":" + j,
				floor: i,
				map: floor.key,
				x: room.x,
				y: room.y,
				bounds: room.bounds,
				required: j < 3,
				kind: j === 0 ? "fight" : j === 2 ? "boss" : "encounter",
				encounter,
				started: false,
				done: false,
				actors: [],
				enemies: [],
				reward: false,
			});
		}
	}
	if (cave_random() < G.events.dreams.rare.darkmage) {
		var rare = run.cave.rooms.find((r) => r.floor === 2 && r.kind === "encounter" && !r.required);
		rare.kind = "darkmage";
		rare.encounter = null;
	}
}
function cave_spawn(run, room, type, side, offset = 0, look) {
	if (room.kind !== "revival" && ((!room.required && run.cave.issued >= 512) || run.cave.actors.size >= 64))
		return null;
	var origin = safe_xy_nearby(room.map, room.x, room.y + 48);
	if (!origin) return null;
	var point = safe_xy_nearby(room.map, room.x + offset, room.y + 48) || origin;
	var actor = new_monster(room.map, { type, position: [point.x, point.y], radius: 0, gold: 0 }, { temp: true });
	if (!actor) return null;
	actor.x = origin.x;
	actor.y = origin.y;
	var placement = calculate_move(actor, point.x, point.y);
	actor.x = placement.x;
	actor.y = placement.y;
	var scale = 1 + Math.pow(run.level / 14, 2),
		depth = 1 + room.floor * 0.32;
	actor.zone_actor = { run: run.key, room: room.id, side, idle: side === "neutral", next: 0 };
	actor.zone_stats = {
		attack: Math.round((type === "cave_npc" || type === "cave_rogue" ? 18 : 12) * (1 + run.level / 5) * depth),
		speed: 40 + Math.min(30, run.level / 3),
		frequency: 1.1,
		armor: Math.round(run.level * 1.5),
		resistance: Math.round(run.level),
	};
	actor.level = run.level;
	actor.hp = actor.max_hp = Math.round((["enemy", "predator"].includes(side) ? 130 : 700) * scale * depth);
	actor.xp = side === "enemy" ? Math.round(15 * Math.pow(run.level, 1.3)) : 0;
	actor.gold = 0;
	actor.mult = 1;
	actor.luckx = 1;
	actor.aggro = 0;
	actor.target = null;
	actor.last_level = future_s(86400);
	actor.socket = false_socket;
	actor.zone_actor.initial_hp = actor.hp;
	if (look) {
		actor.name = look.name;
		actor.skin = look.skin;
		actor.cx = Object.assign({}, look.cx);
	}
	if (type === "cave_darkmage") {
		Object.assign(actor.zone_stats, { attack: 100000, frequency: 0.25, armor: 0, resistance: 0 });
		actor.hp = actor.max_hp = 1000;
		actor.range = 320;
		actor.cx = { head: "numakeup23" };
		actor.slots = { mainhand: { name: "cave_blackstaff", level: 0 } };
		actor.zone_actor.next = Date.now() + 6000;
	}
	if (type === "cave_rogue") {
		actor.zone_actor.rare = cave_random() < G.events.dreams.rare.rogue_weapon;
		actor.zone_actor.strength = cave_pick([0.75, 1, 1.25]);
		actor.hp = actor.max_hp = Math.round(actor.max_hp * actor.zone_actor.strength);
		actor.zone_stats.attack *= actor.zone_actor.strength * (actor.zone_actor.rare ? 1.6 : 1);
		actor.zone_stats.frequency = actor.zone_actor.rare ? 2.2 : 1.5;
		actor.slots = {
			mainhand: { name: actor.zone_actor.rare ? "cave_backstabber" : "dagger", level: 0 },
			offhand: { name: "dagger", level: 0 },
		};
		actor.cx = Object.assign({ head: "mmakeup01", hair: "hairdo206" }, actor.cx);
	}
	if (type.startsWith("cave_") && ["cave_lockbreaker", "cave_sentinel", "cave_mothkeeper"].includes(type)) {
		actor.hp = actor.max_hp = Math.round(1200 * scale * depth);
		actor.zone_stats.attack *= 2.2;
		actor.zone_stats.frequency = 0.65;
		actor.zone_actor.boss = true;
		actor.zone_actor.phase = 0;
	}
	calculate_monster_stats(actor);
	actor.u = true;
	actor.cid = (actor.cid || 0) + 1;
	run.cave.actors.add(actor);
	room.actors.push(actor);
	if (side === "enemy") room.enemies.push(actor);
	run.cave.issued++;
	return actor;
}
function cave_pack(run, room, type, count, side = "enemy") {
	var pack = [];
	for (var i = 0; i < count; i++) {
		var recruit = type === "cave_guard" && side === "enemy" && run.cave.flags.decoy && i === 0;
		var m = cave_spawn(run, room, type, recruit ? "ally" : side, (i - (count - 1) / 2) * 32);
		if (m && recruit) {
			delete run.cave.flags.decoy;
			cave_follow_actor(run, m);
			cave_say(run, "A guard takes your bait and turns on the patrol.");
		}
		if (m) pack.push(m);
	}
	return pack;
}
function cave_activate(run, room) {
	if (run.cave.actors.size > 52) return;
	room.started = true;
	if (room.kind === "patrol") {
		for (var m of cave_pack(run, room, ["cave_rat", "cave_bat", "cave_crab"][room.floor], 2)) {
			m.hp = m.max_hp = Math.ceil(m.max_hp * 0.6);
			m.xp = Math.ceil(m.xp * 0.6);
		}
		return;
	}
	if (room.kind === "farm") {
		room.waves++;
		cave_pack(run, room, ["cave_rat", "cave_crab", "cave_bat"][room.floor], 4);
		return;
	}
	if (room.kind === "fight" && run.cave.flags.truce) {
		delete run.cave.flags.truce;
		cave_say(run, "The guards accept the pass. Keep walking.");
		cave_complete(run, room);
		return;
	}
	if (room.kind === "fight") {
		cave_pack(run, room, ["cave_rat", "cave_crab", "cave_bat"][room.floor], 5);
		return;
	}
	if (room.kind === "boss") {
		cave_spawn(run, room, ["cave_lockbreaker", "cave_sentinel", "cave_mothkeeper"][room.floor], "enemy");
		return;
	}
	if (room.kind === "darkmage") {
		cave_spawn(run, room, "cave_darkmage", "enemy");
		cave_say(run, "Dark Mage: My spell deals 100,000 damage. Only a reflected spell can kill me.");
		return;
	}
	var e = room.encounter,
		look = cave_pick(G.events.dreams.cast[e.actor]);
	room.npc = cave_spawn(run, room, e.kind === "rogue" ? "cave_rogue" : "cave_npc", "neutral", 0, look);
	if (["rescue", "rogue"].includes(e.kind)) {
		room.npc.zone_actor.side = "victim";
		room.npc.zone_actor.idle = false;
		cave_pack(run, room, "cave_wolf", cave_pick([3, 4, 6]), "predator").forEach((m) => {
			m.zone_actor.prey = room.npc;
		});
		room.rescue = true;
		var cargo = { items: [], gold: 0, cash: 0 };
		chest_exchange(cargo, "cave_parcel");
		room.cargo = cargo.items;
	}
	if (["conflict", "twins"].includes(e.kind)) {
		room.rival = cave_spawn(run, room, "cave_npc", "neutral", 112, cave_pick(G.events.dreams.cast.duelist));
		for (var m of [room.npc, room.rival]) {
			var strength = cave_pick([0.55, 1, 1.8]);
			m.hp = m.max_hp = Math.round(m.hp * strength);
			m.zone_stats.attack *= strength;
			m.slots = { mainhand: { name: strength > 1 ? "fireblade" : "blade", level: 0 } };
			calculate_monster_stats(m);
		}
	}
	if (e.kind === "merchant") {
		var stock = cave_pick(G.events.dreams.merchant_stock);
		room.stock = { name: stock[0], price: stock[1], sold: false };
	}
}
function cave_credit(run, gold, amber) {
	var state = run.cave,
		rules = G.events.dreams;
	gold = Math.max(0, Math.min(gold || 0, rules.gold_limit - state.gold_earned));
	amber = Math.max(0, Math.min(amber || 0, rules.amber_limit - state.amber_earned));
	state.gold += gold;
	state.gold_earned += gold;
	state.amber += amber;
	state.amber_earned += amber;
}
function cave_item(run, token, name, quantity) {
	var chest = { items: [], gold: 0, cash: 0 };
	drop_item_logic(chest, [1, name, quantity], false);
	return cave_deliver(run, token, chest.items);
}
function cave_reward(run, room, table) {
	if (room.reward) return;
	room.reward = true;
	var chest = { items: [], gold: 0, cash: 0 };
	chest_exchange(chest, table);
	cave_deliver(run, room.id + ":reward", chest.items);
}
function cave_deliver(run, token, items) {
	if (run.cave.claimed.has(token)) return;
	run.cave.claimed.add(token);
	// Select from the admission roster, never a mutable party or current room.
	var recipient = cave_pick(run.members),
		player = get_player(recipient.name);
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		item.p = "cavefound";
		if (
			player &&
			player.real_id === recipient.character &&
			player.owner === recipient.owner &&
			can_add_item(player, item.name, item.q || 1)
		) {
			add_item(player, item, { announce: false });
			resend(player, "reopen+inv");
		} else {
			// Existing mail claims handle offline/full inventories. The award ID is stable.
			void cave_mail(recipient, item, run.key + ":" + token + ":" + i).catch((e) => log_trace("cave reward mail", e));
		}
		cave_say(run, recipient.name + " received " + G.items[item.name].name + ".");
	}
	return recipient;
}
async function cave_mail(recipient, item, id, attempt = 0) {
	var result = await tx(
		async () => {
			if (await tx_get("ML_cave:" + A.id)) return;
			await tx_save({
				_id: "ML_cave:" + A.id,
				type: "mail",
				created: new Date(),
				read: false,
				item: true,
				taken: false,
				fro: "Dorr",
				to: A.recipient.name,
				owner: [A.recipient.owner],
				character: A.recipient.character,
				cave_award: true,
				info: {
					sender: A.recipient.owner,
					receiver: A.recipient.owner,
					subject: "From the cave",
					message: "You left this with me.",
					item: JSON.stringify(A.item),
				},
				blobs: ["info"],
			});
		},
		{ recipient, item, id },
	);
	if (result.failed) {
		if (attempt >= 4) throw Error(result.reason);
		await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
		return cave_mail(recipient, item, id, attempt + 1);
	}
}
function cave_settle_purse(run, bankOnly = false) {
	var state = run.cave,
		amount = bankOnly ? Math.min(5000, state.gold) : state.gold;
	if (amount) {
		var recipient = cave_pick(run.members),
			player = get_player(recipient.name);
		state.gold -= amount;
		if (player && player.real_id === recipient.character && player.owner === recipient.owner && !player.dc) {
			player.gold += amount;
			resend(player, "u+cid");
		} else
			void cave_mail(recipient, { gold: amount }, run.key + ":gold:" + ++state.serial).catch((e) =>
				log_trace("cave gold mail", e),
			);
		cave_say(run, recipient.name + " received " + amount.toLocaleString("en-US") + " gold.");
	}
	if (!bankOnly && state.amber) {
		var amber = state.amber;
		state.amber = 0;
		cave_item(run, "amber:" + ++state.serial, "cave_amber", amber);
	}
}
function cave_complete(run, room) {
	if (room.done) return;
	room.done = true;
	if (room.kind === "boss") {
		cave_reward(run, room, "cave_boss");
		cave_credit(run, 4000, 0);
	} else if (room.kind === "fight") cave_credit(run, 2000, 1);
	var required = run.cave.rooms.filter((r) => r.floor === room.floor && r.required);
	if (required.every((r) => r.done) && !run.completed[room.floor]) {
		run.completed[room.floor] = true;
		cave_say(
			run,
			room.floor === 2 ? "The last seal is open. Your reward is ready." : "The stairs are open. You can go down.",
		);
		if (room.floor === 2) {
			cave_reward(run, { id: "finish" }, "cave_finish");
			cave_credit(run, 10000, 5);
			cave_settle_purse(run);
		}
	}
	cave_publish(run);
}
function cave_begin_vote(run, room) {
	var state = run.cave;
	if ((state.vote && !state.vote.resolved) || room.voted || !room.encounter || room.npc?.dead) return;
	var e = room.encounter,
		replies = cave_shuffle(e.options);
	// A shop always displays its one purchasable item. All other pools vary independently.
	if (e.kind === "merchant")
		replies = [e.options.find((o) => o.effect === "buy"), cave_pick(e.options.filter((o) => o.effect !== "buy"))];
	else replies = replies.slice(0, 2);
	room.voted = true;
	var voters = run.members.filter((m) => !m.left).map((m) => m.character);
	state.vote = {
		id: run.key + ":" + ++state.serial,
		room,
		deadline: Math.min(run.expires, Date.now() + 20000),
		voters,
		votes: Object.create(null),
		options: replies,
		fallback: e.group === "bad" ? "time" : "leave",
		resolved: false,
	};
	room.vote = state.vote;
	cave_publish(run, true);
}
function cave_resolve_vote(run, now) {
	var vote = run.cave.vote;
	if (!vote || vote.resolved) return;
	var counts = Object.create(null);
	for (var id of Object.values(vote.votes)) counts[id] = (counts[id] || 0) + 1;
	var ordered = Object.entries(counts).sort((a, b) => b[1] - a[1]);
	var majority = ordered[0] && ordered[0][1] > vote.voters.length / 2;
	if (!majority && now < vote.deadline) return;
	vote.resolved = true;
	var winner = ordered[0] && (majority || !ordered[1] || ordered[0][1] > ordered[1][1]) ? ordered[0][0] : null;
	var option = vote.options.find((o) => o.id === winner) || { id: "fallback", effect: vote.fallback, seconds: 45 };
	vote.result = option.id;
	cave_apply(run, vote.room, option);
	cave_publish(run);
}
function cave_apply(run, room, option) {
	var state = run.cave,
		effect = option.effect;
	if (
		(option.needs && !state.flags[option.needs]) ||
		(option.cost || 0) > state.gold ||
		(option.amber || 0) > state.amber
	) {
		cave_say(
			run,
			option.needs && !state.flags[option.needs]
				? "You need the borrowed pry bar for that."
				: "There is not enough in the cave purse.",
		);
		effect = room.encounter.group === "bad" ? "bad_fight" : "leave";
	} else {
		state.gold -= option.cost || 0;
		state.amber -= option.amber || 0;
	}
	if (effect === "leave" && room.rescue) effect = "watch";
	if (effect === "leave" && room.rival) effect = "neither";
	room.decision = effect;
	if (effect === "venture") {
		if (option.needs) delete state.flags[option.needs];
		return cave_venture(run, room, option);
	}
	if (effect === "revive_here" || effect === "revive_landing") {
		for (var p of cave_players(run).filter((p) => p.rip && p.map === room.map)) {
			p.rip = false;
			p.hp = p.max_hp;
			p.mp = Math.round(p.max_mp / 2);
			delete p.s.block;
			delete p.s.poisoned;
			delete p.s.burned;
			delete p.s.eburn;
			if (effect === "revive_landing") generated_transport(p, p.in, 0);
			invincible_logic(p);
			resend(p, "u+cid");
			p.socket.emit("game_response", { response: "data", place: "respawn", success: true, cevent: "respawn" });
		}
		room.npc.zone_actor.side = "neutral";
		room.npc.zone_actor.idle = true;
		cave_complete(run, room);
		state.actors.delete(room.npc);
		remove_monster(room.npc);
		state.rooms = state.rooms.filter((r) => r !== room);
		return;
	}
	if (["save", "cover", "lure", "watch", "hire"].includes(effect) && room.rescue) {
		room.saving = effect !== "watch";
		if (effect === "lure")
			for (var actor of room.actors) if (actor.zone_actor.side === "predator") delete actor.zone_actor.prey;
		if (effect === "hire") room.hiring = true;
		if (effect === "cover") {
			room.covering = true;
			room.npc.zone_actor.side = "ally";
			cave_follow_actor(run, room.npc);
		}
		if (effect === "lure" || effect === "cover")
			for (var a of room.actors) if (a.zone_actor.side === "predator") delete a.zone_actor.prey;
		return;
	}
	if (["left", "right", "neither", "both", "testimony"].includes(effect) && room.rival) {
		room.conflict = true;
		for (var actor of [room.npc, room.rival]) actor.zone_actor.idle = false;
		if (effect === "testimony") effect = room.npc.zone_stats.attack > room.rival.zone_stats.attack ? "left" : "right";
		room.npc.zone_actor.side = effect === "left" ? "ally" : "duel_left";
		room.rival.zone_actor.side = effect === "right" ? "ally" : "duel_right";
		if (effect === "both") {
			room.npc.zone_actor.side = room.rival.zone_actor.side = "enemy";
		} else {
			room.npc.zone_actor.prey = room.rival;
			room.rival.zone_actor.prey = room.npc;
		}
		room.enemies = effect === "left" ? [room.rival] : effect === "right" ? [room.npc] : [room.npc, room.rival];
		return;
	}
	if (effect === "peace" && room.rival) {
		cave_credit(run, 0, 1);
		cave_say(run, "They put their weapons away and split the money.");
		cave_complete(run, room);
		return;
	}
	if (effect === "both" && room.rescue) {
		room.npc.zone_actor.side = "enemy";
		room.saving = false;
		return;
	}
	if (effect === "buy" || effect === "inspect") {
		cave_publish(run, true);
		cave_complete(run, room);
		return;
	}
	if (["dice", "dice6", "die", "favor", "free_die", "dice_room"].includes(effect)) {
		var face = 1 + Math.floor(cave_random() * 6),
			threshold = ["dice6", "die", "free_die"].includes(effect) ? 6 : 4;
		if (
			face < threshold &&
			!state.flags.reroll &&
			cave_players(run).some((p) => p.slots.orb?.name === "cave_loaded_die")
		) {
			state.flags.reroll = true;
			face = 1 + Math.floor(cave_random() * 6);
		}
		cave_say(run, "The die shows " + face + ".");
		if (effect === "dice_room") {
			cave_pack(run, room, face > 3 ? "cave_crab" : "cave_rat", 4);
			return;
		}
		if (face >= threshold) {
			if (effect === "die") cave_item(run, room.id + ":die", "cave_loaded_die");
			else if (effect === "free_die") cave_credit(run, 0, 1);
			else if (effect === "favor") cave_add_follower(run, room, "cave_npc");
			else cave_credit(run, option.win || 2000, 0);
		} else if (effect === "favor") {
			cave_pack(run, room, "cave_guard", 2);
			return;
		}
		cave_complete(run, room);
		return;
	}
	if (effect.startsWith("hunt")) {
		var kind = room.encounter.kind,
			type = kind === "hunt_bats" ? "cave_bat" : kind === "hunt_rats" ? "cave_rat" : "cave_crab";
		var count = type === "cave_rat" ? 10 : type === "cave_bat" ? 8 : 6;
		if (effect === "hunt_double") count *= 2;
		if (effect === "hunt_quick") count = Math.ceil(count / 2);
		if (effect === "hunt_helper") cave_add_follower(run, room, "cave_npc");
		var pack = cave_pack(run, room, type, count);
		if (!pack.length) {
			cave_say(run, "There are no more tracks here. The hunt is off.");
			cave_complete(run, room);
			return;
		}
		room.hunt = {
			small: effect === "hunt_quick" || effect === "hunt_late",
			double: effect === "hunt_double",
			ids: pack.map((m) => m.id),
			count: pack.length,
			kills: 0,
			deadline: Math.min(
				run.expires,
				Date.now() +
					((type === "cave_rat" ? 60 : type === "cave_bat" ? 75 : 90) + (effect === "hunt_late" ? 30 : 0)) * 1000,
			),
		};
		cave_publish(run);
		return;
	}
	if (
		["bad_fight", "bad_double", "fight", "wolves", "risk", "shadow", "boss", "ambush", "dice_room"].includes(effect)
	) {
		if (effect === "risk" && cave_random() < 0.5) {
			cave_reward(run, room, "cave_parcel");
			cave_credit(run, 4000, 1);
		} else {
			var wolves = effect === "wolves" || option.hazard === "wolves";
			if (option.hazard === "shadow") {
				var strongest = cave_players(run).sort((a, b) => b.attack - a.attack)[0];
				var shadow = cave_spawn(run, room, "cave_npc", "enemy", 64, {
					name: "Your Shadow",
					skin: strongest.skin,
					cx: strongest.cx,
				});
				shadow.slots = JSON.parse(JSON.stringify(strongest.slots));
				shadow.hp = shadow.max_hp = strongest.max_hp * 2;
				Object.assign(shadow.zone_stats, {
					attack: strongest.attack * 0.7,
					frequency: strongest.frequency,
					speed: strongest.speed,
				});
				calculate_monster_stats(shadow);
				return;
			}
			var pack = cave_pack(
				run,
				room,
				wolves ? "cave_wolf" : "cave_guard",
				wolves ? 6 : effect === "bad_double" ? 6 : 3,
			);
			if (wolves)
				for (var m of pack) {
					m.level = 100;
					m.hp = m.max_hp = G.monsters.wolf.hp * 50;
					m.zone_stats = { attack: G.monsters.wolf.attack * 8, speed: 100, frequency: 2, armor: 1200, resistance: 600 };
					calculate_monster_stats(m);
				}
			if (room.encounter?.group === "bad") room.no_reward = true;
			return;
		}
	} else if (["careful", "paid_help", "use_tool"].includes(effect)) {
		if (effect === "use_tool" && !state.flags.tool) {
			cave_pack(run, room, "cave_guard", 2);
			return;
		}
		if (effect === "use_tool") state.flags.tool = false;
		if (effect === "careful") {
			room.wait_until = Date.now() + 20000;
			return;
		}
		cave_reward(run, room, "cave_parcel");
	} else if (["tool", "lamp", "decoy"].includes(effect)) state.flags[effect] = true;
	else if (["guide", "escort"].includes(effect)) {
		room.npc.zone_actor.side = "ally";
		room.npc.zone_actor.idle = false;
		room.escort = cave_follow_actor(run, room.npc) && effect === "escort";
		if (room.escort) return;
	} else if (effect === "time") run.expires -= (option.seconds || 45) * 1000;
	else if (effect === "exchange") {
		if (state.amber >= 2) {
			state.amber -= 2;
			cave_reward(run, room, "cave_parcel");
		}
	} else if (effect === "bank") cave_settle_purse(run, true);
	else if (effect === "moths") {
		if (state.flags.lamp) cave_item(run, room.id + ":moths", "cave_mothsteps");
		else cave_credit(run, 0, 2);
	} else if (effect === "plant") {
		room.harvest = Date.now() + 60000;
	} else if (effect === "practice") {
		room.practice = true;
		room.npc.zone_actor.side = "enemy";
		room.npc.zone_actor.idle = false;
		room.npc.hp = room.npc.max_hp = 500 * (1 + run.level / 10);
		room.enemies = [room.npc];
		room.practice_end = Date.now() + 30000;
		return;
	} else if (["gift", "small_gift"].includes(effect)) cave_credit(run, 0, effect === "gift" ? 2 : 1);
	else if (effect === "reveal") {
		for (var r of run.cave.rooms.filter((r) => r.floor === room.floor && r.required)) r.revealed = true;
	}
	if (effect === "leave" && room.required) {
		// Refusing the conversation leaves a real guard encounter on the required path.
		cave_pack(run, room, "cave_guard", 3);
		return;
	}
	cave_complete(run, room);
}
function cave_hostile(a, b) {
	var aa = a.zone_actor,
		bb = b.zone_actor;
	if (!aa && !bb) return true;
	if (a.in !== b.in || a.dead || b.dead || b.rip) return false;
	if (!aa) return !!(bb && !["neutral", "ally"].includes(bb.side));
	if (!bb) return ["enemy", "predator"].includes(aa.side) || aa.prey === b;
	if (aa.side === "neutral" || bb.side === "neutral") return false;
	if (aa.prey === b) return true;
	return (
		aa.side !== bb.side &&
		!(aa.side === "ally" && bb.side === "victim") &&
		!(aa.side === "victim" && bb.side === "ally")
	);
}
function cave_accept_attack(target, info) {
	return target.type !== "cave_darkmage" || info.reflected_from === target.id;
}
function cave_damage(attacker, target, info, amount) {
	if (!attacker.zone_actor && !target.zone_actor) return amount;
	if (target.type === "cave_darkmage") {
		if (info.reflected_from !== target.id) return 0;
		target.zone_actor.reflected = true;
		return target.hp;
	}
	if (amount < 0)
		return target.zone_actor?.side === "ally" || target.zone_actor?.side === "victim" || !target.zone_actor
			? amount
			: 0;
	if (!cave_hostile(attacker, target)) return 0;
	var run = generated_entry(target)?.record || generated_entry(attacker)?.record;
	var room = run?.cave.rooms.find((r) => r.id === attacker.zone_actor?.room || r.id === target.zone_actor?.room);
	if (room?.practice) return Math.min(amount, Math.max(0, target.hp - 1));
	if (target.zone_actor?.boss && target.zone_actor.phase === 0 && target.type === "cave_sentinel") return amount * 0.25;
	return amount;
}
function cave_death(attacker, target) {
	if (!target.zone_actor || target.dead) return false;
	if (target.type === "cave_darkmage" && !target.zone_actor.reflected) {
		target.hp = target.max_hp;
		return true;
	}
	var run = generated_runs[target.zone_actor.run],
		room = run?.cave.rooms.find((r) => r.id === target.zone_actor.room);
	if (!run || !room) return false;
	var state = run.cave;
	if (target.type === "cave_darkmage") cave_reward(run, { id: room.id + ":staff" }, "cave_darkmage");
	if (
		target.type === "cave_rogue" &&
		target.zone_actor.rare &&
		attacker?.is_monster &&
		attacker.zone_actor?.side === "predator" &&
		!target.zone_actor.betrayed
	)
		cave_reward(run, { id: room.id + ":dagger" }, "cave_rogue_weapon");
	if (target === room.npc && room.rescue && !room.reward) {
		room.reward = true;
		cave_deliver(run, room.id + ":corpse", room.cargo || []);
	}
	if (
		room.hunt &&
		room.hunt.ids.includes(target.id) &&
		Date.now() <= room.hunt.deadline &&
		(attacker?.is_player || attacker?.zone_actor?.side === "ally")
	)
		room.hunt.kills++;
	state.kills[target.type] = (state.kills[target.type] || 0) + 1;
	var xp_player = attacker?.is_player
		? attacker
		: attacker?.zone_actor?.side === "ally"
			? cave_players(run).find((p) => p.in === target.in && !p.rip && simple_distance(p, target) < 800)
			: null;
	if (xp_player && target.xp) {
		var recipients = cave_players(run).filter((p) => p.in === target.in && !p.rip && simple_distance(p, target) < 800);
		issue_monster_award(target, {
			player: xp_player,
			members: recipients.map((p) => p.name),
			share: 1 / run.members.length,
			drop: false,
		});
	}
	if (
		!room.no_reward &&
		!room.hunt &&
		["cave_bat", "cave_rat", "cave_crab", "cave_guard", "cave_wolf"].includes(target.type)
	) {
		var recipient = attacker?.is_player ? attacker : cave_players(run)[0];
		if (recipient) {
			var drops = { items: [], gold: 0, cash: 0 };
			// Cave actors scale with characters, but their daily encounter table is one fixed roll.
			roll_monster_drops(
				Object.assign({}, recipient, { luckm: 1 }),
				Object.assign({}, target, { level: 1 }),
				drops,
				1,
				null,
				{ table_only: true },
			);
			for (var item of drops.items) if (item.name === "cave_amber") cave_credit(run, 0, item.q || 1);
		}
	}
	state.actors.delete(target);
	remove_monster(target);
	return true;
}
function cave_move(actor, target, now) {
	if (actor.working || actor.moving || now - (actor.zone_actor.last_path || 0) < 650 || is_disabled(actor)) return;
	actor.zone_actor.last_path = now;
	var move = calculate_move(actor, target.x, target.y);
	if (Math.hypot(move.x - target.x, move.y - target.y) < 4) {
		actor.going_x = move.x;
		actor.going_y = move.y;
		start_moving_element(actor);
		return;
	}
	actor.working = true;
	actor.zone_actor.path_token = actor.zone_actor.run + ":" + ++generated_runs[actor.zone_actor.run].cave.serial;
	workers[generated_maps[actor.map].floor.worker].postMessage({
		type: "fast_astar",
		in: actor.in,
		id: actor.id,
		map: actor.map,
		path_token: actor.zone_actor.path_token,
		sx: actor.x,
		sy: actor.y,
		tx: target.x,
		ty: target.y,
	});
}
function cave_actor_tick(run, actor, now, people) {
	var ai = actor.zone_actor;
	if (ai.idle || actor.dead || is_disabled(actor)) return;
	var room = run.cave.rooms.find((r) => r.id === ai.room);
	if (ai.boss && ai.phase === 0 && actor.hp < actor.max_hp * 0.55) {
		ai.phase = 1;
		cave_pack(run, room, actor.type === "cave_mothkeeper" ? "cave_bat" : "cave_guard", 3);
		actor.zone_stats.frequency *= 1.35;
		calculate_monster_stats(actor);
		cave_say(
			run,
			actor.type === "cave_sentinel"
				? "The sentinel drops its shield. Its guards are coming."
				: "The keeper calls for help.",
		);
	}
	var candidates = people.filter((p) => !p.rip && p.hp > 0 && !is_invinc(p) && !is_invis(p) && cave_hostile(actor, p));
	for (var other of room.actors)
		if (other !== actor && !other.dead && cave_hostile(actor, other)) candidates.push(other);
	if (ai.prey && !ai.prey.dead && cave_hostile(actor, ai.prey)) candidates = [ai.prey];
	candidates = candidates.filter((p) => p.in === actor.in && simple_distance(actor, p) <= (ai.betrayed ? 200 : 800));
	candidates.sort(
		(a, b) =>
			(actor.type === "cave_darkmage" ? Number(b.type === "mage") - Number(a.type === "mage") : 0) ||
			simple_distance(actor, a) - simple_distance(actor, b),
	);
	var target = candidates[0];
	if (!target) {
		if (ai.follow) {
			var leader = people.find((p) => !p.rip && p.in === actor.in);
			if (leader && simple_distance(actor, leader) > 65) cave_move(actor, leader, now);
		}
		return;
	}
	if (ai.betrayed && ai.jump !== target.id && now >= (ai.jump_at || 0)) {
		var point = safe_xy_nearby(actor.map, target.x - 12, target.y + 12);
		if (point) transport_monster_to(actor, actor.in, actor.map, point.x, point.y);
		ai.jump = target.id;
		ai.jump_at = now + 750;
	}
	if (can_attack(actor, target) && now >= ai.next) {
		ai.next = now + 1000 / actor.frequency;
		var attack = commence_attack(actor, target, "attack");
		if (attack?.events?.length) for (var event of attack.events) xy_emit(actor, event[0], event[1]);
	} else if (simple_distance(actor, target) > actor.range * 0.8) cave_move(actor, target, now);
}
function cave_tick(run, now) {
	var state = run.cave,
		people = cave_players(run);
	if (!state) return;
	cave_resolve_vote(run, now);
	if (!state.vote || state.vote.resolved) {
		var fallen = people.find((p) => p.rip);
		if (fallen) cave_offer_rescue(run, fallen);
	}
	for (var room of state.rooms) {
		if (!generated_maps[room.map]) continue;
		var occupied = people.some((p) => p.map === room.map && simple_distance(p, room) < 900);
		if (occupied) {
			room.last_near = now;
			if (room.saved) cave_resume_floor(run, room.map, room);
		} else if (
			!room.saved &&
			room.started &&
			now - (room.last_near || (room.last_near = now)) > 15000 &&
			!room.actors.some((a) => a.zone_actor.follow) &&
			!(state.vote && !state.vote.resolved && state.vote.room === room)
		) {
			cave_suspend_floor(run, room.map, room);
		}
		if (room.saved) continue;
		var nearby = people.filter((p) => !p.rip && p.map === room.map && simple_distance(p, room) < 280);
		if (!room.started && nearby.length) cave_activate(run, room);
		if (!room.started) continue;
		if (room.encounter && nearby.length && !room.voted && !room.done) cave_begin_vote(run, room);
		if (room.harvest && room.harvest <= now) {
			delete room.harvest;
			cave_credit(run, 0, 3);
			cave_say(run, "The Amber is ready to collect.");
		}
		if (room.done) continue;
		if (room.wait_until && now >= room.wait_until) {
			cave_reward(run, room, "cave_parcel");
			cave_complete(run, room);
			continue;
		}
		if (room.kind === "farm" && room.enemies.every((m) => m.dead)) {
			if (!room.next_wave) {
				cave_reward(run, { id: room.id + ":wave:" + room.waves }, "cave_farm");
				cave_credit(run, 1500, 1);
				room.next_wave = now + 8000;
			}
			if (room.waves >= 3) cave_complete(run, room);
			else if (nearby.length && now >= room.next_wave) {
				room.next_wave = 0;
				room.enemies = [];
				cave_activate(run, room);
			}
			continue;
		}
		if (room.practice && (room.npc.hp <= 1 || room.practice_end <= now)) {
			if (room.npc.hp <= 1) cave_reward(run, room, "cave_parcel");
			room.npc.zone_actor.side = "neutral";
			room.npc.zone_actor.idle = true;
			cave_complete(run, room);
			continue;
		}
		if (room.hunt && (room.hunt.kills >= room.hunt.count || now >= room.hunt.deadline)) {
			if (room.hunt.kills >= room.hunt.count) {
				if (!room.hunt.small) cave_reward(run, room, "cave_parcel");
				if (room.hunt.double) cave_reward(run, { id: room.id + ":extra" }, "cave_parcel");
				cave_credit(run, room.hunt.small ? 0 : 5000, 2);
			} else {
				room.no_reward = true;
				cave_say(run, "Time is up. The hunt paid nothing.");
			}
			cave_complete(run, room);
			continue;
		}
		if (
			room.rescue &&
			room.voted &&
			room.decision &&
			room.actors.filter((m) => m.zone_actor.side === "predator").every((m) => m.dead)
		) {
			if (!room.npc.dead) {
				if (room.encounter.kind === "rogue" && !room.rogue_resolved) {
					room.rogue_resolved = true;
					if (cave_random() < 0.5) {
						Object.assign(room.npc.zone_actor, { side: "enemy", betrayed: true, idle: false, next: 0 });
						room.npc.last.attack = really_old;
						room.npc.zone_stats.frequency = 8;
						room.npc.zone_stats.speed = 100;
						calculate_monster_stats(room.npc);
						room.enemies.push(room.npc);
						cave_say(run, "The rogue vanishes behind you. His daggers are already moving.");
						room.rescue = false;
						continue;
					}
				}
				if (room.saving) {
					cave_reward(run, room, room.covering ? "cave_parcel" : "cave_rescue");
					cave_credit(run, 3000, 0);
				}
				room.npc.zone_actor.side = "ally";
				if (room.hiring) cave_follow_actor(run, room.npc);
			}
			cave_complete(run, room);
			continue;
		}
		if (room.rescue && room.npc.dead) {
			for (var m of room.actors)
				if (!m.dead) {
					m.zone_actor.side = "enemy";
					delete m.zone_actor.prey;
				}
			if (room.actors.every((m) => m.dead)) cave_complete(run, room);
		}
		if (room.conflict && (room.npc.dead || room.rival.dead)) {
			var winner = room.npc.dead ? room.rival : room.npc;
			if (room.decision !== "both" || winner.dead) {
				if (!winner.dead) winner.zone_actor.side = "neutral";
				cave_reward(run, room, winner.dead ? "cave_parcel" : "cave_rescue");
				cave_complete(run, room);
				continue;
			}
		}
		if (room.escort && !room.npc.dead) {
			var door =
				G.maps[room.map].doors.find((d) => generated_maps[d[4]]?.floor.definition.generated.floor > room.floor) ||
				G.maps[room.map].doors[0];
			if (door && simple_distance(room.npc, { x: door[0], y: door[1], map: room.map, in: room.map }) < 120) {
				cave_reward(run, room, "cave_rescue");
				cave_credit(run, 3000, 0);
				cave_complete(run, room);
			}
		}
		if (room.enemies.length && room.enemies.every((m) => m.dead) && !room.rescue && !room.hunt && !room.conflict) {
			if (!room.no_reward && room.kind === "encounter") cave_reward(run, room, "cave_parcel");
			cave_complete(run, room);
		}
	}
	for (var actor of state.actors) cave_actor_tick(run, actor, now, people);
	if (now - state.last_publish >= 1000) cave_publish(run);
}
function cave_snapshot(run, player) {
	var state = run.cave,
		v = state.vote,
		floor = generated_entry(player)?.floor.definition.generated.floor;
	if (v?.resolved && player.cave_room) v = state.rooms.find((r) => r.id === player.cave_room)?.vote || v;
	return {
		run: run.key,
		expires: run.expires,
		level: run.level,
		floor,
		gold: state.gold,
		amber: state.amber,
		supplies: Object.keys(state.flags).filter((k) => state.flags[k]),
		roster: run.members.map((m) => ({ name: m.name, left: m.left })),
		objectives: state.rooms
			.filter((r) => r.required && r.floor === floor)
			.map((r) => ({
				id: r.id,
				x: r.x,
				y: r.y,
				done: r.done,
				name: r.encounter?.name || (r.kind === "boss" ? "Break the last seal" : "Clear the guardroom"),
			})),
		choice: v
			? {
					id: v.id,
					title: v.room.encounter.name,
					text: v.room.encounter.text,
					deadline: v.deadline,
					resolved: v.resolved,
					result: v.result,
					votes: Object.fromEntries(
						run.members.filter((m) => v.votes[m.character]).map((m) => [m.name, v.votes[m.character]]),
					),
					options: v.options.map((o) => ({ id: o.id, label: o.label, cost: o.cost || 0, amber: o.amber || 0 })),
					fallback:
						v.fallback === "time"
							? "Wait and lose 45 seconds"
							: v.fallback === "revive_landing"
								? "Return to the doorway"
								: v.room.rescue || v.room.rival
									? "Leave them to fight"
									: v.room.required
										? "Pass; fight the guards instead"
										: "Stay out of it",
					skin: v.room.npc?.skin,
					cx: v.room.npc?.cx,
					people: [v.room.npc, v.room.rival].filter(Boolean).map((a) => ({
						name: a.name,
						hp: a.hp,
						max_hp: a.max_hp,
						attack: a.attack,
						slots: a.slots,
						cargo: a === v.room.npc ? v.room.cargo : undefined,
					})),
					service: v.room.decision === "recipes" ? "recipes" : null,
					shop: v.room.stock ? Object.assign({ room: v.room.id }, v.room.stock) : null,
				}
			: null,
		hunts: state.rooms
			.filter((r) => r.hunt && !r.done)
			.map((r) => ({ room: r.id, kills: r.hunt.kills, count: r.hunt.count, deadline: r.hunt.deadline })),
	};
}
function cave_publish(run, open = false) {
	run.cave.last_publish = Date.now();
	for (var actor of run.cave.actors) {
		var state = [actor.zone_actor.side, actor.zone_actor.rare, actor.zone_actor.betrayed].join(":");
		if (state !== actor.zone_actor.client_state) {
			actor.zone_actor.client_state = state;
			actor.u = true;
			actor.cid = (actor.cid || 0) + 1;
		}
	}
	for (var player of cave_players(run)) {
		var state = cave_snapshot(run, player);
		player.cave = state;
		player.socket.emit("cave", { type: open ? "choice" : "state", state });
	}
}
async function cave_interaction(player, data) {
	if (data.action === "enter") return open_generated_zone(player);
	var entry = generated_entry(player),
		run = entry?.record,
		member = generated_member(run, player);
	if (!run || !member || member.left || run.expires <= Date.now()) throw Error("cave_closed");
	if (data.action === "exit") {
		cave_settle_purse(run);
		generated_exit(player, "exit");
		return { exited: true };
	}
	if (data.action === "state") return { state: cave_snapshot(run, player) };
	if (data.action === "talk") {
		var room = run.cave.rooms.find((r) => r.id === data.room);
		if (!room?.npc || room.npc.dead || player.map !== room.map || simple_distance(player, room.npc) > 160)
			throw Error("distance");
		cave_begin_vote(run, room);
		player.cave_room = room.id;
		var state = cave_snapshot(run, player);
		player.socket.emit("cave", { type: "choice", state });
		return { state };
	}
	if (player.rip && !(data.action === "vote" && run.cave.vote?.room.kind === "revival")) throw Error("defeated");
	if (data.action === "vote") {
		var vote = run.cave.vote;
		if (!vote || data.choice !== vote.id || !vote.voters.includes(player.real_id)) throw Error("stale_choice");
		if (vote.votes[player.real_id] === data.option)
			return { choice: vote.id, vote: data.option, resolved: vote.resolved };
		cave_resolve_vote(run, Date.now());
		if (vote.resolved || Date.now() >= vote.deadline) throw Error("vote_closed");
		if (!vote.options.some((o) => o.id === data.option)) throw Error("invalid_reply");
		if (vote.votes[player.real_id]) throw Error("already_voted");
		vote.votes[player.real_id] = data.option;
		cave_resolve_vote(run, Date.now());
		cave_publish(run);
		return { choice: vote.id, vote: data.option, resolved: vote.resolved, result: vote.result };
	}
	if (data.action === "buy") {
		var room = run.cave.rooms.find((r) => r.id === data.room);
		if (!room?.stock || room.stock.sold || !room.npc || room.npc.dead) throw Error("sold_out");
		if (player.map !== room.map || simple_distance(player, room.npc) > 160) throw Error("distance");
		if (player.gold < room.stock.price) throw Error("gold_not_enough");
		room.stock.sold = true;
		player.gold -= room.stock.price;
		var recipient = cave_item(run, room.id + ":purchase", room.stock.name);
		resend(player, "u+cid");
		cave_publish(run);
		return { recipient: recipient.name, item: room.stock.name, gold: room.stock.price };
	}
	throw Error("invalid_interaction");
}

// Empty floors retain only actor state and room outcomes. Geometry and navigation are rebuilt from the seed.
function cave_suspend_floor(run, map, onlyRoom) {
	var fields = [
		"id",
		"type",
		"x",
		"y",
		"hp",
		"max_hp",
		"mp",
		"max_mp",
		"xp",
		"range",
		"level",
		"skin",
		"name",
		"cx",
		"slots",
		"s",
		"zone_stats",
	];
	for (var room of run.cave.rooms.filter((r) => r.map === map && (!onlyRoom || r === onlyRoom))) {
		if (room.saved) continue;
		room.saved = room.actors
			.filter((a) => !a.dead)
			.map((a) => {
				var state = {};
				for (var field of fields) if (a[field] !== undefined) state[field] = JSON.parse(JSON.stringify(a[field]));
				state.zone_actor = Object.assign({}, a.zone_actor, { prey: a.zone_actor.prey?.id || null });
				state.enemy = room.enemies.includes(a);
				state.npc = room.npc === a;
				state.rival = room.rival === a;
				run.cave.actors.delete(a);
				if (onlyRoom) remove_monster(a);
				return state;
			});
		room.actors = [];
		room.enemies = [];
		room.npc = room.npc?.dead ? { dead: true } : null;
		room.rival = room.rival?.dead ? { dead: true } : null;
	}
}
function cave_resume_floor(run, map, onlyRoom) {
	var restored = new Map();
	for (var room of run.cave.rooms.filter((r) => r.map === map && (!onlyRoom || r === onlyRoom))) {
		for (var state of room.saved || []) {
			var actor = new_monster(
				map,
				{ type: state.type, position: [state.x, state.y], radius: 0, gold: 0 },
				{ temp: true },
			);
			delete instances[map].monsters[actor.id];
			Object.assign(actor, state);
			delete actor.enemy;
			delete actor.npc;
			delete actor.rival;
			actor.socket = false_socket;
			actor.zone_actor = Object.assign({}, state.zone_actor, { path_token: null });
			actor.last_level = future_s(86400);
			instances[map].monsters[actor.id] = actor;
			restored.set(actor.id, actor);
			room.actors.push(actor);
			run.cave.actors.add(actor);
			if (state.enemy) room.enemies.push(actor);
			if (state.npc) room.npc = actor;
			if (state.rival) room.rival = actor;
		}
		delete room.saved;
	}
	for (var actor of restored.values()) {
		actor.zone_actor.prey = restored.get(actor.zone_actor.prey) || players[actor.zone_actor.prey] || null;
		calculate_monster_stats(actor);
	}
}

function cave_fallen(player) {
	var run = generated_entry(player)?.record;
	if (!run?.cave || run.closing) return;
	if (!run.cave.vote || run.cave.vote.resolved) cave_offer_rescue(run, player);
}
function cave_offer_rescue(run, player) {
	if (run.cave.vote && !run.cave.vote.resolved) return;
	var old = run.cave.rooms.find((r) => r.kind === "revival" && !r.done && r.map === player.map);
	if (old) return;
	var landing = G.maps[player.map].spawns[0];
	var point = safe_xy_nearby(player.map, player.x + 32, player.y) ||
		safe_xy_nearby(player.map, player.x, player.y) || { x: landing[0], y: landing[1] };
	var room = {
		id: "rescue:" + ++run.cave.serial,
		kind: "revival",
		floor: generated_entry(player).floor.definition.generated.floor,
		map: player.map,
		x: point.x,
		y: point.y - 48,
		bounds: [player.x - 64, player.y - 64, player.x + 64, player.y + 64],
		started: true,
		required: false,
		done: false,
		actors: [],
		enemies: [],
		encounter: {
			name: "A Hand in the Dark",
			group: "positive",
			text: "Still with us? I can get you up here, or take you back to the doorway. You have lost no gold or experience.",
			options: [
				{ id: "here", label: "Get us up here. The fight continues.", effect: "revive_here" },
				{ id: "landing", label: "Take us back to this floor’s doorway.", effect: "revive_landing" },
			],
		},
	};
	run.cave.rooms.push(room);
	room.npc = cave_spawn(run, room, "cave_npc", "neutral", 0, { name: "Nera", skin: "mf_blue", cx: {} });
	if (!room.npc) {
		run.cave.rooms.pop();
		return;
	}
	cave_begin_vote(run, room);
	run.cave.vote.fallback = "revive_landing";
	cave_publish(run, true);
}

function cave_follow_through(run, from, player) {
	var followers = [...run.cave.actors].filter((a) => a.map === from && a.zone_actor.follow && !a.dead).slice(0, 2);
	for (var actor of followers) {
		var old = run.cave.rooms.find((r) => r.id === actor.zone_actor.room);
		if (old.escort && !old.done) continue;
		var point = safe_xy_nearby(player.map, player.x + 48, player.y + 48);
		if (!point) continue;
		var room = {
			id: "follower:" + actor.id,
			kind: "follower",
			map: player.map,
			floor: generated_entry(player).floor.definition.generated.floor,
			x: point.x,
			y: point.y,
			started: true,
			done: true,
			actors: [actor],
			enemies: [],
		};
		old.actors = old.actors.filter((a) => a !== actor);
		if (old.npc === actor) old.npc = null;
		run.cave.rooms = run.cave.rooms.filter((r) => r.id !== room.id);
		run.cave.rooms.push(room);
		actor.zone_actor.room = room.id;
		transport_monster_to(actor, player.in, player.map, point.x, point.y);
	}
}

function cave_follow_actor(run, actor) {
	if (actor?.zone_actor.follow) return true;
	var count = [...run.cave.actors].filter((a) => a.zone_actor.follow && !a.dead).length;
	for (var room of run.cave.rooms) count += (room.saved || []).filter((a) => a.zone_actor.follow).length;
	if (count >= 2) {
		cave_say(run, "You already have two helpers. Take 2 Amber instead.");
		cave_credit(run, 0, 2);
		return false;
	}
	if (actor) Object.assign(actor.zone_actor, { follow: true, idle: false });
	return true;
}
function cave_add_follower(run, room, type) {
	if (!cave_follow_actor(run, null)) return;
	var look = type === "cave_npc" ? cave_pick(G.events.dreams.cast.expedition_captain) : null;
	var actor = cave_spawn(run, room, type, "ally", 80, look);
	if (actor) {
		actor.zone_actor.follow = true;
		actor.zone_actor.idle = false;
		actor.xp = 0;
	}
}
function cave_venture(run, room, option) {
	var total = option.outcomes.reduce((sum, o) => sum + o.weight, 0),
		roll = cave_random() * total;
	var outcome = option.outcomes[option.outcomes.length - 1];
	for (var candidate of option.outcomes) {
		roll -= candidate.weight;
		if (roll < 0) {
			outcome = candidate;
			break;
		}
	}
	cave_say(run, outcome.text);
	for (var flag of outcome.flags || []) run.cave.flags[flag] = true;
	cave_credit(run, outcome.gold, outcome.amber);
	if (outcome.reward) cave_reward(run, room, outcome.reward);
	if (outcome.ally) cave_add_follower(run, room, outcome.ally);
	if (outcome.shadow) {
		var strongest = cave_players(run)
			.filter((p) => !p.rip)
			.sort((a, b) => b.attack - a.attack)[0];
		if (strongest) {
			var shadow = cave_spawn(run, room, "cave_npc", "enemy", 80, {
				name: strongest.name + "’s Shadow",
				skin: strongest.skin,
				cx: strongest.cx,
			});
			if (shadow) {
				shadow.slots = JSON.parse(JSON.stringify(strongest.slots));
				shadow.hp = shadow.max_hp = strongest.max_hp * 2;
				Object.assign(shadow.zone_stats, {
					attack: strongest.attack * 0.7,
					frequency: strongest.frequency,
					speed: strongest.speed,
				});
				calculate_monster_stats(shadow);
				return;
			}
		}
	}
	if (outcome.fight) {
		cave_pack(run, room, outcome.fight[0], outcome.fight[1]);
		return;
	}
	cave_complete(run, room);
}

function cave_wake_near(run, player) {
	for (var room of run.cave.rooms)
		if (room.map === player.map && room.saved && simple_distance(player, room) < 900)
			cave_resume_floor(run, room.map, room);
}
