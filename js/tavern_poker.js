// Tavern Hold'em client: the interactive table on the Tavern floor and the centered overlay. The server owns every
// card and every decision; this file shows the state packets it sends and turns clicks into requests. Seat and hand
// state live outside the overlay, so closing it, walking to a stool or a late packet never loses the table.
// Everything here returns early without graphics or HTML.
var tavern_poker = { state: null, cards: null, cards_n: 0, shown: 0, timer: null, join: -1, walking: null, textures: {}, base: null, base_ready: false };
var tavern_poker_sheet = "/images/cards/poker.png?v=1",
	tavern_poker_card_w = 32,
	tavern_poker_card_h = 44,
	tavern_poker_positions = { 0: "front-l", 1: "front-c", 2: "front-r", 3: "side-l", 4: "side-r" },
	tavern_poker_floor = [
		[-40, -33],
		[-8, -33],
		[24, -33],
		[-35, -49],
		[18, -49],
	];

function poker_definition() {
	return G.games && G.games.poker;
}

function poker_state() {
	return tavern_poker.state;
}

function poker_me() {
	var state = poker_state();
	if (!state || !character) return null;
	for (var i = 0; i < state.seats.length; i++) if (state.seats[i] && state.seats[i].name == character.name) return state.seats[i];
	return null;
}

// Where a card sits on the deck sheet: rank by column, suit by row, the back at the start of the fifth row.
function poker_card_xy(card) {
	var def = poker_definition();
	if (!card || !def) return [0, 4];
	var parts = card.split("_"),
		column = def.ranks.indexOf(parts[0]),
		row = def.suits.indexOf(parts[1]);
	if (column < 0 || row < 0) return [0, 4];
	return [column, row];
}

function poker_card_html(card, big) {
	var xy = poker_card_xy(card),
		scale = big ? 2 : 1;
	return (
		"<span class='pk-card" +
		(big ? " pk-big" : "") +
		(card ? "" : " pk-back") +
		"' style='background-position: " +
		-xy[0] * tavern_poker_card_w * scale +
		"px " +
		-xy[1] * tavern_poker_card_h * scale +
		"px'></span>"
	);
}

function poker_pretty(gold) {
	return to_pretty_num(gold);
}

function poker_hand_name(key) {
	return key ? phrase.html("interface.poker.hand." + key) : "";
}

function poker_open() {
	if (no_graphics || no_html || typeof $ != "function") return false;
	return $(".pk").length > 0;
}

// The overlay, centered by the modal helper. Re-rendered in place on every packet while it is open.
function render_poker() {
	if (no_graphics || no_html || !poker_definition()) return;
	if (current_map != "tavern") return;
	if (!poker_open()) {
		show_modal(poker_css() + poker_html(), { wrap: false, opacity: 0.55 });
		if (!tavern_poker.timer) tavern_poker.timer = setInterval(poker_clock, 250);
	}
	socket.emit("poker", { event: "info" });
}

function poker_refresh() {
	if (no_graphics || no_html || !poker_open()) return;
	$(".pk").replaceWith(poker_html());
	poker_clock();
}

function poker_closed() {
	if (tavern_poker.timer) clearInterval(tavern_poker.timer);
	tavern_poker.timer = null;
	tavern_poker.join = -1;
}

