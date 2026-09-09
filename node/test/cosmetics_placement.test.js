"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function runtime() {
	const c = vm.createContext({
		console,
		positions: {},
		round: Math.round,
		in_arr: (v, a) => a.includes(v),
		is_string: (v) => typeof v === "string",
		clone: (v) => JSON.parse(JSON.stringify(v)),
		prune_cx() {},
	});
	function load(file, name) {
		const text = read(file),
			start = text.indexOf("function " + name + "(");
		assert(start >= 0, name);
		vm.runInContext(text.slice(start, text.indexOf("\nfunction ", start + 1)), c);
	}
	for (const file of ["sprites", "cosmetics", "precomputed_images", "npcs"])
		vm.runInContext(read("design/" + file + ".js"), c);
	c.G = {
		sprites: c.sprites,
		cosmetics: c.cosmetics,
		images: c.precomputed.images,
		dimensions: {},
		items: {},
		monsters: {},
		classes: {},
		maps: {},
		npcs: c.npcs,
	};
	Object.assign(c, {
		window: c,
		T: {},
		SS: {},
		SSU: {},
		IID: null,
		FC: {},
		FM: {},
		XYWH: {},
		C: {},
		textures: {},
		no_graphics: false,
		offset_walking: false,
		head_x: 0,
		head_y: 0,
		new_attacks: false,
		ZEPS: 0.001,
		CINF: 1e9,
		last_cx_d: [0, 0],
	});
	load("js/old_common_functions.js", "process_game_data");
	load("js/html.js", "precompute_image_positions");
	c.precompute_image_positions();
	for (const [id, d] of Object.entries(c.IID)) {
		c.XYWH[id] = [d[2], d[3], d[4], d[5], d[6]];
		c.FC[id] = d[7];
		c.C[d[7]] = {};
	}
	for (const definition of Object.values(c.G.sprites))
		definition.matrix.forEach((row, i) =>
			row.forEach((id, j) => {
				if (id && !definition.skip) c.FM[id] = [i, j];
			}),
		);
	class Sprite {
		constructor(texture) {
			this.texture = texture;
			this.x = this.y = 0;
			this.children = [];
			this.anchor = { set() {} };
		}
		addChild(child) {
			this.children.push(child);
		}
	}
	c.PIXI = {
		Sprite,
		Rectangle: class {
			constructor(x, y, width, height) {
				Object.assign(this, { x, y, width, height });
			}
		},
		Texture: class {
			constructor(base, frame) {
				Object.assign(this, { frame, width: frame.width, height: frame.height });
			}
		},
	};
	for (const name of ["generate_textures", "set_texture"]) load("js/functions.js", name);
	load("js/game.js", "cosmetics_logic");
	load("js/html.js", "sprite");
	load("js/html.js", "sprite_image");
	c.new_sprite = (skin, stype) => {
		if (!c.textures[skin]) c.generate_textures(skin, stype);
		return Object.assign(new Sprite(), { skin, stype, frames: 4 });
	};
	c.destroy_sprite = () => {};
	const actor = (skin, cx, i, j) => {
		if (!c.textures[skin]) c.generate_textures(skin, c.T[skin]);
		const s = Object.assign(new Sprite(c.textures[skin][i][j]), { skin, cx: { ...cx }, i, j, updates: 0 });
		c.cosmetics_logic(s);
		return s;
	};
	return { c, actor, load };
}

test("HTML sprite metadata preserves every default and explicit game sprite type", () => {
	const { c } = runtime();
	const before = { ...c.T };
	c.process_game_data();
	for (const [id, type] of Object.entries(c.T)) {
		assert.equal(before[id], type, id + " keeps its game type");
		assert.equal(c.IID[id][8], type, id + " metadata type");
	}
	assert.equal(c.T.potiongirl, "full");
	assert.equal(c.T.fancypots, "animation");
});

test("NPC portraits keep the right sheet crop before and after HTML previews initialize", () => {
	const { c, load } = runtime();
	load("js/html.js", "render_interaction");
	c.process_game_data();
	const portraits = Object.values(c.G.npcs)
		.map((npc) => npc.side_interaction)
		.filter((face) => face && face.auto);
	const before = portraits.map((face) => c.render_interaction(face, "return_html"));
	c.IID = null;
	c.precompute_image_positions();
	portraits.forEach((face, i) => assert.equal(c.render_interaction(face, "return_html"), before[i], face.skin));
	const potion = c.render_interaction(c.G.npcs.fancypots.side_interaction, "return_html");
	assert.match(potion, /margin-left: -416px; margin-top: -576px; width: 1248px; height: 1152px;/);
	assert.match(potion, /src='\/images\/tiles\/characters\/custom2\.png\?v=4'/);
	// The real animated shopkeeper must still use the animation portrait layout.
	assert.match(
		c.render_interaction({ auto: true, skin: "fancypots", message: "" }, "return_html"),
		/width: 2256px; height: 1600px;/,
	);
});

