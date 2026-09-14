var generated_map_chunks = null;
var client_generated_maps = [];
function receive_generated_map_chunk(data) {
	if (!data || !/^[a-f0-9]{24}$/.test(data.run) || !Number.isInteger(data.index) || !Number.isInteger(data.count) ||
		data.count < 1 || data.count > 1400 || typeof data.text !== "string" || data.text.length > 12000)
		throw Error("Invalid map chunk");
	if (data.index === 0) generated_map_chunks = { run: data.run, count: data.count, parts: [], size: 0 };
	var pending = generated_map_chunks;
	if (!pending || data.run !== pending.run || data.count !== pending.count || data.index !== pending.parts.length)
		throw Error("Out-of-order map chunk");
	pending.parts.push(data.text); pending.size += data.text.length;
	if (pending.size > 16 * 1024 * 1024) { generated_map_chunks = null; throw Error("Oversized generated map"); }
	if (pending.parts.length !== pending.count) return;
	generated_map_chunks = null;
	var bundle = JSON.parse(pending.parts.join(""));
	if (bundle.run !== data.run || !Array.isArray(bundle.floors) || (bundle.floors.length < 1 || bundle.floors.length > 8)) throw Error("Invalid generated bundle");
	for (var i = 0; i < bundle.floors.length; i++) {
		var floor = bundle.floors[i];
		if (floor.key !== "zone_" + bundle.run + "_" + floor.definition.generated.floor || floor.definition.generated.run !== bundle.run ||
			!Array.isArray(floor.geometry.x_lines) || !Array.isArray(floor.geometry.y_lines)) throw Error("Invalid generated floor");
	}
	for (var info of bundle.manifest || []) {
		if (info.key !== "zone_" + bundle.run + "_" + info.definition.generated.floor) throw Error("Invalid floor manifest");
		if (!G.maps[info.key]) { G.maps[info.key] = info.definition; client_generated_maps.push(info.key); }
	}
	for (var floor of bundle.floors) {
		if (G.geometry[floor.key]) continue; // Immutable identity; duplicate delivery is harmless.
		G.maps[floor.key] = floor.definition;
		G.geometry[floor.key] = floor.geometry;
		G.maps[floor.key].data = floor.geometry;
		if (!client_generated_maps.includes(floor.key)) client_generated_maps.push(floor.key);
	}
}
function prune_generated_maps() {
	var keep = G.maps[current_map] && G.maps[current_map].generated;
	client_generated_maps = client_generated_maps.filter(function(key) {
		if (key === current_map) return true;
		if (!no_graphics) {
			(tile_sprites[key] || []).forEach(row => row.forEach(sprite => { if (sprite && !sprite._destroyed) sprite.destroy(); }));
			(tile_textures[key] || []).forEach(row => row.forEach(texture => texture.destroy(false)));
			delete tile_sprites[key]; delete tile_textures[key]; delete sprite_last[key];
		}
		delete G.geometry[key];
		if (keep && G.maps[key]?.generated.run === keep.run) { delete G.maps[key].data; return true; }
		delete G.maps[key]; return false;
	});
}