function poker_css() {
	return (
		"<style>" +
		".pk{position:relative;width:900px;height:724px;background:#14110F;border:5px solid gray;color:white;font-size:22px;line-height:24px;text-align:left;user-select:none}" +
		".pk-table{position:absolute;left:180px;top:70px;width:540px;height:290px;border-radius:160px/90px;background:#2F6B3C;box-shadow:inset 0 0 0 6px #9D5F3E,inset 0 0 0 9px #6D3D4B}" +
		".pk-ring{position:absolute;left:60px;top:40px;right:60px;bottom:40px;border-radius:120px/60px;border:2px solid #3C8049}" +
		".pk-pot{position:absolute;left:0;right:0;top:96px;text-align:center;color:#FFD888;font-size:26px}.pk-street{color:#9BE29B;font-size:18px}" +
		".pk-board{position:absolute;left:50%;top:146px;transform:translateX(-50%);display:flex;gap:6px;height:88px}" +
		".pk-card{display:inline-block;width:32px;height:44px;background-image:url(" +
		(window.url_factory ? url_factory(tavern_poker_sheet) : tavern_poker_sheet) +
		");background-size:416px 220px;image-rendering:pixelated;image-rendering:crisp-edges;margin-right:2px;vertical-align:top}" +
		".pk-card.pk-big{width:64px;height:88px;background-size:832px 440px;margin:0}.pk-board .pk-slot{width:64px;height:88px;border:2px dashed #3C8049;box-sizing:border-box}" +
		".pk-seat{position:absolute;width:190px;min-height:124px;background:black;border:4px solid gray;padding:6px 8px;text-align:center;box-sizing:border-box}" +
		".pk-active{border-color:#FFE737}.pk-folded{opacity:.5}.pk-winner{border-color:#FFD888;box-shadow:0 0 0 3px #7A5A10}.pk-empty{border-style:dashed}.pk-me{border-color:#6DB7B8}.pk-me.pk-active{border-color:#FFE737}" +
		".pk-front-l{left:112px;top:378px}.pk-front-c{left:355px;top:378px}.pk-front-r{left:598px;top:378px}.pk-side-l{left:8px;top:186px}.pk-side-r{left:702px;top:186px}" +
		".pk-name{color:#E6B16B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pk-dealer{display:inline-block;background:#FFE737;color:black;padding:0 6px;font-size:18px;margin-left:4px}.pk-stack{color:#FFD888}" +
		".pk-hand{height:48px;margin:4px 0}.pk-hand.pk-mine{height:92px}" +
		".pk-bet{position:absolute;left:50%;top:-36px;transform:translateX(-50%);background:#24552F;border:3px solid #9D5F3E;padding:0 8px;color:#FFE737;white-space:nowrap;font-size:20px}" +
		".pk-side-l .pk-bet{left:auto;right:-124px;top:24px;transform:none}.pk-side-r .pk-bet{left:-124px;top:24px;transform:none}" +
		".pk-status{color:#9BE29B;font-size:18px;min-height:20px}.pk-status.gray{color:gray}.pk-timer{height:6px;background:#333;margin-top:4px}.pk-timer i{display:block;height:6px;background:#FFE737}.pk-timer.pk-bank i{background:#FF7500}" +
		".pk-actions{position:absolute;left:0;right:0;bottom:10px;height:104px;text-align:center}.pk-actions .gamebutton{margin:0 4px;min-width:118px;display:inline-block;vertical-align:top}.pk-actions.gray{padding-top:36px}" +
		".pk-raise{display:inline-block;vertical-align:top;border:4px solid gray;background:black;padding:6px 10px;margin-top:8px}.pk-raise .gamebutton{min-width:64px;padding:6px;font-size:20px;margin:0 2px}" +
		".pk-raise input{width:150px;background:#111;border:3px solid gray;color:#FFD888;font-size:20px;padding:4px 6px;font-family:inherit;text-align:right;vertical-align:top;margin:0 4px}" +
		".pk-log{position:absolute;left:12px;top:10px;color:gray;font-size:18px;line-height:20px;text-align:left;width:230px}.pk-info{position:absolute;right:12px;top:10px;color:gray;font-size:18px;text-align:right}" +
		".pk-tools{position:absolute;right:8px;top:92px;text-align:right}.pk-tools .gamebutton{font-size:18px;padding:6px 10px;display:block;margin-bottom:6px}" +
		".pk-join{margin-top:8px;font-size:18px;padding:6px}.pk-buyin input{width:130px;background:#111;border:3px solid gray;color:#FFD888;font-size:18px;padding:3px 6px;font-family:inherit;text-align:right;margin:6px 0}" +
		".pk-hint{color:gray;font-size:16px;line-height:18px}.pk-title{position:absolute;left:0;right:0;top:34px;text-align:center;color:#E6B16B;font-size:24px}" +
		"</style>"
	);
}

