// Keep the offline desktop loader in sync with the game's phrase sources.
const fs = require("fs"),
	path = require("path"),
	root = path.resolve(__dirname, ".."),
	languages = require("../languages"),
	output = path.join(root, "tauri/resources");

fs.mkdirSync(path.join(output, "languages"), { recursive: true });
fs.copyFileSync(path.join(root, "js/phrases.js"), path.join(output, "phrases.js"));
for (const language of languages.languages) {
	const catalog = languages.catalog(language.code),
		phrases = {};
	for (const key of Object.keys(catalog)) if (key.startsWith("desktop.")) phrases[key] = catalog[key];
	fs.writeFileSync(path.join(output, "languages", language.code + ".js"), "phrase.load(" + JSON.stringify(language.code) + "," + JSON.stringify(phrases) + ");\n");
}
console.log("Desktop loading phrases prepared.");
