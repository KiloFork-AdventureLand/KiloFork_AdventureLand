const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const nunjucks = require("nunjucks");
const { root, read, extract } = require("./helpers/server_vm");
const localization = require("../../languages");

function zoom_buttons(language) {
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(root), { autoescape: true });
	vm.runInNewContext(read("filters.js"), { env, nunjucks, localization, to_pretty_num: String });
	const html = env.render("htmls/contents/settings.html", { domain: { language } });
	return [...html.matchAll(/<button([^>]+)>([^<]*)<\/button>/g)].map((match) => ({
		value: Number(match[1].match(/data-zoom="([^"]+)"/)[1]),
		label: match[2],
		onclick: match[1].match(/onclick="([^"]+)"/)[1],
	}));
}

function runtime() {
	const state = {
		cookies: [],
		refreshes: 0,
		resizes: 0,
		properties: {},
		buttons: [-25, 0, 25, 50].map((value) => ({ attributes: { "data-zoom": String(value) } })),
	};
	const style = {
		zoom: "",
		setProperty: (name, value) => {
			state.properties[name] = value;
		},
	};
	const context = vm.createContext({
		document: { documentElement: { style } },
		renderer: {},
		Cookies: {
			set: (name, value) => {
				assert.equal(name, "browser_zoom");
				state.cookies.push(value);
			},
		},
		phrase: (id, args) => localization.phrase(id, args, "en"),
		btc: () => {},
		event: {},
		on_resize: () => {
			state.resizes++;
		},
		$: (target) => ({
			attr: (name, value) => {
				if (value === undefined) return target.attributes[name];
				target.attributes[name] = String(value);
			},
			toggleClass: (name, enabled) => {
				assert.equal(name, "browser-zoomed");
				state.enabled = enabled;
			},
			each: (callback) => {
				if (target === ".browserzoom") return state.buttons.forEach((button) => callback.call(button));
				assert.equal(target, ".CodeMirror");
				callback.call({
					CodeMirror: {
						refresh: () => {
							state.refreshes++;
						},
					},
				});
			},
			width: () => 1200,
			height: () => 800,
		}),
	});
	context.window = context;
	const source = read("js/html.js");
	vm.runInContext(
		source.slice(source.indexOf("var browser_zoom ="), source.indexOf("function show_settings()")),
		context,
	);
	vm.runInContext(
		["viewport_width", "viewport_height"].map((name) => extract(read("js/functions.js"), name)).join("\n"),
		context,
	);
	return { context, state, style };
}

test("zoom restores all four saved values and updates the selected choice and viewport measurements", () => {
	for (const value of [-25, 0, 25, 50]) {
		const { context, state, style } = runtime();
		context.set_browser_zoom(String(value));
		const scale = 1 + value / 100;
		assert.equal(context.browser_zoom, value);
		assert.equal(style.zoom, value ? scale : "");
		assert.equal(state.properties["--browser-zoom"], scale);
		assert.equal(state.properties["--browser-zoom-inverse"], 1 / scale);
		assert.equal(context.viewport_width(), 1200 / scale);
		assert.equal(context.viewport_height(), 800 / scale);
		assert.deepEqual(
			state.buttons.map((button) => button.attributes["aria-pressed"]),
			[-25, 0, 25, 50].map((option) => String(option === value)),
		);
		assert.equal(state.enabled, value !== 0);
		assert.deepEqual(state.cookies, [value]);
		assert.equal(state.refreshes, 1);
		assert.equal(state.resizes, 1);
	}
});

test("each Zoom choice selects its own value directly", () => {
	const { context, state } = runtime();
	const buttons = zoom_buttons("en");
	for (const value of [50, -25, 25, 0]) {
		vm.runInContext(buttons.find((button) => button.value === value).onclick, context);
		assert.equal(context.browser_zoom, value);
	}
	assert.deepEqual(state.cookies, [50, -25, 25, 0]);
	assert.equal(context.browser_zoom, 0);
});

test("Settings shows exactly the four requested choices in every language", () => {
	for (const { code } of localization.languages) {
		const buttons = zoom_buttons(code);
		assert.deepEqual(
			buttons.map((button) => button.value),
			[-25, 0, 25, 50],
			code,
		);
		for (const button of buttons) {
			assert.equal(
				button.label,
				localization.phrase(
					"interface.settings.zoom_percent",
					{
						percent: (button.value > 0 ? "+" : "") + button.value,
					},
					code,
				),
			);
		}
	}
});

test("unsupported saved zoom values reset to normal size", () => {
	for (const value of [undefined, "invalid", -100, -75, -50, 10, 75, Infinity]) {
		const { context, state, style } = runtime();
		context.set_browser_zoom(value);
		assert.equal(context.browser_zoom, 0);
		assert.equal(style.zoom, "");
		assert.equal(state.buttons[1].attributes["aria-pressed"], "true");
	}
});

test("headless characters leave zoom, cookies and UI untouched", () => {
	for (const flag of ["no_html", "no_graphics"]) {
		const { context, state, style } = runtime();
		context[flag] = true;
		context.set_browser_zoom(-25);
		assert.equal(context.browser_zoom, 0);
		assert.equal(style.zoom, "");
		assert.deepEqual(state.cookies, []);
		assert.equal(state.refreshes, 0);
		assert.equal(state.resizes, 0);
	}
});
