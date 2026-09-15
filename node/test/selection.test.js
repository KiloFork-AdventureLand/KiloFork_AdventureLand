const assert = require("node:assert/strict");
const test = require("node:test");
const nunjucks = require("nunjucks");
const { root, read } = require("./helpers/server_vm");

test("the server list accepts scrollbar input while its surrounding menu stays click-through", () => {
	const source = read("htmls/contents/selection.html");
	const menu = source.slice(source.indexOf('<div class="menu disableclicks"'), source.indexOf('<div id="backbutton"'));
	const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(root), { autoescape: true });
	const servers = ["EU", "US", "ASIA"].flatMap((region) =>
		["I", "II", "III", "PVP"].map((name) => ({
			region,
			name,
			address: region + ".example.invalid",
			path: "/" + name,
			info: { players: 10, pvp: name === "PVP" },
		})),
	);
	const html = env.renderString(menu, { servers, domain: { languages: [], boost: 0 }, user: {}, phrase: (id) => id });
	assert.match(html, /^<div class="menu disableclicks"/);
	assert.match(html, /<div\s+class="enableclicks"\s+style="[^"]*overflow-y:\s*scroll;/);
	assert.equal((html.match(/class="clickable enableclicks"/g) || []).length, servers.length);
	assert.match(html, /onclick="server_address='ASIA.example.invalid'; server_path='\/PVP'; init_socket\(\);"/);
	assert.match(html, /Eastlands/);
	assert.match(read("css/common.css"), /\.disableclicks\s*\{\s*pointer-events:\s*none;/);
	assert.match(
		read("css/common.css"),
		/\.gamebutton,\.enableclicks,\.slimbutton,\.tinybutton\s*\{\s*pointer-events:\s*auto;/,
	);
});