function poker_log_html(entry) {
	var p = { name: entry.name, amount: poker_pretty(entry.g || 0), n: entry.n };
	if (entry.t == "act") {
		if (entry.a == "fold") return phrase.html("interface.poker.log.fold", p);
		if (entry.a == "check") return phrase.html("interface.poker.log.check", p);
		if (entry.a == "call") return phrase.html("interface.poker.log.call", p);
		if (entry.a == "raise") return phrase.html("interface.poker.log.raise", p);
		if (entry.a == "allin") return phrase.html("interface.poker.log.allin", p);
		return phrase.html("interface.poker.log.bet", p);
	}
	if (entry.t == "win") return entry.h ? phrase.html("interface.poker.log.win_with", Object.assign({ hand: phrase("interface.poker.hand." + entry.h) }, p)) : phrase.html("interface.poker.log.win", p);
	if (entry.t == "deal") return phrase.html("interface.poker.log.deal", p);
	if (entry.t == "join") return phrase.html("interface.poker.log.join", p);
	if (entry.t == "leave") return phrase.html("interface.poker.log.leave", p);
	if (entry.t == "out") return phrase.html("interface.poker.log.out", p);
	if (entry.t == "in") return phrase.html("interface.poker.log.in", p);
	if (entry.t == "dc") return phrase.html("interface.poker.log.dc", p);
	if (entry.t == "back") return phrase.html("interface.poker.log.back", p);
	if (entry.t == "void") return phrase.html("interface.poker.log.void");
	return "";
}

function poker_seat_html(seat, index) {
	var state = poker_state(),
		hand = state.hand,
		me = poker_me(),
		live = hand && !hand.over,
		mine = seat && me && seat.index == me.index,
		classes = "pk-seat pk-" + tavern_poker_positions[index];
	if (!seat) {
		var html = "<div class='" + classes + " pk-empty'><div class='pk-name gray'>" + phrase.html("interface.poker.empty_seat") + "</div>";
		if (!me) {
			if (tavern_poker.join == index) {
				var suggested = Math.max(state.buyin[0], Math.min(state.buyin[1], character.gold || 0));
				html +=
					"<div class='pk-buyin'><input type='text' class='pk-buyin-gold' value='" +
					poker_pretty(suggested) +
					"' onkeydown='if(event.keyCode==13) poker_buy(" +
					index +
					")'><div class='pk-hint'>" +
					phrase.html("interface.poker.buyin_hint", { min: poker_pretty(state.buyin[0]), max: poker_pretty(state.buyin[1]) }) +
					"</div><div class='gamebutton clickable pk-join' onclick='poker_buy(" +
					index +
					")'>" +
					phrase.html("interface.poker.buy_in") +
					"</div></div>";
			} else html += "<div class='gamebutton clickable pk-join' onclick='poker_pick(" + index + ")'>" + phrase.html("interface.poker.join") + "</div>";
		}
		return html + "</div>";
	}
	if (live && hand.acting == seat.index) classes += " pk-active";
	if (live && seat.folded) classes += " pk-folded";
	if (hand && hand.over && hand.results && hand.results.winners[seat.index]) classes += " pk-winner";
	if (mine) classes += " pk-me";
	var cards = "";
	if (mine && tavern_poker.cards && hand && tavern_poker.cards_n == hand.n && seat.cards) cards = poker_card_html(tavern_poker.cards[0], true) + poker_card_html(tavern_poker.cards[1], true);
	else if (seat.shown) cards = poker_card_html(seat.shown[0]) + poker_card_html(seat.shown[1]);
	else if (seat.cards && (!hand || !hand.over || !seat.folded)) cards = poker_card_html(null) + poker_card_html(null);
	var status = "",
		gray = false;
	if (hand && hand.over && hand.results && hand.results.winners[seat.index]) {
		var hand_name = hand.results.hands[seat.index];
		status =
			"<span class='gold'>" +
			(hand_name
				? phrase.html("interface.poker.wins_with", { amount: poker_pretty(hand.results.winners[seat.index]), hand: phrase("interface.poker.hand." + hand_name) })
				: phrase.html("interface.poker.wins", { amount: poker_pretty(hand.results.winners[seat.index]) })) +
			"</span>";
	} else if (live && seat.folded) ((status = phrase.html("interface.poker.folded")), (gray = true));
	else if (live && seat.allin) status = phrase.html("interface.poker.all_in_status");
	else if (seat.dc) ((status = phrase.html("interface.poker.disconnected")), (gray = true));
	else if (seat.leaving) ((status = phrase.html("interface.poker.leaving")), (gray = true));
	else if (seat.out) ((status = phrase.html("interface.poker.sitting_out")), (gray = true));
	else if (live && hand.acting == seat.index) status = mine ? "<span class='pk-turn'>" + phrase.html("interface.poker.your_turn") + "</span>" : phrase.html("interface.poker.thinking");
	var timer = live && hand.acting == seat.index ? "<div class='pk-timer" + (hand.banked ? " pk-bank" : "") + "'><i style='width: 100%'></i></div>" : "";
	return (
		"<div class='" +
		classes +
		"'><div class='pk-name'>" +
		seat.name +
		(state.button === seat.index ? "<span class='pk-dealer'>D</span>" : "") +
		"</div><div class='pk-stack'>" +
		poker_pretty(seat.stack) +
		"</div><div class='pk-hand" +
		(mine && cards.indexOf("pk-big") != -1 ? " pk-mine" : "") +
		"'>" +
		cards +
		"</div>" +
		(seat.bet ? "<div class='pk-bet'>" + poker_pretty(seat.bet) + "</div>" : "") +
		timer +
		"<div class='pk-status" +
		(gray ? " gray" : "") +
		"'>" +
		status +
		"</div></div>"
	);
}

