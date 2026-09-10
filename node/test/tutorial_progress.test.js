const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const { load, read, transactions } = require("./helpers/server_vm");

function runtime(info) {
	const context = vm.createContext({ console: { log() {}, error() {} } });
	vm.runInContext(read("docs/directory.js"), context);
	const previousKeys = [
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
	context.docs.tutorial = previousKeys.map((key) => context.docs.tutorial.find((lesson) => lesson.key === key));
	load(context, "adventure_functions.js", [
		"process_user_data",
		"migrate_tutorial_data",
		"tutorial_lesson_complete",
		"calculate_tutorial_step",
		"data_to_tutorial",
		"get_tutorial_track",
	]);
	load(context, "api.js", ["tutorial_api", "reset_tutorial_api"]);
	const id = "IE_userdata-US_tutorial";
	const store = transactions(context, info ? [{ _id: id, info: structuredClone(info) }] : []);
	const get = () => context.process_user_data("US_tutorial", structuredClone(store.records.get(id)));
	async function request(args) {
		const res = { infs: [] };
		const result = await context.tutorial_api({ user: { _id: "US_tutorial" }, res, ...args });
		return { result, info: res.infs.find((inf) => inf.type === "tutorial_data"), res };
	}
	async function proceed() {
		const data = get();
		return request({ step: data.info.tutorial_step + 1, lesson: data.info.tutorial_key });
	}
	return { context, store, id, get, request, proceed };
}

function previousProgress(context, step) {
	return {
		tutorial_version: 2,
		tutorial_step: step,
		completed_tasks: context.docs.tutorial
			.slice(0, step)
			.flatMap((lesson) => lesson.tasks.filter((task) => task !== lesson.continue_task)),
		code_list: { main: "keep-existing-data" },
	};
}

function insertReading(context, key, index) {
	context.docs.tutorial.splice(index, 0, { key, tasks: ["read_" + key], continue_task: "read_" + key });
}

test("reading stays pending until Continue, survives reload, and cannot be marked through the task endpoint", async () => {
	const r = runtime();
	const initial = r.context.data_to_tutorial(r.get());
	assert.equal(initial.task, "read_helloworld");
	assert.equal(initial.can_continue, true);
	assert.equal(initial.progress, 0);
	await r.request({ task: "read_helloworld" });
	assert.equal(r.store.records.size, 0);
	await r.request({ step: 2 });
	assert.equal(r.store.records.size, 0, "cannot skip ahead");
	await r.request({ step: 1, lesson: "another-lesson" });
	assert.equal(r.store.records.size, 0, "a stale page cannot complete a different lesson");
	const continued = await r.proceed();
	assert.equal(continued.info.next, true);
	assert.equal(continued.info.step, 1);
	assert.deepEqual(Array.from(r.get().info.completed_tasks), ["read_helloworld"]);
	assert.equal(r.get().info.tutorial_key, "learntofight");
	await r.request({ step: 1 });
	assert.deepEqual(Array.from(r.get().info.completed_tasks), ["read_helloworld"], "repeated Continue is harmless");
	await r.proceed();
	assert.equal(r.get().info.tutorial_key, "learntofight", "Continue cannot bypass combat tasks");
	await r.request({ task: "killagoo" });
	await r.request({ task: "firstloot" });
	assert.equal(r.get().info.tutorial_key, "learntofight", "finishing gameplay still leaves Continue available");
	assert.equal((await r.proceed()).info.step, 2);
});

test("version-2 progress visits inserted 0, 7 and 8, then resumes the old unfinished lesson", async () => {
	const base = runtime();
	const r = runtime(previousProgress(base.context, 12));
	insertReading(r.context, "lore", 0);
	insertReading(r.context, "gear-comparison", 7);
	insertReading(r.context, "accessory-comparison", 8);
	const visited = [];
	for (let i = 0; i < 3; i++) {
		visited.push(r.get().info.tutorial_step);
		assert.equal((await r.proceed()).info.next, true);
	}
	assert.deepEqual(visited, [0, 7, 8]);
	assert.equal(r.get().info.tutorial_key, "multiple-characters");
	assert.equal(r.get().info.tutorial_step, 15, "three insertions shift zero-based index 12 to 15");
	assert.equal(r.get().info.code_list.main, "keep-existing-data");
	const tasks = r.get().info.completed_tasks;
	for (const task of [
		"read_helloworld",
		"read_hellocode",
		"read_lore",
		"read_gear-comparison",
		"read_accessory-comparison",
	])
		assert.ok(tasks.includes(task));
	assert.ok(!tasks.includes("characters"));
	assert.ok(!tasks.includes("read_theend"));
});

test("migration preserves all previous positions, including new and finished accounts", () => {
	const base = runtime();
	for (let step = 0; step <= base.context.docs.tutorial.length; step++) {
		const r = runtime(previousProgress(base.context, step));
		const data = r.get();
		assert.equal(data.info.tutorial_step, step);
		assert.equal(data.info.tutorial_version, 3);
		const snapshot = JSON.stringify(data);
		r.context.process_user_data("US_tutorial", data);
		assert.equal(JSON.stringify(data), snapshot, "migration is idempotent");
	}
});

test("stable lesson keys handle later reordering, insertion and removal without numeric drift", async () => {
	const base = runtime();
	const r = runtime(previousProgress(base.context, 12));
	const migrated = r.get();
	r.store.records.set(r.id, structuredClone(migrated));
	const lessons = r.context.docs.tutorial;
	lessons.unshift(lessons.splice(5, 1)[0]);
	assert.equal(r.get().info.tutorial_key, "multiple-characters");
	insertReading(r.context, "lore", 0);
	assert.equal(r.get().info.tutorial_key, "lore");
	await r.proceed();
	assert.equal(r.get().info.tutorial_key, "multiple-characters");
	lessons.splice(
		lessons.findIndex((lesson) => lesson.key === "multiple-characters"),
		1,
	);
	assert.equal(r.get().info.tutorial_key, "events-status");
});

test("previously finished accounts see new reading, then finish again; reset clears reading credit", async () => {
	const base = runtime();
	const r = runtime(previousProgress(base.context, base.context.docs.tutorial.length));
	insertReading(r.context, "lore", 0);
	assert.equal(r.context.data_to_tutorial(r.get()).finished, undefined);
	assert.equal((await r.proceed()).info.finished, true);
	assert.equal(r.get().info.tutorial_key, null);
	insertReading(r.context, "later-reading", r.context.docs.tutorial.length);
	assert.equal(r.get().info.tutorial_key, "later-reading");
	assert.equal((await r.proceed()).info.finished, true);
	const res = { infs: [] };
	await r.context.reset_tutorial_api({ user: "US_tutorial", res });
	assert.equal(r.get().info.tutorial_key, "lore");
	assert.deepEqual(Array.from(r.get().info.completed_tasks), []);
	assert.equal(r.get().info.code_list.main, "keep-existing-data");
});

test("old pre-version accounts retain their migration credits, not credit for new reading", () => {
	const r = runtime({ tutorial_step: 7, completed_tasks: ["firstloot"] });
	const data = structuredClone(r.store.records.get(r.id));
	r.context.migrate_tutorial_data(data);
	assert.equal(data.info.tutorial_key, "theend");
	assert.equal(data.info.tutorial_version, 3);
	for (const task of ["firstloot", "equip", "characters", "events", "read_helloworld", "read_hellocode"])
		assert.ok(data.info.completed_tasks.includes(task));
	assert.ok(!data.info.completed_tasks.includes("read_theend"));
});

test("reading and gameplay requirements can coexist without Continue bypassing gameplay", async () => {
	const r = runtime();
	r.context.docs.tutorial[0].tasks.push("inventory");
	assert.equal(r.context.data_to_tutorial(r.get()).can_continue, false);
	await r.proceed();
	assert.equal(r.store.records.size, 0);
	await r.request({ task: "inventory" });
	assert.equal(r.context.data_to_tutorial(r.get()).can_continue, true);
	await r.proceed();
	assert.ok(r.get().info.completed_tasks.includes("read_helloworld"));
});

test("tutorial writes do not overwrite concurrent account changes", async () => {
	const r = runtime();
	await r.proceed();
	let injected = false;
	const snapshot = structuredClone(r.store.records.get(r.id));
	const store = transactions(r.context, [snapshot], ({ records, versions }) => {
		if (injected) return;
		injected = true;
		const data = records.get(r.id);
		data.info.code_list = { main: "concurrent-edit" };
		versions.set(r.id, versions.get(r.id) + 1);
	});
	const result = await r.request({ task: "killagoo" });
	assert.equal(result.result.failed, true);
	assert.equal(store.records.get(r.id).info.code_list.main, "concurrent-edit");
	assert.ok(!store.records.get(r.id).info.completed_tasks.includes("killagoo"));
});

function tutorialUI(context, data) {
	const elements = {};
	const calls = [];
	context.$ = (selector) => {
		const nodes = selector.split(",").map((name) => (elements[name] ||= {}));
		const chain = {
			show() {
				nodes.forEach((node) => (node.visible = true));
				return chain;
			},
			hide() {
				nodes.forEach((node) => (node.visible = false));
				return chain;
			},
			html(value) {
				nodes.forEach((node) => (node.html = value));
				return chain;
			},
			css() {
				return chain;
			},
			removeClass() {
				return chain;
			},
			codemirror() {
				return chain;
			},
		};
		return chain;
	};
	Object.assign(context, {
		G: { docs: context.docs },
		X: { tutorial: context.data_to_tutorial(data) },
		last_rendered_step: 0,
		last_rendered_track: "",
		modal_count: 0,
		tutorial_ui: true,
		no_graphics: true,
		hide_modals() {},
		hide_modal() {},
		position_modals() {},
		btc() {},
		event: {},
		show_modal(html) {
			context.modal = html;
		},
		api_call(name, args) {
			calls.push({ name, args });
		},
	});
	context.window = context;
	load(context, "js/game.js", ["update_tutorial_ui"]);
	load(context, "js/html.js", ["get_tutorial_view", "continue_tutorial", "render_tutorial_index", "render_tutorial"]);
	return { elements, calls };
}

test("merchants default to their own lessons while numbered and explicit adventurer links stay compatible", () => {
	const r = runtime(),
		ui = tutorialUI(r.context, r.get()),
		c = r.context;
	c.character = { ctype: "merchant" };
	c.X.merchant_tutorial = { step: 1, progress: 0, completed: [], pending: [], finished: false };
	load(c, "js/html.js", ["open_tutorial"]);
	c.open_tutorial();
	assert.equal(ui.calls.at(-1).args.name, "merchant-supplies");
	assert.equal(ui.calls.at(-1).args.track, "merchant");
	c.open_tutorial(1);
	assert.equal(ui.calls.at(-1).args.name, "learntofight");
	assert.equal(ui.calls.at(-1).args.track, "");
	c.open_tutorial(undefined, "");
	assert.equal(ui.calls.at(-1).args.name, "helloworld");
	c.render_tutorial_index();
	assert.match(c.modal, /data-track='merchant'/);
	c.render_tutorial_index("");
	assert.match(c.modal, /data-track=''/);
	c.update_tutorial_ui();
	assert.equal(ui.elements["#tutorialui"].html, c.phrase.html("game.tutorial.progress", { step: 2, total: 5 }));
	c.X.merchant_tutorial.finished = true;
	c.update_tutorial_ui();
	assert.equal(ui.elements[".tutorialui"].visible, false);
	delete c.character;
	c.open_tutorial();
	assert.equal(ui.calls.at(-1).args.track, "");
});

test("reading renders an enabled Continue with the stable lesson key; gameplay stays gated", () => {
	const r = runtime();
	const ui = tutorialUI(r.context, r.get());
	r.context.render_tutorial("Reading content", 0);
	assert.equal(ui.elements[".tutcontinue"].visible, true);
	assert.equal(ui.elements[".tutincomplete"].visible, false);
	assert.equal(ui.elements[".tutprogress"].html, 0);
	const onclick = r.context.modal.match(/class='clickable tutcontinue' onclick='([^']+)'/)[1];
	vm.runInContext(onclick, r.context);
	assert.equal(ui.calls[0].name, "tutorial");
	assert.equal(ui.calls[0].args.lesson, "helloworld");
	assert.equal(ui.calls[0].args.step, 1);
	const data = r.get();
	data.info.tutorial_step = 1;
	data.info.completed_tasks.push("read_helloworld");
	r.context.X.tutorial = r.context.data_to_tutorial(data);
	r.context.render_tutorial("Combat content", 1);
	assert.equal(ui.elements[".tutcontinue"].visible, false);
	assert.equal(ui.elements[".tutincomplete"].visible, true);
});

test("completed later lessons remain marked completed while reading a newly inserted lesson", () => {
	const base = runtime();
	const r = runtime(previousProgress(base.context, 12));
	insertReading(r.context, "lore", 0);
	const ui = tutorialUI(r.context, r.get());
	const previousReading = r.context.docs.tutorial.findIndex((lesson) => lesson.key === "hellocode");
	r.context.render_tutorial("CODE content", previousReading);
	assert.equal(ui.elements[".tutreview"].html, r.context.phrase.html("game.tutorial.completed"));
	assert.equal(ui.elements[".tutprogress"].html, 100);
	assert.equal(ui.elements[".tutcontinue"].visible, false);
	r.context.render_tutorial_index();
	assert.match(
		r.context.modal,
		new RegExp("border-color:#73BD6D; text-align:left' onclick='open_tutorial\\(" + previousReading + ","),
	);
	delete r.context.X;
	assert.doesNotThrow(() => r.context.render_tutorial_index(), "the index also works without an account");
});
