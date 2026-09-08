# Translation catalogs

English phrases live in `en/*.js`. Each entry has a stable identifier and a comment explaining where it appears, its parameters, and any fixed names or code. Translations use the same identifiers in `<language>/<domain>.json`.

The server reads and caches only the requested language and its English fallback. Browsers receive one `/phrases/<language>.js` catalog. Documentation and account pages use the same catalog through request-local Nunjucks helpers.

```js
phrase("language.choose");
phrase("language.select", { language: "Türkçe" });
phrase.html("language.select", { language: user_supplied_name });
```

Use `phrase` for plain text and `phrase.html` when inserting text into HTML. The HTML helper escapes parameter values. A catalog may contain fixed HTML from an existing renderer; translations must preserve its tags, attributes, handlers, URLs, and inline CODE.

Placeholders are named, such as `{name}` or `{count}`. Their position may change with grammar. Optional `.one`, `.few`, `.many`, `.other`, and other plural-category keys follow `Intl.PluralRules` when `count` is supplied.

Definition display uses `phrase.definition(section, id, field, original)`. It leaves the canonical game definitions intact. Item, NPC, monster, map, and character names remain unchanged, as do Adventure Land and public CODE identifiers.

Server-authored messages use `localization.message(id, parameters, fields)`. Packets retain their original English `message` and add `phrase` and `phrase_args`. UI renderers use `phrase.message(packet)`; CODE receives the original event and its original fields. Do not translate player chat, saved CODE, or arbitrary logs at a generic output function.

The language picker saves `User.language` and `User.language_set`, then reloads. A pending explicit browser choice is adopted at login; automatic browser detection does not replace an established account preference.

After changing the phrase runtime or desktop loading text, run:

```sh
node scripts/build_desktop_languages.js
```

This prepares the small offline Tauri catalogs. The game itself still loads only its active language.