function poker_actions_html() {
	var state = poker_state(),
		hand = state.hand,
		me = poker_me();
	if (!me) return "<div class='pk-actions gray'>" + phrase.html("interface.poker.take_a_seat", { min: poker_pretty(state.buyin[0]), max: poker_pretty(state.buyin[1]) }) + "</div>";
	if (!hand || hand.over || hand.acting != me.index) {
		var text;
		if (hand && !hand.over && hand.acting >= 0 && state.seats[hand.acting]) text = phrase.html("interface.poker.waiting_for", { name: state.seats[hand.acting].name });
		else if (me.out) text = phrase.html("interface.poker.sitting_out_hint");
		else text = "<span class='pk-next'>" + phrase.html("interface.poker.next_hand") + "</span>";
		return "<div class='pk-actions gray'>" + text + "</div>";
	}
	var to_call = hand.bet - me.bet,
		max = me.bet + me.stack,
		min_raise = Math.min(max, hand.bet + hand.min_raise),
		half = Math.min(max, Math.max(min_raise, Math.floor((hand.pot + to_call) / 2 / state.blinds[1]) * state.blinds[1] + hand.bet)),
		pot = Math.min(max, Math.max(min_raise, Math.floor((hand.pot + to_call) / state.blinds[1]) * state.blinds[1] + hand.bet)),
		html = "<div class='pk-actions'>";
	html += "<div><div class='gamebutton clickable pk-fold' style='border-color: #E05A4A' onclick='poker_action(\"fold\")'>" + phrase.html("interface.poker.fold") + "</div>";
	if (to_call > 0)
		html +=
			"<div class='gamebutton clickable pk-call' style='border-color: #A7C16D' onclick='poker_action(\"call\")'>" +
			phrase.html("interface.poker.call", { amount: poker_pretty(Math.min(to_call, me.stack)) }) +
			"</div>";
	else html += "<div class='gamebutton clickable pk-call' style='border-color: #A7C16D' onclick='poker_action(\"check\")'>" + phrase.html("interface.poker.check") + "</div>";
	html += "<div class='gamebutton clickable pk-allin' style='border-color: #FFE737' onclick='poker_action(\"allin\")'>" + phrase.html("interface.poker.all_in") + "</div></div>";
	html += "<div class='pk-raise'><span class='gray'>" + phrase.html(hand.bet ? "interface.poker.raise_to" : "interface.poker.bet") + "</span> ";
	html += "<input type='text' class='pk-amount' value='" + poker_pretty(min_raise) + "' onkeydown='if(event.keyCode==13) poker_raise()'>";
	html += "<div class='gamebutton clickable pk-min' onclick='poker_action(\"raise\"," + min_raise + ")'>" + phrase.html("interface.poker.min") + "</div>";
	html += "<div class='gamebutton clickable pk-half' onclick='poker_action(\"raise\"," + half + ")'>" + phrase.html("interface.poker.half_pot") + "</div>";
	html += "<div class='gamebutton clickable pk-pot' onclick='poker_action(\"raise\"," + pot + ")'>" + phrase.html("interface.poker.pot") + "</div>";
	html += "<div class='gamebutton clickable pk-go' onclick='poker_raise()'>" + phrase.html("interface.poker.raise") + "</div></div></div>";
	return html;
}

