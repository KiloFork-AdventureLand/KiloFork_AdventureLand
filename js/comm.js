var last_focus = new Date();
setInterval(function () {
	if ($(":focus").length) last_focus = new Date();
}, 120);

function touch_startify() {
	return;
	$("[onclick]").each(function () {
		var $this = $(this);
		$this.attr("ontouchstart", $this.attr("onclick"));
		$this.removeAttr("onclick");
	});
}

function toggle_ui() {
	if (socket && observing && $(".serversuic").is(":visible")) {
		$(".charactersui").hide();
		$(".serversui").hide();
	} else if ($(".charactersuic").is(":visible")) {
		$(".charactersui").hide();
		$(".serversui").css("display", "inline-block");
	} else {
		$(".serversui").hide();
		$(".charactersui").css("display", "inline-block");
	}
}

function hide_nav() {
	$(".charactersui").hide();
	$(".serversui").hide();
}

var rc_cache = "-1";
function render_characters() {
	var html = "",
		key = "";
	X.characters.forEach(function (char) {
		key += char.name + " " + char.level + " " + char.server + " " + char.rip + " " + char.skin + " " + char.cx + "|";
	});
	if (key == rc_cache) return;
	rc_cache = key;
	X.characters.forEach(function (char) {
		if (char.online) {
			html += "<div class='gamebutton mb5 mr5' onclick='if(bc(this)) return; observe_character(\"" + char.name + "\");' style='text-align: left; width: 172px'>";
			html += "<span style='float:left; margin-right: 5px; margin-top: -5px; margin-left: -4px; margin-bottom: -7px;'>" + sprite(char.skin, { cx: char.cx, rip: char.rip }) + "</span>";
			html += (char.name.length <= 8 && char.name) || char.name.substr(0, 8) + "..";
			html += " <span style='color: #F3A05D'>[" + server_to_ui(char.server) + "]</span>";
			html += "<br />";
			html += phrase.html("chat.character_level", { level: char.level }) + " <span class='gray'>" + phrase.definition("class", char.type, "name", char.type.toTitleCase()) + "</span>";
			html += "</div>";
		}
	});
	if (!html) html += "<div class='gamebutton mb5'>" + phrase.html("chat.all_offline") + "</div>";
	$(".charactersuic").html(html);
	touch_startify();
}

var sl_cache = "-1";
function render_servers() {
	var html = "",
		key = "";
	X.servers.forEach(function (server) {
		key += server.name + " " + server.players + "|";
	});
	if (key == sl_cache) return;
	sl_cache = key;
	X.servers.forEach(function (server) {
		html += "<div class='gamebutton mb5 mr5' onclick='if(bc(this)) return; server_address=\"" + server.address + '"; server_path="' + server.path + "\"; init_socket();'>";
		html += server.region + " " + server.name + " <span style='color: #85C76B'>[" + server.players + "]</span>";
		html += "</div>";
	});
	if (!html) html += "<div class='gamebutton mb5'>" + phrase.html("chat.game_offline") + "</div>";
	$(".serversuic").html(html);
	touch_startify();
}

var comm_chat = { chats: {}, active: null, characters: [], socket: null, open: true, list_loading: false, list_cursor: null, last_list: 0, last_pull: 0 };

function comm_chat_layout() {
	var nav = document.getElementById("bottom");
	var bottom = nav.offsetHeight ? Math.max(10, Math.ceil(window.innerHeight - nav.getBoundingClientRect().top + 8)) : 10;
	$("#comm-chat").css({ bottom: bottom + "px", maxHeight: "calc(100dvh - " + (bottom + 10) + "px)" });
}

