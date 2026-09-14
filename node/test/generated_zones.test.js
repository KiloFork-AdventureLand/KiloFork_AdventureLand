const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const { load, read, socketHandler } = require("./helpers/server_vm");
const G = require("./helpers/design");
const clone = (value) => JSON.parse(JSON.stringify(value));

function fixture() {
	const p = {
		real_id: "a",
		owner: "owner",
		name: "A",
		map: "zone_a",
		in: "zone_a",
		socket: { id: "a", generated_protocol: 1, emit() {} },
		s: {},
	};
	const run = {
		key: "run",
		members: [
			{ character: "a", owner: "owner", name: "A" },
			{ character: "b", owner: "owner", name: "B" },
			{ character: "c", owner: "other", name: "C" },
		],
		floors: ["zone_a", "zone_b"],
		completed: [],
		expires: Date.now() + 24000,
	};
	const c = vm.createContext({
		G,
		Date,
		Math,
		Set,
		Map,
		console,
		crypto: require("node:crypto"),
		generated_runs: { run },
		generated_maps: {
			zone_a: { record: run, floor: { definition: { generated: { floor: 0 } } } },
			zone_b: { record: run, floor: { definition: { generated: { floor: 1 } } } },
		},
		players: { a: p },
		get_player: () => p,
		check_player: () => true,
		db: {},
		cave_publish() {},
		cave_apply() {},
		cave_say() {},
		TIMEO: { EU: 1, US: -5, ASIA: 7 },
	});
	load(c, "node/logic/generated_maps.js", [
		"generated_entry",
		"generated_member",
		"generated_can_enter",
		"generated_magiport_allowed",
		"generated_daily_window",
	]);
	load(c, "node/logic/cave_of_many_dreams.js", [
		"cave_random",
		"cave_pick",
		"cave_shuffle",
		"cave_credit",
		"cave_resolve_vote",
		"cave_interaction",
		"cave_hostile",
		"cave_accept_attack",
		"cave_damage",
	]);
	return { c, p, run };
}
test("generated travel checks a real destination and fixed membership", () => {
	const { c, p, run } = fixture();
	assert.equal(c.generated_can_enter(p, undefined), false);
	assert.equal(c.generated_can_enter(p, { name: "zone_b", map: "zone_b" }), false);
	run.completed[0] = true;
	assert.equal(c.generated_can_enter(p, { name: "zone_b", map: "zone_b" }), true);
	run.members[0].left = true;
	assert.equal(c.generated_can_enter(p, { name: "zone_b", map: "zone_b" }), false);
	assert.equal(c.generated_can_enter(p, { name: "main", map: "main" }), false);
	assert.equal(c.generated_magiport_allowed(p, { map: "main" }), false);
});
test("home-server midnight uses the same offsets as the game clock", () => {
	const { c } = fixture();
	for (const [home, before, reset] of [
		["USII", "2026-09-14T04:59:59Z", "2026-09-14T05:00:00Z"],
		["EUI", "2026-09-13T22:59:59Z", "2026-09-13T23:00:00Z"],
		["ASIAI", "2026-09-13T16:59:59Z", "2026-09-13T17:00:00Z"],
	]) {
		assert.equal(c.generated_daily_window(home, Date.parse(before)).resets, Date.parse(reset));
		assert.equal(c.generated_daily_window(home, Date.parse(reset)).resets, Date.parse(reset) + 86400000);
	}
});
test("real interaction handler replies to its originating socket after async work", async () => {
	const { c, p } = fixture();
	let resolve;
	const events = [];
	c.socket = { id: "a", emit: (event, data) => events.push({ event, data }) };
	c.players.a = p;
	c.cave_interaction = () => new Promise((r) => (resolve = r));
	const handler = socketHandler(c, "interaction");
	handler({ type: "cave", action: "enter", request_id: "original" });
	c.current_socket = {
		emit() {
			throw Error("wrong socket");
		},
	};
	resolve({ run: "new" });
	await new Promise(setImmediate);
	assert.equal(events[0].data.request_id, "original");
	assert.equal(events[0].data.success, true);
});
test("three characters get independent votes; timeout ties use the published fallback", async () => {
	const { c, p, run } = fixture();
	const effects = [];
	c.cave_apply = (r, room, option) => effects.push(option.effect);
	run.cave = {
		vote: {
			id: "vote",
			room: {},
			deadline: Date.now() + 20000,
			voters: ["a", "b", "c"],
			votes: {},
			options: [
				{ id: "yes", effect: "gift" },
				{ id: "no", effect: "leave" },
			],
			fallback: "leave",
		},
	};
	assert.equal((await c.cave_interaction(p, { action: "vote", choice: "vote", option: "yes" })).resolved, undefined);
	p.real_id = "b";
	await c.cave_interaction(p, { action: "vote", choice: "vote", option: "no" });
	c.cave_resolve_vote(run, Date.now() + 20001);
	assert.deepEqual(effects, ["leave"]);
	await assert.rejects(c.cave_interaction(p, { action: "vote", choice: "bad", option: "yes" }), /stale_choice/);
});
test("neutral disputes do not attack bystanders; only their own reflected spell kills Dark Mages", () => {
	const { c } = fixture(),
		a = { id: "dark", type: "cave_darkmage", in: "zone_a", hp: 1000, zone_actor: { side: "enemy", run: "run" } },
		p = { in: "zone_a" };
	assert.equal(c.cave_accept_attack(a, {}), false);
	assert.equal(c.cave_damage(p, a, { reflected_from: "dark" }, 1), 1000);
	assert.equal(c.cave_hostile({ in: "zone_a", zone_actor: { side: "duel_left" } }, p), false);
	assert.equal(c.cave_hostile({ in: "zone_a", zone_actor: { side: "enemy" } }, p), true);
});
test("cave definitions contain 50 encounters and bounded reward budgets", () => {
	const { c } = fixture(),
		events = G.events.dreams;
	assert.equal(events.encounters.length, 50);
	for (const [group, count] of [
		["mixed", 25],
		["bad", 5],
		["positive", 20],
	])
		assert.equal(events.encounters.filter((e) => e.group === group).length, count);
	for (const e of events.encounters)
		assert.ok(e.options.length >= 5 && new Set(e.options.map((o) => o.id)).size === e.options.length, e.id);
	const run = { cave: { gold: 0, amber: 0, gold_earned: 0, amber_earned: 0 } };
	for (let i = 0; i < 1000; i++) c.cave_credit(run, 60000, 36);
	assert.equal(run.cave.gold, events.gold_limit);
	assert.equal(run.cave.amber, events.amber_limit);
});
test("socket-driven cave visuals are safe with a throwing fake PIXI runtime", () => {
	const c = vm.createContext({
		no_graphics: true,
		character: {},
		G: { maps: {}, geometry: {} },
		current_map: "main",
		PIXI: new Proxy(
			{},
			{
				get() {
					throw Error("PIXI touched");
				},
			},
		),
		call_code_function() {},
	});
	vm.runInContext(read("js/generated_zones.js"), c);
	c.receive_cave_state({ type: "choice", state: { choice: { id: "v" } } });
	c.render_cave_keeper();
	c.render_cave_status();
	c.render_cave_choice();
	c.prune_generated_maps();
	assert.equal(c.character.cave.choice.id, "v");
	c.receive_cave_state({ type: "ended" });
	assert.equal(c.character.cave, null);
});