function poker_html() {
	var state = poker_state();
	if (!state) return "<div class='pk'><div class='pk-title'>" + phrase.html("interface.poker.title") + "</div><div class='pk-actions gray'>" + phrase.html("interface.poker.loading") + "</div></div>";
	var hand = state.hand,
		me = poker_me(),
		board = "";
	for (var i = 0; i < 5; i++) board += hand && hand.board[i] ? poker_card_html(hand.board[i], true) : "<span class='pk-slot'></span>";
	var html = "<div class='pk'>";
	html +=
		"<div class='pk-log'>" +
		state.log
			.slice()
			.reverse()
			.map(function (entry) {
				return "<div>" + poker_log_html(entry) + "</div>";
			})
			.join("") +
		"</div>";
	html += "<div class='pk-title'>" + phrase.html("interface.poker.title") + "</div>";
	html +=
		"<div class='pk-info'>" +
		phrase.html("interface.poker.blinds", { small: poker_pretty(state.blinds[0]), big: poker_pretty(state.blinds[1]) }) +
		"<br>" +
		phrase.html("interface.poker.buyin", { min: poker_pretty(state.buyin[0]), max: poker_pretty(state.buyin[1]) }) +
		"<br>" +
		phrase.html("interface.poker.rake", { rake: "" + state.rake, cap: poker_pretty(state.rake_cap) }) +
		"</div>";
	if (me) {
		html += "<div class='pk-tools'>";
		if (!me.leaving)
			html +=
				"<div class='gamebutton clickable pk-leave' onclick='poker_stand()'>" + phrase.html(hand && !hand.over && !me.folded ? "interface.poker.leave_after_hand" : "interface.poker.leave") + "</div>";
		if (!me.leaving)
			html +=
				"<div class='gamebutton clickable pk-sit' onclick='poker_sit(" + (me.out ? "false" : "true") + ")'>" + phrase.html(me.out ? "interface.poker.sit_in" : "interface.poker.sit_out") + "</div>";
		html += "</div>";
	}
	html +=
		"<div class='pk-table'><div class='pk-ring'></div><div class='pk-pot'>" +
		(hand
			? phrase.html("interface.poker.pot_label", { amount: poker_pretty(hand.pot) }) + " <span class='pk-street'>" + phrase.html("interface.poker.street." + hand.street) + "</span>"
			: phrase.html("interface.poker.waiting_players")) +
		"</div><div class='pk-board'>" +
		board +
		"</div></div>";
	for (var i = 0; i < state.seats.length; i++) html += poker_seat_html(state.seats[i], i);
	html += poker_actions_html();
	return html + "</div>";
}