function comm_chat_escape(value) {
	return html_escape(value).replace(/'/g, "&#39;");
}

function comm_chat_key(chat) {
	return chat.type == "server" ? "server:" + chat.server : chat.type == "new" ? "new" : "private:" + [chat.character.toLowerCase(), chat.to.toLowerCase()].sort().join(":");
}

function comm_chat_remember(chat) {
	var key = comm_chat_key(chat),
		saved = comm_chat.chats[key];
	if (!saved) saved = comm_chat.chats[key] = Object.assign({ key: key, messages: [], draft: "", loaded: false }, chat);
	else {
		if (chat.latest && (!saved.latest || chat.latest.date >= saved.latest.date)) saved.latest = chat.latest;
		if (chat.character) saved.character = chat.character;
		if (chat.to) saved.to = chat.to;
	}
	return saved;
}

function comm_chat_time(date, day) {
	var time = new Date(date);
	if (!Number.isFinite(time.getTime())) return "";
	if (day || time.toDateString() != new Date().toDateString()) return time.toLocaleDateString(phrase.language, { month: "short", day: "numeric" });
	return time.toLocaleTimeString(phrase.language, { hour: "2-digit", minute: "2-digit" });
}

function comm_chat_render_list() {
	var html = "";
	Object.values(comm_chat.chats)
		.filter(function (chat) {
			return chat.type != "new";
		})
		.sort(function (a, b) {
			return ((b.latest && b.latest.date) || "").localeCompare((a.latest && a.latest.date) || "") || a.key.localeCompare(b.key);
		})
		.forEach(function (chat) {
			var selected = chat === comm_chat.active,
				latest = chat.latest;
			var unread = latest && chat.seen && latest.date > chat.seen && !selected;
			html += "<button type='button' class='comm-chat-row " + (selected ? "active" : "") + "' data-chat='" + comm_chat_escape(chat.key) + "' aria-current='" + (selected ? "true" : "false") + "'>";
			html += "<span class='comm-chat-row-top'><span class='comm-chat-" + chat.type + "'>" + comm_chat_escape(chat.type == "server" ? server_to_ui(chat.server) : chat.to) + "</span>";
			if (latest) html += "<time datetime='" + comm_chat_escape(latest.date) + "'>" + comm_chat_escape(comm_chat_time(latest.date)) + "</time>";
			html +=
				"</span><span class='comm-chat-as'>" +
				(chat.type == "server" ? phrase.html("chat.server") : phrase.html("chat.sending_as", { character: chat.character })) +
				(unread ? " <span class='comm-chat-unread'>" + phrase.html("chat.unread") + "</span>" : "") +
				"</span>";
			html += "<span class='comm-chat-preview'>" + (latest ? comm_chat_escape(latest.fro + ": " + latest.message) : phrase.html("chat.empty_preview")) + "</span></button>";
			if (!chat.seen) chat.seen = latest ? latest.date : new Date().toISOString();
		});
	$("#comm-chat-list").html(html);
}

function comm_chat_sender() {
	var chat = comm_chat.active,
		selected = $("#comm-chat-from").val();
	if (!chat) return null;
	return comm_chat.characters.find(function (character) {
		return character.name.toLowerCase() == (selected || "").toLowerCase();
	});
}

function comm_chat_render_sender() {
	var chat = comm_chat.active;
	if (!chat) return;
	var selected = chat.type == "private" ? chat.character : chat.sender || (window.observing && observing.name),
		html = "";
	var available = comm_chat.characters.filter(function (character) {
		return character.online && (chat.type != "server" || character.server == chat.server);
	});
	if (
		chat.type != "private" &&
		!chat.sender &&
		!available.some(function (character) {
			return character.name == selected;
		})
	)
		selected = available.length ? available[0].name : "";
	if (chat.type != "private" && selected) chat.sender = selected;
	comm_chat.characters.forEach(function (character) {
		var allowed = character.online && (chat.type != "server" || character.server == chat.server);
		html +=
			"<option value='" +
			comm_chat_escape(character.name) +
			"'" +
			(!allowed && chat.type != "private" ? " disabled" : "") +
			">" +
			comm_chat_escape(character.online ? character.name + " · " + server_to_ui(character.server) : phrase("chat.character_offline", { character: character.name })) +
			"</option>";
	});
	if (
		!comm_chat.characters.some(function (character) {
			return character.name == selected;
		})
	)
		html = "<option value=''>" + comm_chat_escape(chat.type == "private" ? phrase("chat.character_unavailable", { character: chat.character }) : phrase("chat.no_character_online")) + "</option>" + html;
	$("#comm-chat-from")
		.html(html)
		.val(selected || "")
		.prop("disabled", chat.type == "private" || chat.sending || !user_id);
	comm_chat_update_composer();
}

function comm_chat_update_composer() {
	var chat = comm_chat.active,
		sender = comm_chat_sender();
	if (!chat) return;
	var allowed = !!(sender && sender.online && (chat.type != "server" || sender.server == chat.server));
	$("#comm-chat-form").toggleClass("hidden", !user_id);
	$("#comm-chat-input").prop("disabled", !allowed || !!chat.sending);
	$("#comm-chat-send").prop("disabled", !allowed || chat.sending || !$("#comm-chat-input").val().trim() || (chat.type == "new" && !$("#comm-chat-to").val().trim()));
	$("#comm-chat-to").prop("disabled", !!chat.sending);
	var status = !user_id ? phrase("chat.login_required") : chat.sending ? phrase("chat.sending") : chat.error || "";
	if (!status && !allowed)
		status =
			chat.type == "private"
				? phrase("chat.connect_to_reply", { character: chat.character })
				: chat.type == "server"
					? phrase("chat.connect_to_server", { server: server_to_ui(chat.server) })
					: phrase("chat.connect_for_private");
	$("#comm-chat-status").text(status);
}

function comm_chat_render_messages(older) {
	var chat = comm_chat.active;
	if (!chat) return;
	var history = $("#comm-chat-history")[0],
		height = history.scrollHeight,
		top = history.scrollTop;
	var bottom = height - top - history.clientHeight < 50,
		html = "",
		day = "";
	chat.messages
		.slice()
		.sort(function (a, b) {
			return a.date.localeCompare(b.date) || a.id.localeCompare(b.id);
		})
		.forEach(function (message) {
			var next_day = new Date(message.date).toDateString();
			if (next_day != day) {
				day = next_day;
				html += "<div class='comm-chat-date'>" + comm_chat_escape(comm_chat_time(message.date, true)) + "</div>";
			}
			var own = comm_chat.characters.some(function (character) {
				return character.name.toLowerCase() == message.fro.toLowerCase();
			});
			html +=
				"<div class='comm-chat-message" +
				(own ? " comm-chat-own" : "") +
				"'><button type='button' class='comm-chat-author' data-name='" +
				comm_chat_escape(message.fro) +
				"'>" +
				comm_chat_escape(message.fro) +
				"</button>";
			html +=
				"<time datetime='" +
				comm_chat_escape(message.date) +
				"' title='" +
				comm_chat_escape(new Date(message.date).toLocaleString(phrase.language)) +
				"'>" +
				comm_chat_escape(comm_chat_time(message.date)) +
				"</time><div" +
				(chat.type == "private" ? " class='comm-chat-private'" : "") +
				">" +
				comm_chat_escape(message.message) +
				"</div></div>";
		});
	if (!html) html = "<span class='gray'>" + (chat.type == "new" ? phrase.html("chat.enter_recipient") : chat.loaded ? phrase.html("chat.empty_conversation") : phrase.html("chat.loading")) + "</span>";
	$("#comm-chat-messages").html(html);
	$("#comm-chat-older").toggleClass("hidden", !chat.cursor).prop("disabled", !!chat.loading);
	if (older) history.scrollTop = top + history.scrollHeight - height;
	else if (bottom || chat.scroll_bottom) history.scrollTop = history.scrollHeight;
	chat.scroll_bottom = false;
	if (chat.latest) chat.seen = chat.latest.date;
}

function comm_chat_select(chat) {
	if (comm_chat.active) {
		comm_chat.active.draft = $("#comm-chat-input").val();
		comm_chat.active.sender = $("#comm-chat-from").val();
		if (comm_chat.active.type == "new") comm_chat.active.to = $("#comm-chat-to").val();
	}
	comm_chat.active = chat;
	chat.scroll_bottom = true;
	$("#comm-chat").removeClass("comm-chat-show-list");
	$("#comm-chat-title").text(chat.type == "server" ? phrase("chat.server_title", { server: server_to_ui(chat.server) }) : chat.type == "new" ? phrase("chat.new_private_message") : phrase("chat.private_title", { character: chat.to }));
	$("#comm-chat-recipient").toggleClass("hidden", chat.type != "new");
	$("#comm-chat-to").val(chat.to || "");
	$("#comm-chat-input").val(chat.draft);
	comm_chat_render_sender();
	comm_chat_render_messages();
	comm_chat_render_list();
	comm_chat_pull();
}

function toggle_comm_chat() {
	comm_chat.open = !comm_chat.open;
	$("#comm-chat").toggleClass("hidden", !comm_chat.open);
	$("#comm-chat-toggle").attr("aria-expanded", String(comm_chat.open));
	if (comm_chat.open) {
		comm_chat_pull();
		comm_chat_pull_list();
	}
}

function comm_chat_list() {
	$("#comm-chat").toggleClass("comm-chat-show-list");
}

function comm_chat_new(to) {
	if (!user_id) return;
	if (!comm_chat.open) toggle_comm_chat();
	var chat;
	if (to)
		chat = Object.values(comm_chat.chats)
			.filter(function (chat) {
				return chat.type == "private" && chat.to.toLowerCase() == to.toLowerCase();
			})
			.sort(function (a, b) {
				return ((b.latest && b.latest.date) || "").localeCompare((a.latest && a.latest.date) || "");
			})[0];
	if (!chat) {
		chat = comm_chat_remember({ type: "new" });
	}
	comm_chat_select(chat);
	if (chat.type == "new" && to) {
		chat.to = to;
		$("#comm-chat-to").val(to);
		comm_chat_update_composer();
	}
	$(chat.to ? "#comm-chat-input" : "#comm-chat-to").focus();
}

function comm_chat_error(error) {
	return (
		{
			not_logged_in: phrase("chat.error.not_logged_in"),
			not_owner: phrase("chat.error.not_owner"),
			character_not_in_game: phrase("chat.error.character_not_in_game"),
			wrong_server: phrase("chat.error.wrong_server"),
			server_not_found: phrase("chat.error.server_not_found"),
			character_not_found: phrase("chat.error.character_not_found"),
			message_self: phrase("chat.error.message_self"),
			muted: phrase("chat.error.muted"),
			banned: phrase("chat.error.banned"),
			chat_slowdown: phrase("chat.error.chat_slowdown"),
			invalid_name: phrase("chat.error.invalid_name"),
			invalid_message: phrase("chat.error.invalid_message"),
			chat_unavailable: phrase("chat.error.chat_unavailable"),
			timeout: phrase("chat.error.timeout"),
		}[error && error.reason] || phrase("chat.error.unreachable")
	);
}

function comm_chat_pull(older) {
	var chat = comm_chat.active;
	if (!chat || chat.type == "new" || chat.loading || (older && !chat.cursor)) return;
	chat.loading = true;
	comm_chat.last_pull = Date.now();
	var args = chat.type == "server" ? { server: chat.server } : { character: chat.character, to: chat.to };
	if (older) args.cursor = chat.cursor;
	$("#comm-chat-older").prop("disabled", true);
	api_call("pull_chat", args, { timeout: 8000 }).then(
		function (data) {
			if (
				!older &&
				chat.loaded &&
				data.more &&
				chat.messages.length &&
				!data.messages.some(function (message) {
					return chat.messages.some(function (saved) {
						return saved.id == message.id;
					});
				})
			) {
				// A long absence can exceed one page. Keep a continuous history, with
				// the missing interval reachable through OLDER MESSAGES.
				chat.messages = [];
				chat.cursor = data.cursor;
			}
			var ids = {};
			chat.messages.forEach(function (message) {
				ids[message.id] = message;
			});
			data.messages.forEach(function (message) {
				ids[message.id] = message;
			});
			chat.messages = Object.values(ids);
			if (older || !chat.loaded) chat.cursor = data.cursor;
			chat.loaded = true;
			chat.loading = false;
			if (data.messages.length && (!chat.latest || data.messages[0].date >= chat.latest.date)) chat.latest = data.messages[0];
			if (comm_chat.active === chat) comm_chat_render_messages(older);
			comm_chat_render_list();
		},
		function (error) {
			chat.loading = false;
			if (comm_chat.active === chat) {
				$("#comm-chat-status").text(phrase("chat.messages_load_failed", { error: comm_chat_error(error) }));
				$("#comm-chat-older").prop("disabled", false);
			}
		},
	);
}

function comm_chat_pull_list(older) {
	if (!user_id || comm_chat.list_loading || (older && !comm_chat.list_cursor)) return;
	comm_chat.list_loading = true;
	comm_chat.last_list = Date.now();
	$("#comm-chat-more").prop("disabled", true);
	api_call("pull_chats", older ? { cursor: comm_chat.list_cursor } : {}, { timeout: 10000 }).then(
		function (data) {
			comm_chat.list_loading = false;
			comm_chat.characters = data.characters;
			data.chats.forEach(comm_chat_remember);
			if (older || !comm_chat.list_loaded) comm_chat.list_cursor = data.cursor;
			comm_chat.list_loaded = true;
			$("#comm-chat-more").toggleClass("hidden", !comm_chat.list_cursor).prop("disabled", false);
			comm_chat_render_list();
			comm_chat_render_sender();
		},
		function (error) {
			comm_chat.list_loading = false;
			$("#comm-chat-more").prop("disabled", false);
			$("#comm-chat-status").text(phrase("chat.conversations_load_failed", { error: comm_chat_error(error) }));
		},
	);
}

function comm_chat_send(event) {
	event.preventDefault();
	var chat = comm_chat.active,
		sender = comm_chat_sender(),
		message = $("#comm-chat-input").val();
	if (!chat || chat.sending || !sender || !message.trim() || $("#comm-chat-send").prop("disabled")) return;
	var args = { character: sender.name, message: message };
	if (chat.type == "server") args.server = chat.server;
	else args.to = (chat.type == "new" ? $("#comm-chat-to").val() : chat.to).trim();
	chat.sending = true;
	chat.error = "";
	chat.draft = message;
	comm_chat_render_sender();
	api_call("send_message", args, { timeout: 8000 }).then(
		function () {
			chat.sending = false;
			chat.draft = "";
			var current = comm_chat.active === chat;
			if (current) $("#comm-chat-input").val("");
			if (chat.type == "new") {
				var saved = comm_chat_remember({ type: "private", character: sender.name, to: args.to });
				chat.to = "";
				if (current) comm_chat_select(saved);
				chat = saved;
			}
			chat.scroll_bottom = true;
			if (current) {
				comm_chat_render_sender();
				$("#comm-chat-input").focus();
			}
			// Native delivery is immediate; its history writes finish asynchronously.
			setTimeout(function () {
				if (comm_chat.active === chat) comm_chat_pull();
				comm_chat_pull_list();
			}, 250);
		},
		function (error) {
			chat.sending = false;
			chat.error = comm_chat_error(error);
			if (comm_chat.active === chat) comm_chat_render_sender();
		},
	);
}

function comm_chat_viewed_server(data) {
	var server = (X.servers || []).find(function (server) {
		return data ? server.region == data.region && server.name == data.name : server.address == server_address && server.path == server_path;
	});
	if (!server) return;
	var chat = comm_chat_remember({ type: "server", server: server.key });
	if (!comm_chat.active || comm_chat.active.type == "server") comm_chat_select(chat);
}

function comm_chat_bind_socket() {
	if (!window.socket || comm_chat.socket === window.socket) return;
	var connected = (comm_chat.socket = window.socket);
	connected.on("welcome", function (data) {
		if (window.socket === connected) comm_chat_viewed_server(data);
	});
	connected.on("chat_log", function () {
		if (window.socket !== connected || !comm_chat.open || document.hidden) return;
		clearTimeout(comm_chat.live_timer);
		comm_chat.live_timer = setTimeout(function () {
			comm_chat_pull();
		}, 200);
	});
	if (window.socket_welcomed) comm_chat_viewed_server({ region: server_region, name: server_identifier });
}

function init_comm_chat() {
	comm_chat_layout();
	window.addEventListener("resize", comm_chat_layout);
	if (window.ResizeObserver) {
		comm_chat.resize_observer = new ResizeObserver(comm_chat_layout);
		comm_chat.resize_observer.observe(document.getElementById("bottom"));
	}
	comm_chat.characters = (X.characters || []).map(function (character) {
		return { name: character.name, online: !!character.online, server: character.server };
	});
	(X.servers || []).forEach(function (server) {
		comm_chat_remember({ type: "server", server: server.key });
	});
	$("#comm-chat-form")
		.on("submit", comm_chat_send)
		.on("keydown keyup keypress", function (event) {
			event.stopPropagation();
			if (event.keyCode == 13 && (event.isComposing || (event.originalEvent && event.originalEvent.isComposing))) event.preventDefault();
		});
	$("#comm-chat-input, #comm-chat-to").on("input", function () {
		if (comm_chat.active) comm_chat.active.error = "";
		comm_chat_update_composer();
	});
	$("#comm-chat-from").on("change", function () {
		comm_chat.active.sender = $(this).val();
		comm_chat.active.error = "";
		comm_chat_update_composer();
	});
	$("#comm-chat-list").on("click", "[data-chat]", function () {
		comm_chat_select(comm_chat.chats[$(this).attr("data-chat")]);
	});
	$("#comm-chat-messages").on("click", "[data-name]", function () {
		comm_chat_new($(this).attr("data-name"));
	});
	comm_chat_viewed_server();
	if (!comm_chat.active) {
		$("#comm-chat-title").text(phrase.html("chat.server"));
		$("#comm-chat-messages").text(phrase("chat.no_live_server"));
		$("#comm-chat-form").addClass("hidden");
	}
	comm_chat_render_list();
	comm_chat_pull_list();
	setInterval(function () {
		comm_chat_bind_socket();
		if (!comm_chat.open || document.hidden) return;
		if (Date.now() - comm_chat.last_pull >= 5000) comm_chat_pull();
		if (Date.now() - comm_chat.last_list >= 15000) comm_chat_pull_list();
	}, 1000);
}
