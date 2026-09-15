// Shared server scope. Map delivery and admission are independent of zone content.
var generated_runs = Object.create(null);
var generated_maps = Object.create(null);
var generated_openings = new Set();
var generated_layout_queue = require("./logic/generated_layouts").createLayoutQueue(() => ({
	maps: {},
	geometry: {},
	monsters: G.monsters,
	dimensions: G.dimensions,
}));
var generated_last_tick = 0;

function generated_clock(record, now = Date.now()) {
	return record.paused_at || now;
}

function generated_member(record, player) {
	return record && player && record.members.find((m) => m.character === player.real_id && m.owner === player.owner);
}
function generated_entry(player) {
	return player && generated_maps[player.map];
}
function generated_can_enter(player, instance) {
	var to = instance && generated_maps[instance.map],
		from = generated_entry(player);
	if (!to && !from) return true;
	if (player.zone_transfer && player.zone_transfer === (instance && instance.name)) return true;
	if (
		!to ||
		!from ||
		to.record !== from.record ||
		to.record.closing ||
		to.record.paused_at ||
		to.record.expires <= generated_clock(to.record)
	)
		return false;
	var member = generated_member(to.record, player);
	return !!(
		member &&
		!member.left &&
		player.socket.generated_protocol === 1 &&
		(to.floor.definition.generated.floor <= from.floor.definition.generated.floor ||
			to.record.completed[from.floor.definition.generated.floor])
	);
}
function generated_magiport_allowed(a, b) {
	return !generated_entry(a) && !generated_entry(b);
}
function restore_generated_maps() {
	for (var run of Object.values(generated_runs))
		for (var info of run.manifest) G.maps[info.key] = Object.assign({}, info.definition);
	for (var key in generated_maps) {
		var floor = generated_maps[key].floor;
		G.maps[key] = floor.definition;
		G.geometry[key] = floor.geometry;
		G.maps[key].data = floor.geometry;
	}
}
function prepare_generated_run(seed, key, exit_spawn) {
	return generated_layout_queue.build({ zone: "dreams", seed, key, exit_spawn });
}
function install_generated_floor(record, floor) {
	if (generated_maps[floor.key]) return;
	if (
		!record.floors.includes(floor.key) ||
		floor.definition.generated.run !== record.key ||
		floor.smap === -1 ||
		!Object.keys(floor.amap || {}).length
	)
		throw Error("invalid_floor");
	delete floor.manifest;
	generated_maps[floor.key] = { record, floor, last_occupied: Date.now() };
	G.maps[floor.key] = floor.definition;
	G.geometry[floor.key] = floor.geometry;
	G.maps[floor.key].data = floor.geometry;
	smap_data[floor.key] = floor.smap;
	amap_data[floor.key] = floor.amap;
	floor.worker = parseInt(record.key.slice(0, 6), 16) % workers.length;
	var collision = Object.fromEntries(
		Object.entries(floor.geometry).filter(([key]) => !["tiles", "placements", "groups"].includes(key)),
	);
	workers[floor.worker].postMessage({
		type: "map_data",
		map: floor.key,
		definition: Object.assign({}, floor.definition, { data: collision }),
		geometry: collision,
		smap_data: floor.smap,
		amap_data: floor.amap,
	});
	var instance = create_instance(floor.key, floor.key);
	instance.operators = 0;
	instance.info.zone = { run: record.key, floor: floor.definition.generated.floor, expires: record.expires };
	if (record.paused_at) freeze_instance(instance, Date.now());
}
function install_generated_run(record, floors) {
	if (floors.length !== 1 || generated_runs[record.key]) throw Error("invalid_zone");
	record.manifest = JSON.parse(JSON.stringify(floors[0].manifest));
	record.floors = record.manifest.map((f) => f.key);
	record.completed = [];
	record.building = Object.create(null);
	generated_runs[record.key] = record;
	for (var info of record.manifest) G.maps[info.key] = Object.assign({}, info.definition);
	try {
		install_generated_floor(record, floors[0]);
	} catch (error) {
		destroy_generated_run(record.key);
		throw error;
	}
}
function unload_generated_floor(record, key) {
	if (!generated_maps[key]) return;
	cave_suspend_floor(record, key);
	destroy_instance(key);
	delete G.geometry[key];
	delete smap_data[key];
	delete amap_data[key];
	delete generated_maps[key];
	var definition = record.manifest.find((f) => f.key === key).definition;
	G.maps[key] = Object.assign({}, definition);
	delete G.maps[key].data;
	for (var worker of workers) worker.postMessage({ type: "remove_map", map: key });
}
async function ensure_generated_floor(record, index) {
	var key = record.floors[index];
	if (!key) throw Error("cant_enter");
	if (generated_maps[key]) return;
	if (!record.building[key])
		record.building[key] = generated_layout_queue
			.build({ zone: record.zone, seed: record.seed, key: record.key, exit_spawn: record.exit_spawn, floor: index })
			.then((floors) => {
				if (record.closing || record.expires <= generated_clock(record) || !generated_runs[record.key])
					throw Error("cave_closed");
				install_generated_floor(record, floors[0]);
			})
			.finally(() => {
				delete record.building[key];
			});
	return record.building[key];
}
async function generated_use_door(player, data) {
	var from = generated_entry(player),
		record = from?.record,
		source = player.map;
	if (!record || !can_walk(player) || player.rip) throw Error("use_exit");
	var member = generated_member(record, player),
		index = record.floors.indexOf(data.to);
	if (!member || member.left || record.closing || record.expires <= generated_clock(record)) throw Error("cave_closed");
	if (record.paused_at) throw Error("cave_paused");
	var door = G.maps[source].doors.find((d) => d[4] === data.to && (d[5] || 0) === (data.s || 0));
	function reachable() {
		if (!door || player.map !== source || !check_player(player)) return false;
		return is_door_close(source, door, player.x, player.y) && can_use_door(source, door, player.x, player.y);
	}
	if (!reachable()) throw Error("transport_cant_reach");
	if (door[4] === "main") return cave_interaction(player, { action: "exit" });
	if (index < 0) throw Error("use_exit");
	if (index > from.floor.definition.generated.floor && !record.completed[from.floor.definition.generated.floor])
		throw Error("seal_closed");
	if (!generated_maps[data.to]) cave_say(record, "The stairway is opening. Stay near the landing.");
	await ensure_generated_floor(record, index);
	if (!reachable() || !can_walk(player) || !generated_can_enter(player, instances[data.to]))
		throw Error("transport_failed");
	generated_transport(player, data.to, door[5] || 0, 1);
	cave_follow_through(record, source, player);
	cave_wake_near(record, player);
	cave_publish(record);
	return { map: data.to };
}
function send_generated_maps(socket, map_name) {
	var entry = generated_maps[map_name];
	if (!entry) {
		socket.generated_run = null;
		socket.generated_floor = null;
		return;
	}
	if (socket.generated_floor === map_name) return;
	if (socket.generated_protocol !== 1) throw Error("client_update_required");
	var floors = [map_name].map(function (key) {
		var floor = generated_maps[key].floor;
		var definition = Object.assign({}, floor.definition);
		delete definition.data;
		var geometry = floor.geometry;
		if (socket.generated_headless)
			geometry = {
				x_lines: geometry.x_lines,
				y_lines: geometry.y_lines,
				min_x: geometry.min_x,
				min_y: geometry.min_y,
				max_x: geometry.max_x,
				max_y: geometry.max_y,
				tiles: [],
				placements: [],
				groups: [],
				animations: [],
			};
		return { key, definition, geometry, navigation: socket.generated_headless ? floor.amap : undefined };
	});
	var text = JSON.stringify({ run: entry.record.key, floors, manifest: entry.record.manifest });
	if (text.length > 16 * 1024 * 1024) throw Error("zone_delivery_limit");
	var size = 12000,
		count = Math.ceil(text.length / size);
	for (var index = 0; index < count; index++)
		socket.emit("map_chunk", {
			run: entry.record.key,
			index,
			count,
			text: text.slice(index * size, (index + 1) * size),
		});
	socket.generated_run = entry.record.key;
	socket.generated_floor = map_name;
}
function generated_transport(player, name, spawn, effect) {
	player.zone_transfer = name;
	try {
		return transport_player_to(player, name, spawn, effect);
	} finally {
		delete player.zone_transfer;
	}
}
function generated_exit(player, reason) {
	var entry = generated_entry(player);
	if (!entry) return false;
	var record = entry.record,
		member = generated_member(record, player);
	release_frozen_player(player);
	if (member && !member.left) {
		member.left = true;
		member.left_reason = reason;
		void db
			.collection("GeneratedZone")
			.updateOne({ _id: "member:" + member.character, run: record.key }, { $set: { active: false } })
			.catch((e) => log_trace("zone exit", e));
	}
	player.socket.emit("cave", { type: "ended", reason, state: record.cave ? cave_snapshot(record, player) : null });
	delete player.cave;
	generated_transport(player, "main", record.exit_spawn, 1);
	return true;
}
function destroy_generated_run(key) {
	var record = generated_runs[key];
	if (!record || record.closing) return;
	record.closing = true;
	if (record.cave) cave_settle_purse(record);
	for (var member of record.members) {
		var p = get_player(member.name);
		if (p && generated_entry(p)?.record === record) generated_exit(p, "closed");
	}
	for (var map_name of record.floors || []) {
		if (instances[map_name]) destroy_instance(map_name);
		for (var id in chests) if (chests[id].in === map_name) delete chests[id];
		delete G.maps[map_name];
		delete G.geometry[map_name];
		delete smap_data[map_name];
		delete amap_data[map_name];
		delete generated_maps[map_name];
		for (var worker of workers) worker.postMessage({ type: "remove_map", map: map_name });
	}
	void db
		.collection("GeneratedZone")
		.updateMany({ run: key, active: true }, { $set: { active: false } })
		.catch((e) => log_trace("zone close", e));
	delete generated_runs[key];
}
function generated_maps_tick() {
	var now = Date.now();
	if (now - generated_last_tick < 100) return;
	generated_last_tick = now;
	for (var key in generated_runs) {
		var record = generated_runs[key];
		if (record.expires <= generated_clock(record, now)) {
			destroy_generated_run(key);
			continue;
		}
		for (var member of record.members) {
			var p = get_player(member.name);
			if (!member.left && (!p || p.real_id !== member.character || p.socket.disconnected || p.dc)) member.left = true;
		}
		if (record.members.every((m) => m.left)) {
			destroy_generated_run(key);
			continue;
		}
		cave_tick(record, now);
		for (var key of record.floors) {
			var entry = generated_maps[key];
			if (!entry) continue;
			if (record.members.some((m) => !m.left && get_player(m.name)?.map === key)) entry.last_occupied = now;
			else if (now - entry.last_occupied > 20000) unload_generated_floor(record, key);
		}
	}
}
function generated_party(player) {
	return Object.values(players).filter((p) => p === player || (player.party && p.party === player.party));
}
function generated_admission(player, members) {
	if (!check_player(player) || player.rip || player.map !== "main" || !can_walk(player)) throw Error("cant_enter");
	if (members.length < 1 || members.length > 3) throw Error("party_too_large");
	if (
		members.some(
			(p) =>
				p.rip ||
				p.dc ||
				p.socket.disconnected ||
				p.map !== "main" ||
				!can_walk(p) ||
				p.targets > 0 ||
				p.socket.generated_protocol !== 1 ||
				simple_distance(p, { map: "main", in: "main", x: 816, y: 1200 }) > 160,
		)
	)
		throw Error("bring_party_to_keeper");
	if (members.some((p) => generated_entry(p))) throw Error("already_inside");
}
async function open_generated_zone(player) {
	var members = generated_party(player);
	generated_admission(player, members);
	var accounts = [
		...new Map(
			members
				.slice()
				.sort((a, b) => a.real_id.localeCompare(b.real_id))
				.map((p) => [p.owner, p]),
		).values(),
	];
	if (accounts.some((p) => generated_openings.has(p.owner))) throw Error("already_opening");
	if (Object.keys(generated_runs).length >= 72) throw Error("zone_busy");
	accounts.forEach((p) => generated_openings.add(p.owner));
	var key = crypto.randomBytes(12).toString("hex"),
		collection = db.collection("GeneratedZone");
	var claimed = [],
		reserved = [],
		activated = false;
	try {
		for (var account of accounts.sort((a, b) => a.owner.localeCompare(b.owner))) {
			// Dev visits do not read or consume the account's daily reservation.
			// Character locks and all party admission checks still apply.
			if (Dev && !Prod) continue;
			var daily = "daily:dreams:" + account.owner,
				window = generated_daily_window(account.p.home || region + server_name);
			try {
				await collection.updateOne(
					{ _id: daily, $or: [{ resets: { $lte: Date.now() } }, { state: "preparing", lease: { $lt: Date.now() } }] },
					{
						$set: {
							run: key,
							owner: account.owner,
							state: "preparing",
							home: window.home,
							resets: window.resets,
							lease: Date.now() + 180000,
						},
					},
					{ upsert: true },
				);
				reserved.push(daily);
			} catch (error) {
				if (error.code === 11000) throw Error("daily_opening_used");
				throw error;
			}
		}
		for (var p of members) {
			var id = "member:" + p.real_id;
			try {
				await collection.updateOne(
					{ _id: id, $or: [{ active: false }, { expires: { $lt: Date.now() } }] },
					{ $set: { run: key, active: true, expires: Date.now() + 30 * 60 * 1000 } },
					{ upsert: true },
				);
			} catch (error) {
				if (error.code === 11000) throw Error("character_already_entering");
				throw error;
			}
			claimed.push(id);
		}
		var exit_spawn = G.maps.main.spawns.findIndex((s) => s[0] === 816 && s[1] === 1200);
		var seed = crypto.randomBytes(16).toString("hex");
		var floors = await prepare_generated_run(seed, key, exit_spawn);
		generated_admission(player, members);
		await cave_enter_effect(members, key);
		generated_admission(player, members);
		if (
			members.some((p) => get_player(p.name) !== p) ||
			generated_party(player).some((p) => !members.includes(p)) ||
			members.some((p) => p !== player && p.party !== player.party)
		)
			throw Error("party_changed");
		var record = {
			key,
			seed,
			zone: "dreams",
			owner: player.owner,
			exit_spawn,
			level: Math.max(...members.map((p) => p.level)),
			expires: Date.now() + 24 * 60 * 1000,
			members: members.map((p) => ({ name: p.name, character: p.real_id, owner: p.owner, left: false })),
		};
		var admission = await collection.updateMany(
			{ _id: { $in: reserved }, run: key, state: "preparing", lease: { $gt: Date.now() } },
			{ $set: { state: "active", expires: record.expires } },
		);
		if (admission.matchedCount !== reserved.length) throw Error("admission_expired");
		var locks = await collection.updateMany(
			{ _id: { $in: claimed }, run: key, active: true, expires: { $gt: Date.now() } },
			{ $set: { expires: record.expires } },
		);
		if (locks.matchedCount !== claimed.length) throw Error("admission_expired");
		generated_admission(player, members);
		install_generated_run(record, floors);
		cave_start(record);
		activated = true;
		for (var p of members) generated_transport(p, record.floors[0], 0, 1);
		cave_publish(record);
		return { run: key, expires: record.expires, level: record.level };
	} finally {
		accounts.forEach((p) => generated_openings.delete(p.owner));
		if (!activated) {
			if (generated_runs[key]) destroy_generated_run(key);
			if (reserved.length) await collection.deleteMany({ _id: { $in: reserved }, run: key });
			if (claimed.length) await collection.updateMany({ _id: { $in: claimed }, run: key }, { $set: { active: false } });
		}
	}
}
async function enter_dreams(player, data) {
	try {
		if (data.name) throw Error("cant_reenter");
		var result = await open_generated_zone(player);
		player.socket.emit("game_response", Object.assign({ place: "enter", success: true }, result));
	} catch (error) {
		player.socket.emit("game_response", { place: "enter", failed: true, reason: error.message });
	}
}