test("hooded upper costumes hide hair in both character rendering and HTML previews", () => {
	const { c, actor } = runtime();
	for (const [skin, upper, compatible] of [
		["mabw", "marmor12c", true],
		["mabw", "marmor12d", true],
		["mabw", "marmor12a", true],
		["sarmor1a", "marmor12c", false],
	])
		for (let j = 0; j < 4; j++) {
			const s = actor(skin, { head: "makeup117", hair: "hairdo100", upper }, 1, j);
			const hairVisible = !compatible || !(c.G.cosmetics.prop[upper] || []).includes("no_hair");
			assert.equal(!!s.cxc[upper], compatible, upper + " costume compatibility");
			assert.equal(!!s.cxc.hairdo100, hairVisible, upper + " game hair");
			const layers = [];
			c.sprite_image = (id) => {
				layers.push(id);
				return "";
			};
			c.sprite(s.skin, { cx: { ...s.cx }, j, scale: 1 });
			assert.equal(layers.includes(upper), compatible);
			assert.equal(layers.includes("hairdo100"), hairVisible, upper + " preview hair");
		}
});

test("character-sheet NPC portraits use the sprite renderer instead of animation coordinates", () => {
	const { c, load } = runtime();
	load("js/html.js", "render_interaction");
	const face = Object.values(c.G.npcs)
		.map((npc) => npc.side_interaction)
		.find((face) => face && c.T[face.skin] === "character");
	assert(face, "a shipped character-sheet portrait exists");
	assert.equal(face.skin, "xxschar2h");
	const html = c.render_interaction(face, "return_html");
	assert.match(html, /width: 1296px;/, "the 324px character sheet stays at integer 4x scale");
	assert.doesNotMatch(html, /width: 2256px;/, "not the unrelated animation layout");
	assert.match(html, /src='\/images\/all_characters\/xxschar2\.png'/);
});

test("cosmetic rendering stays harmless without graphics", () => {
	const { c } = runtime();
	c.no_graphics = true;
	Object.defineProperty(c, "PIXI", {
		get() {
			assert.fail("Headless PIXI access");
		},
	});
	c.cosmetics_logic({ skin: "mabw", cx: { head: "makeup117", hair: "hairdo100", upper: "marmor12c" } });
});

test("face layers stay on the eyes across body sizes, directions and walking frames", () => {
	const { c, actor } = runtime();
	assert.equal(c.cosmetics.default_face_position, 7);
	const slots = { face: "face", makeup: "makeup", a_makeup: "makeup", beard: "chin" };
	const ids = Object.keys(c.T).filter((id) => slots[c.T[id]]);
	// Separate offsets must not accidentally share the beard setting.
	c.cosmetics.default_makeup_position = 1;
	c.cosmetics.default_beard_position = 2;
	for (const skin of ["mabw", "mbody4b", "sarmor1a", "larmor1a"])
		for (const id of ids)
			for (let j = 0; j < 4; j++)
				for (let i = 0; i < 3; i++) {
					const s = actor(skin, { head: "makeup117", [slots[c.T[id]]]: id }, i, j);
					const offset = c.T[id] === "face" ? 7 : c.T[id] === "beard" ? 2 : 1;
					assert.equal(s.cxc[id].y, s.cxc.makeup117.y - offset, id);
					assert.equal(s.cxc[id].x, s.cxc.makeup117.x, id);
					if (i !== 1) continue;
					const html = [];
					c.sprite_image = (name, args) => {
						html.push({ id: name, ...args });
						return "";
					};
					c.sprite(skin, { cx: { ...s.cx }, j, scale: 1 });
					const layer = html.find((layer) => layer.id === id);
					assert(layer, id + " keeps its authored rear frame");
					assert.equal(-layer.p, s.cxc[id].y, id + " HTML height");
					assert.equal(layer.x || 0, s.cxc[id].x, id + " HTML horizontal placement");
				}
});

test("backpack previews use the approved game placement without changing walking sway", () => {
	const { c, actor, load } = runtime();
	for (const back of Object.keys(c.cosmetics.back))
		for (let j = 0; j < 4; j++)
			for (let i = 0; i < 3; i++) {
				const s = actor("mabw", { head: "makeup117", back }, i, j);
				assert.equal(s.cxc[back].x, i - 1 + (j === 1 ? 1 : j === 2 ? -1 : 0));
				assert.equal(s.cxc[back].y, i === 1 ? 0 : 1);
				if (i !== 1) continue;
				const html = [];
				c.sprite_image = (id, args) => {
					html.push({ id, ...args });
					return "";
				};
				c.sprite("mabw", { cx: { ...s.cx }, j, scale: 1 });
				assert.equal(html.find((layer) => layer.id === back).x, s.cxc[back].x);
			}
	load("js/html.js", "sprite_image");
	const plain = c.sprite_image("backpacks00", { cwidth: 94, scale: 2 });
	const shifted = c.sprite_image("backpacks00", { cwidth: 94, scale: 2, x: 1 });
	assert.equal(Number(shifted.match(/left: ([\d.-]+)px/)[1]) - Number(plain.match(/left: ([\d.-]+)px/)[1]), 2);
	assert.equal(
		shifted.match(/margin-left: ([\d.-]+)px/)[1],
		plain.match(/margin-left: ([\d.-]+)px/)[1],
		"Move the layer, not its source crop",
	);
});