test("a cave gold letter can be claimed once by its assigned character", async () => {
	const { transactions } = require("./helpers/server_vm");
	const { c, p } = fixture();
	const events = [];
	p.gold = 10;
	c.mode = {};
	c.resend = () => {};
	c.can_add_item = () => true;
	c.cache_item = (i) => i;
	c.add_item = () => {
		throw Error("Gold must not use inventory space");
	};
	c.randomStr = () => require("node:crypto").randomBytes(8).toString("hex");
	c.socket = { id: "a", emit: (event, data) => events.push(data) };
	p.socket = c.socket;
	const mail = {
		_id: "ML_cave:test",
		owner: [p.owner],
		character: p.real_id,
		cave_award: true,
		item: true,
		taken: false,
		info: { item: JSON.stringify({ gold: 1234 }) },
	};
	const store = transactions(c, [mail]);
	c.get = async (id) => clone(store.records.get(id));
	const handler = socketHandler(c, "mail_take_item");
	handler({ id: mail._id, request_id: "one" });
	await new Promise(setImmediate);
	await new Promise(setImmediate);
	assert.equal(p.gold, 1244);
	assert.equal(events.at(-1).success, true);
	handler({ id: mail._id, request_id: "two" });
	await new Promise(setImmediate);
	await new Promise(setImmediate);
	assert.equal(p.gold, 1244);
	assert.equal(events.at(-1).failed, true);
});