function generated_daily_window(home, now = Date.now()) {
	var region_name = Object.keys(TIMEO).find((r) => home.startsWith(r));
	if (!region_name) throw Error("invalid_home_server");
	var offset = TIMEO[region_name] * 60 * 60 * 1000;
	var midnight = Math.floor((now + offset) / 86400000) * 86400000;
	return { home, resets: midnight + 86400000 - offset };
}

async function generated_visit_info(player) {
	var window = generated_daily_window(player.p.home || region + server_name);
	if (Dev && !Prod)
		return { available: true, unlimited: true, resets: window.resets, home: window.home, server_time: Date.now() };
	var daily = await db
		.collection("GeneratedZone")
		.findOne({ _id: "daily:dreams:" + player.owner }, { projection: { resets: 1, state: 1, lease: 1 } });
	var used = daily && daily.resets > Date.now() && (daily.state === "active" || daily.lease > Date.now());
	return { available: !used, resets: used ? daily.resets : window.resets, home: window.home, server_time: Date.now() };
}

// Movement workers keep only their assigned generated floors, including after a worker restart.
function generated_worker_data(index) {
	var maps = {},
		geometry = {},
		smaps = {},
		amaps = {};
	for (var key in G.maps) {
		if (G.maps[key].generated && generated_maps[key]?.floor.worker !== index) continue;
		maps[key] = G.maps[key];
		if (G.geometry[key]) geometry[key] = G.geometry[key];
		if (smap_data[key] !== undefined) smaps[key] = smap_data[key];
		if (amap_data[key]) amaps[key] = amap_data[key];
	}
	return { G: Object.assign({}, G, { maps, geometry }), smap_data: smaps, amap_data: amaps };
}