// Clock: the timer bar of whoever is acting and the countdown to the next deal, without re-rendering the overlay.
function poker_clock() {
	if (!poker_open()) return poker_closed();
	var state = poker_state();
	if (!state) return;
	var hand = state.hand,
		now = Date.now() - (tavern_poker.skew || 0);
	if (hand && !hand.over && hand.acting >= 0) {
		var total = hand.banked ? state.bank_ms : state.action_ms,
			left = Math.max(0, hand.deadline - now),
			me = poker_me();
		$(".pk-timer i").css("width", Math.max(0, Math.min(100, (left / total) * 100)) + "%");
		if (me && hand.acting == me.index) {
			var seconds = Math.ceil(left / 1000);
			$(".pk-turn").html(phrase.html("interface.poker.your_turn_seconds", { seconds: "" + seconds }));
			if (seconds <= 5 && seconds != tavern_poker.ticked) ((tavern_poker.ticked = seconds), wheel_sound("tick"));
		}
	}
	var next = $(".pk-next");
	if (next.length && state.next_at) next.html(phrase.html("interface.poker.next_hand_seconds", { seconds: "" + Math.max(0, Math.ceil((state.next_at - now) / 1000)) }));
}

// Requests.
function poker_pick(index) {
	tavern_poker.join = index;
	poker_refresh();
	setTimeout(function () {
		$(".pk-buyin-gold").focus().select();
	}, 50);
}

function poker_buy(index) {
	var gold = parseInt(("" + $(".pk-buyin-gold").val()).replace(/[^0-9]/g, "")) || 0;
	socket.emit("poker", { event: "join", seat: index, gold: gold });
}

function poker_action(action, amount) {
	socket.emit("poker", { event: "act", action: action, amount: amount });
}

function poker_raise() {
	var amount = parseInt(("" + $(".pk-amount").val()).replace(/[^0-9]/g, "")) || 0;
	poker_action("raise", amount);
}

function poker_stand() {
	socket.emit("poker", { event: "leave" });
}

function poker_sit(out) {
	socket.emit("poker", { event: out ? "sit_out" : "sit_in" });
}

// Replies to our own requests. A seat taken starts the walk to its stool.
function poker_response(data) {
	if (data.failed) {
		var id = "response." + data.response,
			params = { min: poker_pretty(data.min || 0), max: poker_pretty(data.max || 0) };
		if (phrase.has(id)) ui_log(phrase.html(id, params), "gray");
		return;
	}
	if (data.seat !== undefined && data.buyin && !no_graphics) {
		tavern_poker.join = -1;
		poker_walk(data.seat);
	}
}

// Packets for the whole room: the public state and our own hole cards.
function poker_event(data) {
	if (!data) return;
	if (data.event == "cards") {
		tavern_poker.cards = data.cards;
		tavern_poker.cards_n = data.n;
		if (!no_graphics) poker_refresh();
		return;
	}
	if (data.event != "state") return;
	var previous = tavern_poker.state;
	tavern_poker.state = data;
	tavern_poker.skew = Date.now() - data.now;
	data.next_at = Date.now() + data.next;
	if (typeof call_code_function == "function") call_code_function("trigger_event", "poker", data);
	if (no_graphics) return;
	var hand = data.hand,
		me = poker_me();
	if (hand && (!previous || !previous.hand || previous.hand.n != hand.n || previous.hand.street != hand.street) && !hand.over) wheel_sound("drop");
	if (hand && !hand.over && me && hand.acting == me.index && (!previous || !previous.hand || previous.hand.acting != me.index || previous.hand.n != hand.n)) wheel_sound("open");
	if (hand && hand.over && hand.results && tavern_poker.shown != hand.n) {
		tavern_poker.shown = hand.n;
		for (var index in hand.results.winners) {
			var seat = data.seats[index],
				entity = seat && get_entity(seat.name),
				gold = hand.results.winners[index];
			if (!entity || !gold) continue;
			d_text("+" + poker_pretty(gold), entity, { color: "gold" });
			if (entity.me) wheel_sound("coins");
			if (gold >= data.blinds[1] * 100) confetti_shower(entity, 2);
			else if (gold >= data.blinds[1] * 30) confetti_shower(entity, 1);
		}
	}
	poker_map_show();
	poker_refresh();
}

