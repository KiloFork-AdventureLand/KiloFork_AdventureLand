/* Progression HUD. Uses native items, sprites, INFO and service interfaces. */
(function (root) {
	"use strict";
	var runtime,
		timer,
		result,
		previous = new Set(),
		seen = new Set(),
		pending = {},
		initialized = false,
		stateKey = "",
		folded = false,
		goal = null,
		disabled = false;
	function graphics() {
		return !root.no_graphics && !root.no_html;
	}
	function t(key, args) {
		return phrase.html("progression." + key, args || {});
	}
	function statLabel(metric) {
		return phrase.definition("stat", metric === "max_hp" ? "hp" : metric, "name", metric);
	}
	function say(record) {
		if (!record) return "";
		var args = Object.assign({}, record.args);
		if (args.stat) args.stat = statLabel(args.stat);
		return phrase.html(record.id, args);
	}
	function saved(key) {
		try {
			return storage_get(key);
		} catch (e) {
			return null;
		}
	}
	function save(key, value) {
		try {
			storage_set(key, value);
		} catch (e) {}
	}
	function adapter() {
		if (!runtime || runtime.engine.index !== ProgressionSources.get(G)) {
			if (runtime) runtime.detach();
			runtime = ProgressionRuntime.create({
				G: G,
				characterSlots: character_slots,
				doublehandTypes: doublehand_types,
				character: function () {
					return character;
				},
				realm: function () {
					return server_region + " " + server_identifier;
				},
				socket: function () {
					return root.socket;
				},
				entities: function () {
					return root.entities;
				},
				party: function () {
					return root.party;
				},
				status: function () {
					return root.S;
				},
				nextSkill: function (skill) {
					return (root.next_skill && root.next_skill[skill]) || 0;
				},
			});
		}
		return runtime;
	}
	root.progression_read = function (options) {
		return adapter().read(options);
	};
	function identity() {
		var key = "progression:" + character.name;
		if (key === stateKey) return;
		stateKey = key;
		var savedState = saved(key) || {};
		folded = !!savedState.folded;
		goal = savedState.goal || null;
		seen = new Set((savedState.seen || []).slice(-128));
		previous = new Set();
		pending = {};
		initialized = false;
	}
	function persist() {
		if (stateKey) save(stateKey, { folded: folded, goal: goal, seen: Array.from(seen).slice(-128) });
	}
	root.progression_art = function (art) {
		if (!graphics() || !art) return "";
		if (art.item && G.items[art.item]) return "<div class='progression-art' aria-hidden='true'>" + item_container({ skin: art.item, size: 40, bcolor: "black", draggable: false }) + "</div>";
		var name = art.npc && G.npcs[art.npc] ? G.npcs[art.npc].skin : art.monster;
		if (!name) return "";
		precompute_image_positions();
		var skin = G.monsters[name] ? G.monsters[name].skin || name : name,
			dims = G.dimensions[skin] || (IID[skin] ? [IID[skin][4], IID[skin][5]] : null);
		if (!dims || !IID[skin]) return "";
		var scale = Math.max(1, Math.min(2, Math.floor(64 / (dims[0] + 4)), Math.floor(64 / (dims[1] + 6))));
		var width = (dims[0] + 4) * scale,
			height = (dims[1] + 6) * scale,
			frame = Math.max(64, height);
		// Passing the native skin avoids the monster-size adjustment in sprite().
		// Both the frame and its position stay on whole pixels; no crop or resample.
		return (
			"<div class='progression-art' style='height:" +
			frame +
			"px' aria-hidden='true'><div style='position:absolute;left:" +
			Math.floor((80 - width) / 2) +
			"px;top:" +
			Math.floor((frame - height) / 2) +
			"px'>" +
			sprite(skin, { scale: scale + (G.monsters[skin] && G.monsters[skin].size ? 1 - G.monsters[skin].size : 0), width: width, height: height }) +
			"</div></div>"
		);
	};
	function goalLabel(g) {
		if (g.kind === "stat") return t("goal.stat", { value: to_pretty_num(g.target), stat: statLabel(g.metric) });
		if (g.kind === "item") return t("goal.item", { item: G.items[g.name].name, level: g.level || 0 });
		if (g.kind === "set") return html_escape(G.sets[g.name].name);
		if (g.kind === "gold") return t("goal.gold", { value: to_pretty_num(g.target) });
		if (["farm", "encounter"].includes(g.kind)) return t("goal." + g.kind, { monster: G.monsters[g.monster].name });
		if (g.kind === "gather") return t("goal.gather") + " · " + phrase.definition("skill", g.skill, "name", g.skill);
		return t("goal." + g.kind);
	}
	function unseen(rows, at) {
		var ids = new Set(
				rows.map(function (r) {
					return JSON.stringify(goal) + ":" + r.id + ":" + (r.affordable === false ? "save" : "ready");
				}),
			),
			flash = false;
		if (!initialized) {
			ids.forEach(function (id) {
				seen.add(id);
			});
			initialized = true;
		}
		ids.forEach(function (id) {
			if (seen.has(id)) return;
			if (!pending[id]) pending[id] = at;
			if (at - pending[id] >= AdventureProgression.policy.settle) {
				seen.add(id);
				flash = true;
			}
		});
		Object.keys(pending).forEach(function (id) {
			if (!ids.has(id)) delete pending[id];
		});
		previous = ids;
		if (flash) persist();
		return flash;
	}
	function render() {
		if (!graphics() || disabled || !root.character || !root.G || !G.items) return;
		identity();
		result = adapter().read({ goal: goal });
		if (!result.ready) return;
		var flash = unseen(result.rows, Date.now()),
			html;
		if (folded) html = "<button type='button' class='gamebutton progression-fold' onclick='btc(event); progression_fold(false)'>" + t("name") + " +</button>";
		else {
			html =
				"<div class='progression-heading'><button type='button' onclick='btc(event); progression_details()'>" +
				goalLabel(result.goal) +
				" <span class='progression-count'>" +
				to_pretty_num(result.progress.value) +
				"/" +
				to_pretty_num(result.progress.target) +
				"</span></button><button type='button' aria-label='" +
				t("fold") +
				"' onclick='btc(event); progression_fold(true)'>&minus;</button></div>";
			result.rows.forEach(function (row, n) {
				html +=
					"<button type='button' class='progression-row' onclick='btc(event); progression_details(" +
					n +
					")'>" +
					progression_art(row.art) +
					"<span class='progression-copy'><span class='progression-title'>" +
					say(row.title) +
					"</span><span class='progression-reason'>" +
					say(row.reason) +
					"</span></span><span class='progression-info'>INFO</span></button>";
			});
		}
		var container = $("#progression-guide");
		if (!container.length) {
			$("#bottommid").prepend("<div id='progression-guide' class='enableclicks'></div>");
			container = $("#progression-guide");
			container.on("pointerdown mousedown touchstart mousemove", function (event) {
				event.stopPropagation();
			});
		}
		if (container.data("html") !== html) container.html(html).data("html", html);
		container.toggleClass("is-folded", folded).css("margin-bottom", 8 + Math.max($(".codebbuttons").outerHeight() || 0, $(".badplaceforaui").outerHeight() || 0));
		if (flash) {
			container.removeClass("new-path");
			void container[0].offsetWidth;
			container.addClass("new-path");
		}
	}
	root.progression_fold = function (value) {
		if (!graphics()) return;
		folded = !!value;
		persist();
		render();
	};
	root.set_progression_guide = function (enabled) {
		disabled = !enabled;
		save("progression_guide", enabled ? "on" : "off");
		if (timer) clearInterval(timer);
		timer = null;
		if (!enabled && runtime) runtime.detach();
		if (!graphics()) return;
		$(".progression-setting").html(t(enabled ? "setting.on" : "setting.off"));
		if (!enabled) $("#progression-guide").remove();
		else {
			render();
			timer = setInterval(render, 1000);
		}
	};
	root.progression_set_goal = function (choice) {
		if (!graphics()) return;
		if (choice === "custom") goal = { kind: "item", name: $("#progression-item").val(), level: Number($("#progression-level").val()) || 0, quantity: 1 };
		else goal = choice === "auto" ? null : result.choices[choice];
		if (!goal && choice !== "auto") return;
		persist();
		hide_modal();
		render();
	};
	function sourceButton(action) {
		return "<button type='button' class='gamebutton' data-progression-action='" + html_escape(JSON.stringify(action)) + "'>INFO</button>";
	}
	function tree(node, depth) {
		if (!node || depth > 6) return "";
		var html =
			"<p>" +
			html_escape(G.items[node.name].name) +
			" +" +
			node.level +
			" · " +
			t("materials", { owned: to_pretty_num(node.owned), needed: to_pretty_num(node.quantity) }) +
			" " +
			sourceButton({ kind: "inspect", name: node.name }) +
			"</p>";
		if (!node.remaining) return html;
		if (node.blocked) html += "<p>" + t("reason.blocked", { item: G.items[node.name].name }) + "</p>";
		node.alternatives.forEach(function (a) {
			if (a.kind === "develop") {
				html += "<p>" + t("expected", { copies: a.meanCopies.toFixed(1), gold: to_pretty_num(Math.ceil(a.meanGold)) }) + "</p>";
				a.inputs.forEach(function (n) {
					html += tree(n, depth + 1);
				});
			} else if (a.kind === "craft") {
				html += "<div class='divider'></div><p>" + t("recipe", { npc: G.npcs[a.npc] ? G.npcs[a.npc].name : a.npc, gold: to_pretty_num(a.cost) }) + " " + sourceButton(a) + "</p>";
				a.inputs.forEach(function (n) {
					html += tree(n, depth + 1);
				});
			} else if (a.kind === "token") {
				html += "<p>" + html_escape(G.items[a.token].name) + " × " + a.quantity + " " + sourceButton({ kind: "inspect", name: a.token }) + "</p>";
			} else if (a.kind === "farm") html += "<p>" + t("action.farm", { monster: G.monsters[a.route.monster].name, map: G.maps[a.route.map].name || a.route.map }) + " " + sourceButton(a) + "</p>";
			else if (a.kind === "buy" || a.kind === "purchase")
				html += "<p>" + t("price", { gold: to_pretty_num(a.cost) }) + " " + html_escape(G.npcs[a.npc] ? G.npcs[a.npc].name : a.offer.seller) + " " + sourceButton(a) + "</p>";
			else if (a.kind === "exchange") {
				html += "<p>" + t("reason.random") + " " + html_escape(G.items[a.name].name) + " " + sourceButton(a) + "</p>";
				(a.inputs || []).forEach(function (n) {
					html += tree(n, depth + 1);
				});
			}
		});
		return html;
	}
	root.progression_open = function (a) {
		if (!graphics()) return;
		if (a.kind === "craft") return render_recipe(null, "craft", a.recipe);
		if (a.kind === "dismantle") return render_recipe(null, "dismantle", a.name);
		if (a.kind === "event" && a.modal) return open_guide(a.modal);
		if (a.kind === "event" && G.monsters[a.event]) return render_monster_info(a.event);
		if (a.kind === "farm") return render_monster_info(a.route.monster);
		if (a.kind === "prepare") return render_monster_info(a.monster);
		if (a.name && G.items[a.name]) return render_item_info(a.name, a.level || 0);
		var articles = {
			hunt: "monster-hunts",
			recover: "basics",
			supplies: "shops-and-selling",
			shop: "merchant",
			gather: "gathering",
			stat: "upgrading",
			upgrade: "upgrading",
			compound: "compounding",
			retrieve: "banking",
		};
		return open_guide(articles[a.kind] || "progression-guide");
	};
	root.progression_details = function (n) {
		if (!graphics() || !result) return;
		var html = "<div class='title'>" + goalLabel(result.goal) + "</div>",
			row = result.rows[n];
		if (row) {
			html += progression_art(row.art) + "<div class='title'>" + say(row.title) + "</div><p>" + say(row.reason) + "</p>" + sourceButton(row.action);
			if (row.gain) html += "<p>" + t("gain", { stat: statLabel(row.gain.metric), amount: row.gain.amount, hp: row.gain.hp, armor: row.gain.armor, resistance: row.gain.resistance }) + "</p>";
			if (row.cost) html += "<p>" + t("price", { gold: to_pretty_num(row.cost) }) + "</p>";
			if (row.shortfall) html += "<p>" + t("shortfall", { gold: to_pretty_num(row.shortfall) }) + "</p>";
			if (row.plan) html += tree(row.plan.tree, 0);
		} else {
			html += "<p>" + t(result.complete ? "complete" : "intro") + "</p><p>" + t("reserve", { gold: to_pretty_num(result.reserve) }) + "</p>";
			result.lessons.forEach(function (l) {
				html += "<div class='divider'></div><div class='title'>" + (l.complete ? "✓ " : "") + say(l.title) + "</div><p>" + say(l.reason) + "</p>";
			});
			html += "<div class='divider'></div><div class='title'>" + t("choose") + "</div>";
			result.choices.forEach(function (g, i) {
				html += "<div><button type='button' class='gamebutton' onclick='progression_set_goal(" + i + ")'>" + goalLabel(g) + "</button></div>";
			});
			html += "<p><label for='progression-item'>" + t("goal.item_select") + "</label> <select id='progression-item'>";
			Object.keys(G.items)
				.filter(function (id) {
					return !G.items[id].ignore;
				})
				.sort(function (a, b) {
					return G.items[a].name.localeCompare(G.items[b].name);
				})
				.forEach(function (id) {
					html += "<option value='" + html_escape(id) + "'>" + html_escape(G.items[id].name) + "</option>";
				});
			html +=
				"</select> <label for='progression-level'>+</label><input id='progression-level' type='number' min='0' max='12' value='0' style='width:50px'> <button type='button' class='gamebutton' onclick='progression_set_goal(\"custom\")'>" +
				t("choose") +
				"</button></p><button type='button' class='gamebutton' onclick='progression_set_goal(\"auto\")'>" +
				t("automatic") +
				"</button>";
		}
		show_modal(html, { hideinbackground: true, classes: "progression-details" });
		$(".imodal:last [data-progression-action]").on("click", function (event) {
			btc(event);
			progression_open(JSON.parse(this.getAttribute("data-progression-action")));
		});
	};
	if (typeof document !== "undefined")
		document.addEventListener("DOMContentLoaded", function () {
			if (!graphics()) return;
			disabled = saved("progression_guide") === "off";
			root.set_progression_guide(!disabled);
		});
})(typeof globalThis !== "undefined" ? globalThis : this);
