var fs = require("fs"),
	path = require("path"),
	AsyncLocalStorage = require("async_hooks").AsyncLocalStorage,
	runtime = require("../js/phrases.js");

var context = new AsyncLocalStorage();
var codes = runtime.languages.map(function (language) {
	return language.code;
});

function supported(language) {
	return typeof language === "string" && codes.includes(language);
}

function normalize(language) {
	var code = runtime.normalize(language);
	return supported(code) ? code : null;
}

function cookie_language(req) {
	return normalize(req && req.cookies && req.cookies.language);
}

function cookie_source(req) {
	var source = req && req.cookies && req.cookies.language_source;
	return source === "detected" || source === "account" ? source : "explicit";
}

function explicit_cookie(req) {
	return !!cookie_language(req) && cookie_source(req) === "explicit";
}

function browser_language(req) {
	var header = req && req.headers && req.headers["accept-language"];
	if (!header && req && req.get) header = req.get("accept-language");
	var values = String(header || "")
		.slice(0, 4096)
		.split(",")
		.map(function (entry, index) {
			var parts = entry.trim().split(";"),
				quality = 1;
			for (var part of parts.slice(1)) {
				var match = /^\s*q\s*=\s*(\d*(?:\.\d+)?)\s*$/i.exec(part);
				if (match) quality = Number(match[1]);
			}
			return { language: parts[0], quality: quality, index: index };
		})
		.filter(function (entry) {
			return entry.quality > 0 && entry.quality <= 1 && normalize(entry.language);
		})
		.sort(function (a, b) {
			return b.quality - a.quality || a.index - b.index;
		})
		.map(function (entry) {
			return entry.language;
		});
	return values.length ? normalize(runtime.detect(values)) : null;
}

function initialized(user) {
	var saved = normalize(user && user.language);
	return !!(saved && (user.language_set || (user.info && user.info.language_set) || saved !== "en"));
}

function select(req, user) {
	if (user === undefined) user = req && req._language_user;
	var cookie = cookie_language(req);
	if (cookie && explicit_cookie(req)) return { language: cookie, source: "cookie" };
	if (initialized(user)) return { language: normalize(user.language), source: "account" };
	if (cookie) return { language: cookie, source: cookie_source(req) === "detected" ? "browser" : "cookie" };
	var detected = browser_language(req);
	return { language: detected || "en", source: detected ? "browser" : "default" };
}

function preference_fields(req, user) {
	var choice = select(req, user);
	return {
		language: choice.language,
		language_set: explicit_cookie(req) ? "explicit" : choice.source === "default" ? false : "detected",
	};
}

// The marker is top-level so language changes never replace the bank's info data.
async function initialize_user(collection, req, user) {
	if (!user || initialized(user)) return user;
	var fields = preference_fields(req, user);
	if (!fields.language_set) return user;
	var query = {
		_id: user._id,
		language: user.language === undefined ? { $exists: false } : user.language,
		language_set: { $in: [null, false] },
		"info.language_set": { $in: [null, false] },
	};
	var result = await collection.updateOne(query, { $set: fields });
	if (result.matchedCount) Object.assign(user, fields);
	else {
		// A picker or another initial request may have saved a preference meanwhile.
		var current = await collection.findOne({ _id: user._id }, { projection: { language: 1, language_set: 1, "info.language_set": 1 } });
		if (current) {
			user.language = current.language;
			user.language_set = current.language_set || (current.info && current.info.language_set);
		}
	}
	return user;
}

async function set_preference(collection, user, language) {
	if (!supported(language)) return { failed: true, reason: "invalid_language" };
	if (!user) return { failed: true, reason: "not_logged_in" };
	var fields = { language: language, language_set: "explicit" };
	var result = await collection.updateOne({ _id: user._id }, { $set: fields });
	if (!result.matchedCount) return { failed: true, reason: "not_logged_in" };
	Object.assign(user, fields);
	return { success: true, language: language };
}