// Walk to the stool through the game's own movement, around the table top, then reopen the overlay on arrival.
function poker_blocked() {
	var state = poker_state(),
		block = poker_definition().block;
	return { x1: state.x + block[0] - 14, y1: state.y + block[1] - 6, x2: state.x + block[2] + 14, y2: state.y + block[3] + 6 };
}

// Whether the segment from a to b passes through the rectangle (Liang-Barsky clipping).
function poker_crosses(ax, ay, bx, by, r) {
	var dx = bx - ax,
		dy = by - ay,
		t0 = 0,
		t1 = 1,
		p = [-dx, dx, -dy, dy],
		q = [ax - r.x1, r.x2 - ax, ay - r.y1, r.y2 - ay];
	for (var i = 0; i < 4; i++) {
		if (p[i] == 0) {
			if (q[i] < 0) return false;
			continue;
		}
		var t = q[i] / p[i];
		if (p[i] < 0) {
			if (t > t1) return false;
			if (t > t0) t0 = t;
		} else {
			if (t < t0) return false;
			if (t < t1) t1 = t;
		}
	}
	return t0 <= t1;
}

function poker_route(sx, sy, tx, ty) {
	var r = poker_blocked(),
		corners = [
			[r.x1 - 1, r.y1 - 1],
			[r.x2 + 1, r.y1 - 1],
			[r.x2 + 1, r.y2 + 1],
			[r.x1 - 1, r.y2 + 1],
		];
	function clear(a, b) {
		return !poker_crosses(a[0], a[1], b[0], b[1], r);
	}
	if (clear([sx, sy], [tx, ty])) return [[tx, ty]];
	for (var i = 0; i < 4; i++) if (clear([sx, sy], corners[i]) && clear(corners[i], [tx, ty])) return [corners[i], [tx, ty]];
	for (var i = 0; i < 4; i++)
		for (var k = 1; k < 4; k += 2) {
			var c1 = corners[i],
				c2 = corners[(i + k) % 4];
			if (clear([sx, sy], c1) && clear(c2, [tx, ty])) return [c1, c2, [tx, ty]];
		}
	return [[tx, ty]];
}

function poker_walk_to(x, y) {
	var move = calculate_move(character, x, y);
	character.from_x = character.real_x;
	character.from_y = character.real_y;
	character.going_x = move.x;
	character.going_y = move.y;
	character.moving = true;
	calculate_vxy(character);
	socket.emit("move", { x: character.real_x, y: character.real_y, going_x: character.going_x, going_y: character.going_y, m: character.m });
}

function poker_walk(index) {
	var state = poker_state(),
		def = poker_definition();
	if (!state || !def || !character || !can_walk(character)) return;
	var stool = def.stools[index],
		legs = poker_route(character.real_x, character.real_y, state.x + stool[0], state.y + stool[1]),
		started = Date.now();
	try {
		hide_modal();
	} catch (e) {}
	poker_walk_to(legs[0][0], legs[0][1]);
	legs.shift();
	if (tavern_poker.walking) clearInterval(tavern_poker.walking);
	tavern_poker.walking = setInterval(function () {
		var late = Date.now() - started > 12000;
		if (character.moving && !late) return;
		if (legs.length && !late && can_walk(character)) {
			var leg = legs.shift();
			poker_walk_to(leg[0], leg[1]);
			return;
		}
		clearInterval(tavern_poker.walking);
		tavern_poker.walking = null;
		if (current_map == "tavern") render_poker();
	}, 150);
}

// The table on the Tavern floor: tiny cards on the felt for everyone in view, the dealer button and a blink for the
// seat whose turn it is. Textures come from the deck sheet once it has loaded.
var tavern_poker_map = { sprite: null, board: null, seats: null, button: null };

