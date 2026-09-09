const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const nunjucks = require("nunjucks");
const localization = require("../../languages");
const { read, load, transactions, root } = require("./helpers/server_vm");
const { buildComparisons } = require("./helpers/tutorial_comparison");
const comparisons = require("../../docs/tutorial/comparisons.json");

function context() {
	const c = vm.createContext({ console });
	vm.runInContext(read("docs/directory.js"), c);
	load(c, "adventure_functions.js", [
		"process_user_data",
		"migrate_tutorial_data",
		"get_tutorial_track",
		"calculate_tutorial_step",
		"tutorial_lesson_complete",
		"data_to_tutorial",
	]);
	load(c, "api.js", ["tutorial_api", "reset_tutorial_api"]);
	return c;
}

test("all displayed build numbers match the real server stat calculation", () => {
	assert.deepEqual(buildComparisons(), comparisons);
	for (const build of Object.values(comparisons.classes)) {
		for (let i = 1; i < build.rows.length; i++) assert.ok(build.rows[i].dps > build.rows[i - 1].dps);
		for (const slot of ["mainhand", "helmet", "chest", "pants", "gloves", "shoes"])
			assert.deepEqual(build.rows[2].slots[slot], build.rows[3].slots[slot]);
	}
});

test("merchant lessons use their own progress and cannot complete or reset the adventurer tutorial", async () => {
	const c = context(),
		store = transactions(c, []),
		res = { infs: [] };
	let last;
	for (let step = 0; step < c.docs.merchant_tutorial.length; step++) {
		last = await c.tutorial_api({
			user: "US_tutorial",
			track: "merchant",
			step: step + 1,
			lesson: c.docs.merchant_tutorial[step].key,
			res,
		});
		assert.equal(last.success, true);
		assert.equal(res.infs.at(-2).step, step + 1);
		assert.equal(res.infs.at(-2).track, "merchant");
	}
	const saved = store.records.get("IE_userdata-US_tutorial");
	assert.equal(saved.info.tutorial_key, "lore");
	assert.deepEqual(saved.info.completed_tasks, []);
	assert.equal(c.data_to_tutorial(saved, "merchant").finished, true);
	await c.reset_tutorial_api({ user: "US_tutorial", track: "merchant", res });
	assert.equal(store.records.get(saved._id).info.merchant_tutorial.tutorial_key, "merchant-start");
	assert.equal((await c.tutorial_api({ user: "US_tutorial", track: "invalid", res })).failed, true);
});

test("old completed tutorials show the added lessons without granting credit for them", () => {
	const c = context();
	const oldKeys = [
		"helloworld",
		"learntofight",
		"interface",
		"skills-recovery",
		"shops",
		"upgrade",
		"compound",
		"bank",
		"move",
		"crafting-exchanges",
		"parties-friends",
		"hellocode",
		"multiple-characters",
		"events-status",
		"theend",
	];
	const done = oldKeys.flatMap((key) =>
		c.docs.tutorial.find((lesson) => lesson.key === key).tasks.filter((task) => !task.startsWith("read_")),
	);
	const data = c.process_user_data("US_tutorial", {
		info: { tutorial_version: 2, tutorial_step: 15, completed_tasks: done },
	});
	assert.equal(data.info.tutorial_key, "lore");
	for (const task of [
		"read_lore",
		"read_farming",
		"addstats",
		"read_gear_comparison",
		"read_accessory_comparison",
		"read_hunting",
	])
		assert.ok(!data.info.completed_tasks.includes(task));
});

test("MCP discovers the lore, first-goals and merchant guides through the normal directory", () => {
	const c = context();
	load(c, "mcp_api.js", ["mcp_api_doc_entries"]);
	const entries = c.mcp_api_doc_entries();
	for (const name of ["lore", "first-goals", "merchant"]) {
		const entry = entries.find((entry) => entry.name === name);
		assert.equal(entry.docs_url, "https://adventure.land/docs/guide/" + name);
	}
});