var cave_client_state = null;
var cave_open_choice = null;
function receive_cave_state(data) {
	if (!data || (data.type !== "ended" && !data.state)) return;
	var previous = cave_client_state;
	cave_client_state = data.type === "ended" ? null : data.state;
	if (character) character.cave = cave_client_state;
	call_code_function("trigger_character_event", "cave", cave_client_state);
	call_code_function("trigger_event", "cave", cave_client_state);
	if (no_graphics) return;
	if (data.type === "ended") { cave_open_choice = null; if ($("#cave-vote,#cave-status").length) $("#topleftcornerui").empty(); return; }
	if (!previous || previous.run !== data.state.run || previous.floor !== data.state.floor) {
		cave_open_choice = null;
		if (!data.state.choice || data.state.choice.resolved) return render_cave_status();
	}
	if ($("#cave-status").length && data.type !== "choice") return render_cave_status();
	if (data.type === "choice" || cave_open_choice && $("#cave-vote").length) render_cave_choice();
}
function cave_request(action, fields) {
	var id = randomStr(30);
	return new Promise(function(resolve, reject) {
		var timer = setTimeout(function() { finish({ failed: true, reason: "timeout" }); }, action === "enter" ? 150000 : 10000);
		function response(data) { if (data && data.request_id === id && data.place === "interaction") finish(data); }
		function disconnected() { finish({ failed: true, reason: "disconnected" }); }
		function finish(data) {
			clearTimeout(timer); socket.off("game_response", response); socket.off("disconnect", disconnected);
			if (data.failed) reject(data); else resolve(data);
		}
		socket.on("game_response", response); socket.on("disconnect", disconnected);
		socket.emit("interaction", Object.assign({}, fields || {}, { type: "cave", action, request_id: id }));
	});
}
function cave_manual(action, fields) {
	if (no_graphics) return;
	if (action === "enter") $("#topleftcornerui > div").text(phrase("cave.opening"));
	return cave_request(action, fields).then(function(data) {
		if (action === "enter") render_cave_status();
		if (action === "vote" || action === "buy" || action === "talk") render_cave_choice();
		return data;
	}).catch(function(error) {
		ui_log((phrase("cave.error." + error.reason) === "cave.error." + error.reason ? phrase("cave.error.generic") : phrase("cave.error." + error.reason)), "#C55E67");
	});
}
function render_cave_status() {
	if (no_graphics || !cave_client_state) return;
	var state = cave_client_state;
	var html = "<div id='cave-status'>" + phrase.html("cave.find_seals") + "</div>";
	for (var objective of state.objectives) html += "<div style='font-size:24px;margin-top:6px'>" +
		(objective.done ? "✓ " : "• ") + html_escape(objective.name) + " · " + objective.x + "," + objective.y + "</div>";
	html += "<div class='slimbutton' onclick='open_guide(\"cave-of-many-dreams\",\"/docs/ref/cave-of-many-dreams\")'>INFO</div> " +
		"<div class='slimbutton' onclick='cave_manual(\"exit\")'>" + phrase.html("cave.exit") + "</div>";
	render_interaction({ auto: true, skin: "mm_blue", cx: {}, message: html });
}
function render_cave_keeper() {
	if (no_graphics) return;
	render_interaction({ auto: true, skin: "mm_blue", cx: {}, message: phrase.html("cave.keeper") });
	$("#topleftcornerui > div").append("<div style='clear:both;float:right;margin-top:7px'>" +
		"<div class='slimbutton' onclick='cave_manual(\"enter\")'>" + phrase.html("cave.enter") + "</div> " +
		"<div class='slimbutton' onclick='open_guide(\"cave-of-many-dreams\",\"/docs/ref/cave-of-many-dreams\")'>INFO</div></div>");
}
function render_cave_choice() {
	if (no_graphics || !cave_client_state) return;
	var state = cave_client_state, choice = state.choice;
	if (!choice) return;
	cave_open_choice = choice.id;
	var seconds = Math.max(0, Math.ceil((choice.deadline - Date.now()) / 1000));
	var html = "<div style='font-size:24px'>" + phrase.html("cave.time_left", {time: Math.floor(Math.max(0,state.expires-Date.now())/60000) + ":" + String(Math.floor(Math.max(0,state.expires-Date.now())/1000)%60).padStart(2,"0")}) + "</div><div id='cave-vote'>" + html_escape(choice.text) + "</div>";
	html += "<div style='clear:both;font-size:24px;margin-top:8px'>" + phrase.html("cave.purse", { gold: state.gold, amber: state.amber }) + "</div>";
	choice.people.forEach(function(p) {
		if (p.cargo?.length) html += "<div style='font-size:24px'>" + phrase.html("cave.carries", {name:p.name}) + " " + p.cargo.map(function(item) { return item_container({skin:G.items[item.name].skin,def:G.items[item.name],draggable:false},item); }).join(" ") + "</div>";
	});
	if (choice.people.length > 1) choice.people.forEach(function(p) {
		html += "<div style='font-size:24px'>" + html_escape(p.name) + ": " + p.hp + " HP · " + p.attack + " ATT</div>";
	});
	html += "<div style='font-size:24px'>" + (choice.resolved ? phrase.html("cave.vote_done") : phrase.html("cave.seconds", { seconds })) + "</div>";
	if (!choice.resolved) {
		choice.options.forEach(function(option) {
			var count = Object.values(choice.votes).filter(v => v === option.id).length;
			html += "<div class='slimbutton' style='display:block;margin-top:6px' onclick='cave_manual(\"vote\",{choice:" + JSON.stringify(choice.id) + ",option:" + JSON.stringify(option.id) + "})'>" + html_escape(option.label) + " (" + count + ")</div>";
		});
		html += "<div style='font-size:20px;margin-top:6px'>" + phrase.html("cave.fallback", { fallback: choice.fallback }) + "</div>";
	}
	if (choice.service === "recipes") html += "<div class='slimbutton' onclick='render_recipes()'>" + phrase.html("cave.recipes") + "</div>";
	if (choice.shop) {
		html += "<div style='clear:both;margin-top:8px'>" + item_container({ skin: G.items[choice.shop.name].skin, size: 60 }, { name: choice.shop.name, level: 0 }, { r: 3 }) + " " + html_escape(G.items[choice.shop.name].name) + "</div>";
		html += "<div style='font-size:24px'>" + phrase.html("cave.shop_rule") + "</div>";
		if (choice.shop.sold) html += "<div>" + phrase.html("cave.sold") + "</div>";
		else html += "<div class='slimbutton' onclick='cave_manual(\"buy\",{room:" + JSON.stringify(choice.shop.room) + "})'>" + phrase.html("cave.buy", { gold: choice.shop.price }) + "</div>";
	}
	html += "<div style='clear:both;margin-top:8px'><div class='slimbutton' onclick='open_guide(\"cave-of-many-dreams\",\"/docs/ref/cave-of-many-dreams\")'>INFO</div> " +
		"<div class='slimbutton' onclick='cave_manual(\"exit\")'>" + phrase.html("cave.exit") + "</div></div>";
	render_interaction({ auto: true, skin: choice.skin || "mm_blue", cx: choice.cx, message: html });
}