function poker_texture(card) {
	var key = card || "back";
	if (tavern_poker.textures[key]) return tavern_poker.textures[key];
	if (!tavern_poker.base) {
		tavern_poker.base = PIXI.BaseTexture.fromImage(window.url_factory ? url_factory(tavern_poker_sheet) : tavern_poker_sheet, undefined, PIXI.SCALE_MODES.NEAREST);
		tavern_poker.base.on("loaded", function () {
			tavern_poker.base_ready = true;
			poker_map_show();
		});
		if (tavern_poker.base.hasLoaded) tavern_poker.base_ready = true;
	}
	if (!tavern_poker.base_ready) return null;
	var xy = poker_card_xy(card),
		texture = new PIXI.Texture(tavern_poker.base, new PIXI.Rectangle(xy[0] * tavern_poker_card_w, xy[1] * tavern_poker_card_h, tavern_poker_card_w, tavern_poker_card_h));
	tavern_poker.textures[key] = texture;
	return texture;
}

function poker_map_attach(sprite) {
	if (no_graphics || typeof PIXI == "undefined" || !poker_definition()) return;
	var seats = [],
		board = [];
	for (var i = 0; i < 5; i++) {
		var pair = [];
		for (var k = 0; k < 2; k++) {
			var card = new PIXI.Sprite(PIXI.Texture.EMPTY);
			card.scale.set(0.25, 0.25);
			card.x = tavern_poker_floor[i][0] + k * 9;
			card.y = tavern_poker_floor[i][1];
			card.visible = false;
			sprite.addChild(card);
			pair.push(card);
		}
		seats.push(pair);
		var community = new PIXI.Sprite(PIXI.Texture.EMPTY);
		community.scale.set(0.25, 0.25);
		community.x = -22 + i * 9;
		community.y = -43;
		community.visible = false;
		sprite.addChild(community);
		board.push(community);
	}
	var button = new PIXI.Graphics();
	button.beginFill(0x6d3d4b);
	button.drawRect(0, 0, 5, 5);
	button.endFill();
	button.beginFill(0xffe737);
	button.drawRect(1, 1, 3, 3);
	button.endFill();
	button.visible = false;
	sprite.addChild(button);
	sprite
		.on("mouseover", function () {
			sprite.tint = 0xffe9b0;
		})
		.on("mouseout", function () {
			sprite.tint = 0xffffff;
		});
	tavern_poker_map = { sprite: sprite, board: board, seats: seats, button: button };
	poker_texture(null);
	poker_map_show();
}

function poker_map_show() {
	var m = tavern_poker_map,
		state = poker_state();
	if (no_graphics || !m.sprite || m.sprite._destroyed) return;
	var hand = state && state.hand;
	for (var i = 0; i < 5; i++) {
		var seat = state && state.seats[i],
			pair = m.seats[i],
			show = !!(seat && hand && seat.cards && !(hand.over && seat.folded));
		for (var k = 0; k < 2; k++) {
			var texture = show ? poker_texture(seat.shown ? seat.shown[k] : null) : null;
			pair[k].visible = !!texture;
			if (texture) pair[k].texture = texture;
			pair[k].alpha = seat && seat.folded ? 0.45 : 1;
		}
		var community = m.board[i],
			card = hand && hand.board[i],
			ctexture = card ? poker_texture(card) : null;
		community.visible = !!ctexture;
		if (ctexture) community.texture = ctexture;
	}
	var button_seat = state && state.button >= 0 && state.seats[state.button];
	m.button.visible = !!button_seat;
	if (button_seat) {
		m.button.x = tavern_poker_floor[state.button][0] - 7;
		m.button.y = tavern_poker_floor[state.button][1] + 3;
	}
}

function poker_map_update(sprite) {
	var m = tavern_poker_map,
		state = poker_state();
	if (no_graphics || !m.sprite || m.sprite != sprite || !state) return;
	var hand = state.hand,
		blink = hand && !hand.over && hand.acting >= 0 ? Math.floor(performance.now() / 350) % 2 == 0 : false;
	for (var i = 0; i < 5; i++) {
		var pair = m.seats[i],
			active = hand && !hand.over && hand.acting == i;
		for (var k = 0; k < 2; k++) pair[k].tint = active && blink ? 0xffe737 : 0xffffff;
	}
}