test("admission reserves one daily visit per account and rejects a used companion account", async () => {
	const { c, p } = fixture();
	const members = [p, { ...p, name: "B", real_id: "b" }, { ...p, name: "C", real_id: "c", owner: "other" }];
	for (const player of members)
		Object.assign(player, {
			map: "main",
			in: "main",
			p: { home: "USII" },
			level: 25,
			socket: { generated_protocol: 1 },
		});
	const claims = new Map();
	const collection = {
		async updateOne(query, update) {
			if (claims.has(query._id)) throw Object.assign(Error("duplicate"), { code: 11000 });
			claims.set(query._id, update.$set);
		},
		async updateMany(query, update) {
			let matchedCount = 0;
			for (const id of query._id.$in)
				if (claims.get(id)?.run === query.run) {
					Object.assign(claims.get(id), update.$set);
					matchedCount++;
				}
			return { matchedCount };
		},
		async deleteMany(query) {
			for (const id of query._id.$in) if (claims.get(id)?.run === query.run) claims.delete(id);
		},
	};
	Object.assign(c, {
		generated_runs: {},
		generated_openings: new Set(),
		crypto: require("node:crypto"),
		db: { collection: () => collection },
		region: "US",
		server_name: "II",
		generated_party: () => members,
		can_walk: () => true,
		simple_distance: () => 0,
		get_player: (name) => members.find((p) => p.name === name),
		prepare_generated_run: async () => [],
		install_generated_run: (run) => {
			run.floors = ["floor"];
		},
		cave_start() {},
		generated_transport() {},
	});
	load(c, "node/logic/generated_maps.js", ["generated_admission", "open_generated_zone"]);
	await c.open_generated_zone(p);
	assert.deepEqual([...claims.keys()].filter((id) => id.startsWith("daily:")).sort(), [
		"daily:dreams:other",
		"daily:dreams:owner",
	]);
	assert.equal(claims.size, 5);
	claims.delete("daily:dreams:other");
	await assert.rejects(c.open_generated_zone(p), /daily_opening_used/);
	assert.equal(claims.has("daily:dreams:other"), false, "failed admission returns its new reservation");
	assert.equal(claims.get("daily:dreams:owner").state, "active", "another account's used visit stays used");
});

test("Nera can use the doorway when a fallen character is beside a wall", () => {
	const { c, p, run } = fixture();
	c.G = { ...G, maps: { zone_a: { spawns: [[100, 200]] } } };
	run.cave = { rooms: [], serial: 0, vote: null };
	c.safe_xy_nearby = () => false;
	c.cave_spawn = (r, room) => {
		assert.equal(room.x, 100);
		assert.equal(room.y + 48, 200);
		return {};
	};
	c.cave_begin_vote = (r) => {
		r.cave.vote = {};
	};
	load(c, "node/logic/cave_of_many_dreams.js", ["cave_offer_rescue"]);
	c.cave_offer_rescue(run, p);
	assert.equal(run.cave.vote.fallback, "revive_landing");
	assert.equal(run.cave.rooms.length, 1);
});

test("passing a rescue or a dispute lets the NPC fight continue", () => {
	const { c, run } = fixture();
	run.cave = { gold: 0, amber: 0, flags: {} };
	c.cave_complete = () => {
		throw Error("The fight must continue");
	};
	load(c, "node/logic/cave_of_many_dreams.js", ["cave_apply"]);
	const rescue = { rescue: true, actors: [], encounter: { group: "mixed" } };
	c.cave_apply(run, rescue, { effect: "leave" });
	assert.equal(rescue.decision, "watch");
	assert.equal(rescue.saving, false);
	const dispute = { npc: { zone_actor: {} }, rival: { zone_actor: {} }, encounter: { group: "mixed" } };
	c.cave_apply(run, dispute, { effect: "leave" });
	assert.equal(dispute.conflict, true);
	assert.equal(dispute.npc.zone_actor.prey, dispute.rival);
	assert.equal(dispute.rival.zone_actor.prey, dispute.npc);
});
