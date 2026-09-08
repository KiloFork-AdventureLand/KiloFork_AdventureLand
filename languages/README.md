# Translation catalogs

English phrases live in `en/*.js`. Each entry has a stable semantic identifier and a comment explaining where it appears, what it means, its parameters, and any fixed names or CODE. Translations use the same identifiers in `<language>/<domain>.json`. The language registry and browser/desktop locale aliases live in `js/phrases.js`.

Every new or changed player-facing feature must update its English phrases and every supported language in the same change. This includes the website, login, game UI, messages, descriptions, dialogue, tutorials, guides, public CODE documentation and player-facing tools. Developer-facing proposals, experiments, prototypes, internal scripts and operational logs are outside this scope. When prototype content enters the live product, the translation requirements apply.

## Runtime

The server reads and caches only the requested language and its English fallback. Browsers receive one `/phrases/<language>.js` catalog. Documentation and account pages use the same catalog through request-local Nunjucks helpers.

```js
phrase("language.choose");
phrase("language.select", { language: "Türkçe" });
phrase.html("language.select", { language: user_supplied_name });
```

Use `phrase` for plain text and `phrase.html` when inserting text into HTML. The HTML helper escapes parameter values. A catalog may contain fixed HTML from an existing renderer; translations must preserve its tags, attributes, handlers, URLs, and inline CODE.

Placeholders are named, such as `{name}` or `{count}`. Their position may change with grammar. Optional `.one`, `.few`, `.many`, `.other`, and other plural-category keys follow `Intl.PluralRules` when a numeric `count` is supplied. Other parameters, including preformatted quantities, do not select plural forms; write their surrounding text so it works for every value.

Definition display uses `phrase.definition(section, id, field, original)`. It leaves the canonical game definitions intact. Proper item, NPC, monster, map and character names remain unchanged, as do Adventure Land and public CODE identifiers. Human skill, condition, class, stat and ability labels translate, and prose references must match their chosen display names. A named item and a skill with the same English words can therefore need different treatment.

Server-authored messages use `localization.message(id, parameters, fields)`. Packets retain their original English `message` and add `phrase` and `phrase_args`. UI renderers use `phrase.message(packet)`; CODE receives the original event and its original fields. Do not translate player chat, saved CODE, or arbitrary logs at a generic output function.

The language picker saves `User.language` and `User.language_set`, then reloads. A pending explicit browser choice is adopted at login; automatic browser detection does not replace an established account preference.

## Adding text

Reuse an existing phrase when both meaning and use match. Otherwise add a descriptive identifier to the appropriate English domain and call it through the existing renderer or template helper. Translate a complete sentence with named parameters rather than joining translated fragments. Keep IDs stable when wording changes.

The English comment should explain the actual action or state, where the text appears, parameter meanings, compact-control constraints, and any quoted control or proper name. Distinguish visible prose from executable examples: braces or a comment-like prefix alone do not make prose a CODE identifier. For gameplay quantities, check the actual handler and loaded definitions before describing an effect.

Keep canonical definition descriptions and their English phrase values aligned. Preserve server event names, argument shapes, raw user text, callback order and terminal Promise results. Use the established message metadata or response path appropriate to that event.

## Fonts

Arabic uses scoped direction and font rules on guide/tutorial articles. Preserve left-to-right CODE blocks and keep the shared UI structure simple.

## Catalog status

| Language | Code | Status |
| --- | --- | --- |
| English | en | Complete |
| Turkish | tr | Complete |
| Russian | ru | Complete |
| Spanish — Spain | es | Complete |
| Portuguese — Brazil | pt-BR | Complete |
| German | de | Complete |
| Japanese | ja | Complete |
| French | fr | Complete |
| Polish | pl | Complete |
| Korean | ko | Complete |
| Simplified Chinese | zh-Hans | Complete |
| Traditional Chinese | zh-Hant | In progress |
| Thai | th | Planned |
| Spanish — Latin America | es-419 | Planned |
| Ukrainian | uk | Planned |
| Italian | it | Planned |
| Czech | cs | Planned |
| Hungarian | hu | Planned |
| Portuguese — Portugal | pt-PT | Planned |
| Vietnamese | vi | Planned |
| Swedish | sv | Planned |
| Dutch | nl | Planned |
| Danish | da | Planned |
| Indonesian | id | Planned |
| Finnish | fi | Planned |
| Norwegian | no | Planned |
| Romanian | ro | Planned |
| Greek | el | Planned |
| Bulgarian | bg | Planned |
| Malay | ms | Planned |
| Arabic — Modern Standard Arabic | ar | Planned |
| Filipino | fil | Planned |