function current_language() {
	var current = context.getStore();
	return (current && current.language) || "en";
}

function set_language(language) {
	var current = context.getStore();
	if (current) current.language = normalize(language) || "en";
}

function bind_user(req, user) {
	if (req) req._language_user = user;
	set_language(select(req, user).language);
}

function domain_fields(req, user) {
	if (user === undefined) user = req && req._language_user;
	var choice = select(req, user);
	set_language(choice.language);
	return {
		language: choice.language,
		language_source: choice.source,
		language_set: !!cookie_language(req) || initialized(user),
		languages: runtime.languages,
	};
}

function middleware(get_user) {
	return function (req, res, next) {
		res.set("Cache-Control", "private, no-store");
		res.vary("Accept-Language");
		res.vary("Cookie");
		context.run({ language: select(req).language }, function () {
			Promise.resolve()
				.then(function () {
					return get_user(req);
				})
				.then(function (user) {
					bind_user(req, user);
					next();
				}, next);
		});
	};
}

function create_catalog_loader(directory) {
	var cache = Object.create(null);
	function read(language) {
		var folder = path.join(directory, language),
			result = Object.create(null);
		if (!fs.existsSync(folder)) return result;
		for (var name of fs.readdirSync(folder).sort()) {
			if (!name.endsWith(language === "en" ? ".js" : ".json")) continue;
			var file = path.join(folder, name);
			var entries = language === "en" ? require(file) : JSON.parse(fs.readFileSync(file, "utf8"));
			for (var id of Object.keys(entries)) {
				if (typeof entries[id] !== "string") throw new Error("Invalid phrase " + language + "/" + name + ": " + id);
				if (Object.prototype.hasOwnProperty.call(result, id)) throw new Error("Duplicate phrase " + language + ": " + id);
				result[id] = entries[id];
			}
		}
		return result;
	}
	return function catalog(language) {
		if (!supported(language)) throw new Error("Unsupported language");
		if (!cache[language]) {
			var english = cache.en || (cache.en = Object.freeze(read("en")));
			cache[language] = language === "en" ? english : Object.freeze(Object.assign(Object.create(null), english, read(language)));
		}
		return cache[language];
	};
}

var catalog = create_catalog_loader(__dirname);
var translators = Object.create(null);

function translator(language) {
	language = normalize(language) || current_language();
	return translators[language] || (translators[language] = runtime.create(language, catalog(language)));
}

function phrase(id, params, language) {
	return translator(language)(id, params);
}

function phrase_html(id, params, language) {
	return translator(language).html(id, params);
}

function message(id, parameters, fields) {
	return Object.assign({}, fields, { message: phrase(id, parameters, "en"), phrase: id, phrase_args: parameters || {} });
}

function serve(req, res) {
	var language = req.params.language;
	if (!supported(language)) return res.status(404).type("text/plain").send("Unknown language");
	var json = JSON.stringify(catalog(language)).replace(/[<>&\u2028\u2029]/g, function (character) {
		return "\\u" + character.charCodeAt(0).toString(16).padStart(4, "0");
	});
	return res
		.type("application/javascript")
		.set("Cache-Control", "public, max-age=2592000")
		.set("X-Content-Type-Options", "nosniff")
		.send("phrase.load(" + JSON.stringify(language) + "," + json + ");\n");
}

module.exports = {
	languages: runtime.languages,
	supported: supported,
	normalize: normalize,
	cookie_language: cookie_language,
	cookie_source: cookie_source,
	explicit_cookie: explicit_cookie,
	select: select,
	preference_fields: preference_fields,
	initialized: initialized,
	initialize_user: initialize_user,
	set_preference: set_preference,
	bind_user: bind_user,
	set_language: set_language,
	current_language: current_language,
	domain_fields: domain_fields,
	middleware: middleware,
	create_catalog_loader: create_catalog_loader,
	catalog: catalog,
	phrase: phrase,
	phrase_html: phrase_html,
	message: message,
	serve: serve,
};
