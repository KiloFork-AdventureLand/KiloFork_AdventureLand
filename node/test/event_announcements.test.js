"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const root = path.resolve(__dirname, "../..");
const html = fs.readFileSync(path.join(root, "js/html.js"), "utf8");
const source = html.slice(html.indexOf("function open_event_announcement("), html.indexOf("function render_server("));

function setup(extra = {}) {
	const banner = {
		values: {},
		writes: 0,
		visible: false,
		content: "",
		data(key, value) {
			if (arguments.length == 1) return this.values[key];
			this.values[key] = value;
			return this;
		},
		html(value) {
			this.content = value;
			this.writes++;
			return this;
		},
		show() {
			this.visible = true;
		},
		hide() {
			this.visible = false;
		},
	};
	const opened = [],
		visuals = [];
	const context = vm.createContext({
		no_html: false,
		no_graphics: false,
		character: null,
		socket: { connected: true },
		S: {},
		$: (selector) => {
			assert.equal(selector, "#event-announcements");
			return banner;
		},
		html_escape: (value) =>
			String(value)
				.replaceAll("&", "&amp;")
				.replaceAll("<", "&lt;")
				.replaceAll(">", "&gt;")
				.replaceAll('"', "&quot;")
				.replaceAll("'", "&#39;"),
		sprite: (...args) => {
			visuals.push(args);
			return '<span class="sprite"></span>';
		},
		item_container: (...args) => {
			visuals.push(args);
			return '<span class="item"></span>';
		},
		open_guide: (...args) => opened.push(args),
		render_anniversary_event: () => opened.push(["anniversary-window"]),
		pcs() {},
		event: {},
		...extra,
	});
	vm.runInContext(fs.readFileSync(path.join(root, "design/events.js"), "utf8"), context);
	context.G = { events: context.events, items: {}, monsters: { rgoo: { size: 1.5 }, crabxx: { size: 1.5 } } };
	vm.runInContext(source, context);
	return { context, banner, opened, visuals };
}

test("every defined event has colors, a pixel effect and an existing modal", () => {
	const { context } = setup();
	assert.equal(Object.keys(context.G.events).length, 11);
	const effects = new Set(["confetti", "sparks", "bubbles", "splash", "snow", "fireworks", "hearts", "embers"]);
	for (const event of Object.values(context.G.events)) {
		assert.match(event.announcement.color, /^#[\dA-F]{6}$/);
		assert.match(event.announcement.accent, /^#[\dA-F]{6}$/);
		assert(effects.has(event.announcement.effect));
		assert(event.announcement.text.length > 0);
		assert(fs.existsSync(path.join(root, "docs/guide", event.modal + ".html")), event.modal);
	}
});

test("cards use only connected server state, including seasonal waiting rounds", () => {
	const { context, banner } = setup();
	context.anniversary = context.halloween = true;
	context.render_event_announcements();
	assert.equal(banner.visible, false, "page flags cannot enable an event");
	context.S = {
		anniversary: { active: true, live: false },
		goobrawl: { live: true },
		franky: { live: false },
		halloween: false,
		holidayseason: { active: false },
	};
	context.render_event_announcements();
	assert.equal(banner.visible, true);
	assert.equal((banner.content.match(/class='gamebutton event-announcement'/g) || []).length, 2);
	assert.match(banner.content, /Ten Years of Adventure Land/);
	assert.match(banner.content, /Goo Brawl/);
	assert.doesNotMatch(banner.content, /Franky|Halloween|Holiday Season/);
	context.S = { icegolem: true };
	context.render_event_announcements();
	assert.match(banner.content, /Ice Golem/);
	assert.doesNotMatch(banner.content, /Goo Brawl|Ten Years/);
	context.socket.connected = false;
	context.render_event_announcements();
	assert.equal(banner.visible, false);
	assert.equal(banner.content, "");
});

test("live updates do not restart animations unless the visible event list changes", () => {
	const { context, banner } = setup();
	context.S = { anniversary: { active: true, live: true, x: 1, y: 2 } };
	context.render_event_announcements();
	const writes = banner.writes;
	context.S.anniversary.x = 3;
	context.render_event_announcements();
	assert.equal(banner.writes, writes);
	context.G.events.anniversary.announcement.text = "New event details";
	context.render_event_announcements();
	assert.equal(banner.writes, writes + 1);
});

test("each card opens its own guide, with the anniversary window only after character selection", () => {
	const { context, banner, opened } = setup();
	for (const key of Object.keys(context.G.events)) context.S[key] = true;
	context.render_event_announcements();
	const handlers = [...banner.content.matchAll(/onclick='([^']+)'/g)];
	assert.equal(handlers.length, 11);
	for (const handler of handlers) vm.runInContext(handler[1], context);
	assert.deepEqual(
		opened,
		Object.values(context.G.events).map((event) => [event.modal, "/docs/ref/" + event.modal]),
	);
	context.character = { name: "Visitor" };
	context.open_event_announcement("anniversary");
	assert.deepEqual(opened.at(-1), ["anniversary-window"]);
	context.open_event_announcement("missing");
	assert.equal(opened.length, 12);
});

test("no-HTML returns before DOM work; no-graphics retains text without sprites or effects", () => {
	const headless = setup({
		no_html: true,
		$() {
			throw new Error("No HTML means no DOM access");
		},
	});
	headless.context.S = { anniversary: true };
	headless.context.render_event_announcements();
	headless.context.open_event_announcement("anniversary");
	assert.equal(headless.opened.length, 0);
	const { context, banner, visuals } = setup({ no_graphics: true });
	vm.runInContext(fs.readFileSync(path.join(root, "js/pixi/fake/pixi.min.js"), "utf8"), context);
	context.S = { anniversary: true };
	context.render_event_announcements();
	assert.equal(visuals.length, 0);
	assert.equal(context.PIXI._no_graphics_warning_shown, undefined);
	assert.match(banner.content, /Ten Years/);
	assert.doesNotMatch(banner.content, /event-announcement-effects/);
});

test("effects are bounded, stepped, and respect reduced motion", () => {
	const { context, banner } = setup();
	context.S = { halloween: true };
	context.render_event_announcements();
	assert.equal((banner.content.match(/<i style=/g) || []).length, 12);
	const css = fs.readFileSync(path.join(root, "css/index.css"), "utf8");
	assert.match(css, /event-pixel-fall 3\.6s steps\(16,end\) 4/);
	assert.match(css, /prefers-reduced-motion:reduce/);
	assert.match(css, /max-height:min\(264px,32vh\)/);
	assert(!source.includes("PIXI"));
});
