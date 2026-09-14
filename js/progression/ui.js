/* Progression HUD. Uses native items, sprites, INFO and service interfaces. */
(function (root) {
	"use strict";
	var runtime,
		timer,
		result,
		currentNotices = new Set(),
		announced = new Set(),
		flashTimer,
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
		currentNotices = new Set();
		announced = new Set();
		pending = {};
		initialized = false;
	}
	function persist() {
		if (stateKey) save(stateKey, { folded: folded, goal: goal, seen: Array.from(seen).slice(-128) });
	}
	root.progression_art = function (art) {
		if (!graphics()) return "";
		if (!art) return "<div class='progression-art' aria-hidden='true'></div>";
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
					return JSON.stringify(goal) + ":" + (r.notice || r.id) + ":" + (r.affordable === false ? "save" : "ready");
				}),
			),
			flash = false;
		if (!initialized) {
			if (!seen.size)
				ids.forEach(function (id) {
					seen.add(id);
				});
			initialized = true;
		}
		ids.forEach(function (id) {
			if (seen.has(id) || announced.has(id)) return;
			if (!pending[id]) pending[id] = at;
			if (at - pending[id] >= AdventureProgression.policy.settle) {
				announced.add(id);
				flash = true;
			}
		});
		Object.keys(pending).forEach(function (id) {
			if (!ids.has(id)) delete pending[id];
		});
		currentNotices = ids;
		return flash;
	}
	function clearFlash() {
		clearTimeout(flashTimer);
		$("#progression-guide").removeClass("new-path");
	}
	function acknowledge() {
		currentNotices.forEach(function (id) {
			seen.add(id);
		});
		pending = {};
		clearFlash();
		persist();
	}
	function rowTitle(row) {
		var event = row.event && G.events[row.event],
			theme = event && event.announcement;
		return theme && theme.title ? html_escape(phrase.definition("event", row.event, "announcement.title", theme.title)) : event ? html_escape(event.name) : say(row.title);
	}
	function rowReason(row) {
		var event = row.event && G.events[row.event];
		return event && event.type === "seasonal" && event.announcement ? html_escape(phrase.definition("event", row.event, "announcement.text", event.announcement.text)) : say(row.reason);
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
				"</span><span class='progression-context'>" +
				(result.complete ? t("complete") : result.goal.kind === "stat" ? t("goal.hint") : t("name")) +
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
					rowTitle(row) +
					"</span><span class='progression-reason'>" +
					rowReason(row) +
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
			clearFlash();
			void container[0].offsetWidth;
			container.addClass("new-path");
			flashTimer = setTimeout(clearFlash, 2500);
		}
	}
	root.progression_fold = function (value) {
		if (!graphics()) return;
		acknowledge();
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
		clearFlash();
		$(".progression-setting").html(t(enabled ? "setting.on" : "setting.off"));
		if (!enabled) $("#progression-guide").remove();
		else {
			render();
			timer = setInterval(render, 1000);
		}
	};
	root.progression_set_goal = function (choice) {
		if (!graphics()) return;
		acknowledge();
		if (choice === "custom") goal = { kind: "item", name: $("#progression-item").val(), level: Number($("#progression-level").val()) || 0, quantity: 1 };
		else goal = choice === "auto" ? null : result.choices[choice];
		if (!goal && choice !== "auto") return;
		persist();
		hide_modal();
		render();
	};
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
	function sourceButton(action, label) {
		if (!label) {
			var article = articles[action.kind];
			label = article
				? phrase.html("directory.guide." + article + ".title")
				: action.kind === "craft" || action.kind === "dismantle"
					? t("recipe.open")
					: action.route
						? html_escape(G.monsters[action.route.monster].name) + " · INFO"
						: action.name && G.items[action.name]
							? html_escape(G.items[action.name].name) + " · INFO"
							: t("name");
		}
		return "<button type='button' class='gamebutton gamebutton-small' data-progression-action='" + html_escape(JSON.stringify(action)) + "'>" + label + "</button>";
	}
	function section(title, content) {
		return "<div class='divider'></div><div class='title'>" + title + "</div>" + content;
	}
	function paragraph(content) {
		return "<p>" + content + "</p>";
	}
	function itemLine(item, detail) {
		return (
			"<div class='progression-material'>" +
			item_container({ skin: G.items[item.name].skin || item.name, size: 40, draggable: false }, item) +
			"<div>" +
			sourceButton({ kind: "inspect", name: item.name, level: item.level || 0 }) +
			(detail ? "<div>" + detail + "</div>" : "") +
			"</div></div>"
		);
	}
	function place(npc) {
		var locations = adapter().engine.index.locations[npc] || [],
			location =
				locations.find(function (p) {
					return p.map === character.map;
				}) || locations[0];
		return location ? html_escape(G.maps[location.map].name || location.map) + " (" + location.position.slice(0, 2).join(", ") + ")" : "";
	}
	function supplies(item, quantity) {
		var owned = (character.items || []).reduce(function (n, i) {
			return Math.max(n, i && AdventureProgression.plain(i) && i.name === item ? i.q || 1 : 0);
		}, 0);
		var seller = adapter()
			.engine.index.sources(item)
			.find(function (s) {
				return s.kind === "shop" && s.currency === "gold";
			});
		return itemLine(
			{ name: item },
			t("materials", { owned: to_pretty_num(owned), needed: to_pretty_num(quantity) }) + (seller ? " · " + html_escape(G.npcs[seller.npc].name) + " · " + place(seller.npc) : ""),
		);
	}
	function tree(node, depth) {
		if (!node || depth > 6) return "";
		var html = itemLine({ name: node.name, level: node.level }, t("materials", { owned: to_pretty_num(node.owned), needed: to_pretty_num(node.quantity) }));
		if (!node.remaining) return html;
		if (node.blocked) return html + paragraph(t("reason.blocked", { item: G.items[node.name].name }));
		// Follow the chosen acquisition branch. The native item INFO above has
		// every alternative source, without duplicating a whole tree for each one.
		var branch =
			node.alternatives.find(function (a) {
				return a === node.next || a.next === node.next;
			}) || node.alternatives[0];
		if (!branch) return html;
		if (branch.kind === "develop")
			html +=
				paragraph(t("expected", { copies: branch.meanCopies.toFixed(1), gold: to_pretty_num(Math.ceil(branch.meanGold)) })) +
				sourceButton({ kind: G.items[node.name].compound ? "compound" : "upgrade" });
		else if (branch.kind === "craft") html += paragraph(t("recipe", { npc: G.npcs[branch.npc].name, gold: to_pretty_num(branch.cost) })) + sourceButton(branch);
		else if (branch.kind === "token") html += supplies(branch.token, branch.quantity);
		if (branch.inputs)
			branch.inputs.forEach(function (input) {
				html += tree(input, depth + 1);
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
		if (a.kind === "prepare") return G.events[a.monster] && G.events[a.monster].modal ? open_guide(G.events[a.monster].modal) : render_monster_info(a.monster);
		if (articles[a.kind]) return open_guide(articles[a.kind]);
		if (a.name && G.items[a.name]) return render_item_info(a.name, a.level || 0);
		return open_guide("progression-guide");
	};
	function instructions(row) {
		var a = row.action,
			item = a.name && G.items[a.name],
			html = "",
			scroll = a.scroll && G.items[a.scroll],
			npc = a.npc && G.npcs[a.npc];
		if (row.kind === "stat") html += paragraph(t("how.stat", { item: item.name, quantity: a.quantity, scroll: scroll.name, stat: statLabel(G.classes[character.ctype].main_stat) }));
		else if (row.kind === "upgrade") html += paragraph(t("how.upgrade", { item: item.name, scroll: scroll.name }));
		else if (row.kind === "compound") html += paragraph(t("how.compound", { item: item.name, level: a.level - 1, scroll: scroll.name }));
		else if (row.kind === "equip") html += paragraph(t("how.equip", { item: item.name }));
		else if (row.kind === "buy" && npc) html += paragraph(t("how.buy", { quantity: a.quantity || 1, item: item.name, npc: npc.name })) + paragraph(place(a.npc));
		else if (row.kind === "craft") html += paragraph(t("how.craft", { npc: npc.name })) + paragraph(place(a.npc));
		else if (row.kind === "farm") {
			var route = a.route;
			html += paragraph(t("how.farm", { monster: G.monsters[route.monster].name, map: G.maps[route.map].name || route.map }));
			html += paragraph(html_escape(G.maps[route.map].name || route.map) + " (" + Math.round(route.x) + ", " + Math.round(route.y) + ")");
			html += paragraph(t("fight.estimate", { seconds: Math.ceil(route.seconds), loss: Math.ceil((100 * route.loss) / result.stats.max_hp) }));
			if (route.trial) html += paragraph(say(row.reason));
		} else html += paragraph(rowReason(row));
		if (scroll) html += supplies(a.scroll, row.kind === "stat" ? a.quantity : 1);
		if (row.kind === "stat" && row.cost) html += paragraph(t("how.stat_shop"));
		if (row.cost || row.kind === "stat") html += paragraph(t("price", { gold: to_pretty_num(row.cost) }));
		if (row.shortfall) html += paragraph(t("shortfall", { gold: to_pretty_num(row.shortfall) }));
		if (row.cost) html += paragraph(t("reserve", { gold: to_pretty_num(result.reserve) }));
		return html + (row.plan && row.kind === "buy" ? "" : sourceButton(a));
	}
	function gains(row) {
		if (!row.gain) return "";
		var html = ["stat", "equip"].includes(row.kind) ? "" : paragraph(t("gain.finish", { item: G.items[row.target.name].name, level: row.target.level || 0 }));
		var changes = [
			[row.gain.metric, row.gain.amount],
			["max_hp", row.gain.hp],
			["armor", row.gain.armor],
			["resistance", row.gain.resistance],
		];
		changes.forEach(function (pair, n) {
			if (
				!pair[1] ||
				changes.slice(0, n).some(function (prior) {
					return prior[0] === pair[0];
				})
			)
				return;
			html +=
				"<div class='progression-change'>" +
				t("gain.stat", {
					stat: "\u2068" + statLabel(pair[0]) + "\u2069",
					before: to_pretty_num(result.stats[pair[0]]),
					after: to_pretty_num(result.stats[pair[0]] + pair[1]),
					change: (pair[1] > 0 ? "+" : "") + to_pretty_num(pair[1]),
				}) +
				"</div>";
		});
		if (row.target.stat_type && row.kind !== "stat" && row.kind !== "equip") html += paragraph(t("gain.stat_needed", { stat: statLabel(row.target.stat_type) }));
		return html;
	}
	root.progression_details = function (n) {
		if (!graphics() || !result) return;
		acknowledge();
		var row = result.rows[n],
			html = "";
		// Event articles already contain the real instructions, rewards and CODE.
		if (row && (row.kind === "event" || (!row.gain && !row.plan && articles[row.kind]))) return progression_open(row.action);
		if (row) {
			html += "<div class='progression-detail-heading'>" + progression_art(row.art) + "<div class='title'>" + rowTitle(row) + "</div></div>";
			var lesson = result.lessons.find(function (l) {
				return l.id === row.lesson;
			});
			var why = lesson ? paragraph(say(lesson.reason)) : row.kind === "stat" ? "" : paragraph(rowReason(row));
			if (row.kind === "farm" && !row.request) {
				var project = result.rows.find(function (r) {
					return r.target;
				});
				if (project) why = paragraph(t("farm.funds", { item: G.items[project.target.name].name }));
			}
			html += section(t("why"), why + gains(row));
			html += section(t("steps"), instructions(row));
			if (row.plan) html += section(t("sources"), tree(row.plan.tree, 0));
			if (row.kind === "farm") {
				var route = row.action.route,
					drops = (G.drops.monsters[route.monster] || []).slice();
				html += section(
					phrase.html("interface.monster_info.drops"),
					"<div class='progression-drops'>" +
						drops
							.map(function (drop) {
								return render_drop(drop, 1, "#666666");
							})
							.join("") +
						"</div>",
				);
				if ((G.drops.maps[route.map] || []).length)
					html +=
						paragraph(html_escape(G.maps[route.map].name)) +
						"<div class='progression-drops'>" +
						G.drops.maps[route.map]
							.map(function (drop) {
								return render_drop(drop, G.monsters[route.monster].hp / 1000, "#666666");
							})
							.join("") +
						"</div>";
			}
		} else {
			html += "<div class='title'>" + goalLabel(result.goal) + "</div>";
			html += paragraph(result.complete ? t("complete") : result.goal.kind === "stat" ? t("goal.explain", { stat: statLabel(result.goal.metric) }) : t("intro"));
			html += "<div class='progression-change'>" + to_pretty_num(result.progress.value) + " / " + to_pretty_num(result.progress.target) + "</div>";
			var next = result.lessons.find(function (l) {
				return !l.complete;
			});
			if (next) html += section(t("next", { step: say(next.title) }), paragraph(say(next.reason)));
			result.lessons.forEach(function (l) {
				if (l === next) return;
				html += section((l.complete ? "✓ " : "") + say(l.title), paragraph(say(l.reason)));
			});
			html += section(t("choose"), "");
			result.choices.forEach(function (g, i) {
				html += "<div><button type='button' class='gamebutton gamebutton-small' onclick='progression_set_goal(" + i + ")'>" + goalLabel(g) + "</button></div>";
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
				"</select> <label for='progression-level'>+</label><input id='progression-level' type='number' min='0' max='12' value='0' style='width:50px'> <button type='button' class='gamebutton gamebutton-small' onclick='progression_set_goal(\"custom\")'>" +
				t("choose") +
				"</button></p><button type='button' class='gamebutton gamebutton-small' onclick='progression_set_goal(\"auto\")'>" +
				t("automatic") +
				"</button>";
		}
		render_learn_article("<div class='progression-article'>" + html + "</div>", {});
		$(".guide-article:last").addClass("progression-details");
		$(".imodal:last [data-progression-action]").on("click", function (event) {
			btc(event);
			progression_open(JSON.parse(this.getAttribute("data-progression-action")));
		});
		position_modals();
	};
	if (typeof document !== "undefined")
		document.addEventListener("DOMContentLoaded", function () {
			if (!graphics()) return;
			disabled = saved("progression_guide") === "off";
			root.set_progression_guide(!disabled);
		});
})(typeof globalThis !== "undefined" ? globalThis : this);