test("every new article renders with translated phrases and each locale has five comic images", () => {
	const c = context();
	const files = [
		"lore",
		"farming",
		"stat-scrolls",
		"gear-comparison",
		"accessory-comparison",
		"hunting",
		...c.docs.merchant_tutorial.map((lesson) => lesson.key),
	]
		.map((key) => "docs/tutorial/" + key + ".html")
		.concat(["docs/guide/lore.html", "docs/guide/merchant.html", "docs/guide/first-goals.html"]);
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(root));
	env.addGlobal("tutorial_comparisons", () => comparisons);
	env.addGlobal("task_name", (key) => key);
	env.addFilter("to_json", JSON.stringify);
	for (const { code } of localization.languages) {
		const catalog =
			code === "en"
				? localization.catalog(code)
				: Object.assign(
						{},
						...["docs", "definitions", "interface"].map((domain) =>
							JSON.parse(read("languages/" + code + "/" + domain + ".json")),
						),
					);
		for (const file of files) {
			const source = read(file);
			for (const match of source.matchAll(/phrase(?:_html)?\(["']([^"']+)/g))
				assert.ok(catalog[match[1]], code + ": " + match[1]);
			const html = env.render(file, {
				domain: { language: code },
				phrase: (key) => localization.phrase(key, {}, code),
				phrase_html: (key) => localization.phrase_html(key, {}, code),
			});
			assert.doesNotMatch(html, /{{|<details|<summary/);
			if (file.endsWith("/lore.html")) assert.ok(html.includes("/images/tutorial/lore/" + code + "/page-01.jpg"));
		}
		for (const label of [
			"target",
			"hit",
			"dps",
			"increase",
			"gear_plain",
			"gear_upgraded",
			"gear_statted",
			"accessory_plain",
			"accessory_improved",
		])
			assert.ok(catalog["interface.tutorial.comparison." + label], code + ": " + label);
		for (let page = 1; page <= 5; page++) {
			const image = fs.readFileSync(path.join(root, "images/tutorial/lore", code, "page-0" + page + ".jpg"));
			assert.equal(image.readUInt16BE(0), 0xffd8);
		}
	}
});

test("new visual entry points return before touching graphics in headless mode", () => {
	const c = vm.createContext({ window: { no_graphics: true } });
	load(c, "js/html.js", ["render_tutorial_items", "turn_tutorial_lore", "render_tutorial_comparison"]);
	c.render_tutorial_items();
	c.turn_tutorial_lore(1);
	c.render_tutorial_comparison(comparisons, false);
});

test("farming shows each class's starter weapon, defaults to blade, and leaves other items alone", () => {
	const G = require("./helpers/design");
	for (const type of [...Object.keys(G.classes), "unknown", null]) {
		const shown = [];
		const c = vm.createContext({
			G,
			window: { character: type ? { ctype: type } : undefined },
			character: { ctype: type },
			item_container: (_, item) => {
				shown.push(item.name);
				return "item";
			},
			$: (selector) =>
				typeof selector === "string"
					? {
							each: (callback) => {
								if (selector === ".tutorial-item") {
									callback.call({ item: "blade", weapon: "true" });
									callback.call({ item: "hpot0" });
								}
							},
						}
					: { attr: (key) => (key === "data-item" ? selector.item : selector.weapon), css: () => ({ html() {} }) },
		});
		load(c, "js/html.js", ["render_tutorial_items"]);
		c.render_tutorial_items();
		assert.deepEqual(shown, [G.classes[type]?.base_slots?.mainhand?.name || "blade", "hpot0"]);
	}
});

test("comic Skip and Continue credit only the current lore lesson; guide and completed reviews just close", () => {
	for (const scenario of [
		{ active: true, step: 0, ready: true, credit: true },
		{ active: false, step: 0, ready: true },
		{ active: true, step: 1, ready: true },
		{ active: true, step: 0, ready: false },
	]) {
		const calls = [];
		const c = vm.createContext({
			last_rendered_track: "",
			last_rendered_step: 0,
			get_tutorial_view: () => ({
				lessons: [{ key: "lore" }],
				progress: { step: scenario.step, can_continue: scenario.ready },
			}),
			$: () => ({ closest: () => ({ attr: () => String(scenario.active) }) }),
			api_call: (name, args) => calls.push({ name, args }),
			hide_modal: () => calls.push("close"),
		});
		load(c, "js/html.js", ["finish_tutorial_lore", "continue_tutorial"]);
		c.finish_tutorial_lore();
		assert.equal(calls.length, scenario.credit ? 2 : 1);
		if (scenario.credit)
			assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), { name: "tutorial", args: { step: 1, lesson: "lore" } });
		assert.equal(calls.at(-1), "close");
	}
});

test("travel credit does not depend on whether a player packet already changed the rendered map", () => {
	const source = read("js/game.js");
	const start = source.indexOf('socket.on("new_map", function (data) {');
	const end = source.indexOf("current_map = data.name;", start);
	const body = source.slice(source.indexOf("{", start) + 1, end);
	for (const rendered of ["bank", "main"]) {
		const calls = [];
		const c = vm.createContext({
			current_map: rendered,
			tutorial_map: "bank",
			character: {},
			data: { name: "main" },
			tut: (name) => calls.push(name),
		});
		vm.runInContext(body, c);
		vm.runInContext(body, c);
		assert.deepEqual(calls, ["travel"]);
	}
});

test("tutorial credit retries transient failures without replaying gameplay, and stops after leaving the lesson", async () => {
	const timers = [],
		calls = [];
	const c = vm.createContext({
		console,
		X: { tutorial: { task: "addstats", pending: ["addstats"] } },
		tutorial_tasks_in_flight: {},
		setTimeout: (fn) => timers.push(fn),
		api_call: (method, args) => {
			calls.push(args.task);
			return calls.length === 1
				? Promise.reject({ reason: "network_error", status: 502 })
				: Promise.resolve({ success: true });
		},
	});
	load(c, "js/functions.js", ["tut"]);
	c.tut("addstats");
	await new Promise(setImmediate);
	c.tut("addstats");
	assert.equal(calls.length, 1);
	timers.shift()();
	await new Promise(setImmediate);
	assert.deepEqual(calls, ["addstats", "addstats"]);
	assert.deepEqual(Object.keys(c.tutorial_tasks_in_flight), []);
	c.api_call = () => Promise.reject({ reason: "network_error" });
	c.tut("addstats");
	await new Promise(setImmediate);
	c.X.tutorial = { task: "read_gear_comparison", pending: ["read_gear_comparison"] };
	timers.shift()();
	assert.deepEqual(Object.keys(c.tutorial_tasks_in_flight), []);
	assert.equal(timers.length, 0);
});
