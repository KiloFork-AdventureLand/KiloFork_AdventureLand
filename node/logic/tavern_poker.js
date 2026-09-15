// Shared server scope. Tavern Hold'em: one five-seat no-limit table in the Tavern. Player gold plays against player
// gold and the house keeps only the rake of each awarded pot. A buy-in leaves the purse at once and lives on the seat,
// mirrored into player.p.poker so a lost server or a stale seat can always be refunded; tavern_poker_cash_out is the
// only way back to the purse. Blinds follow the server tier, decided once at startup. The table is ticked once a second
// from tavern_loop; every decision has a clock, a personal time bank and an automatic check-or-fold at the end.
function tavern_poker_definition() {
	return G.games && G.games.poker;
}

function tavern_poker_now() {
	return Date.now();
}

function tavern_poker_tier() {
	var def = tavern_poker_definition();
	if (is_pvp || !def.blinds[server_name]) return "IV";
	return server_name;
}

function tavern_poker_blinds() {
	return tavern_poker_definition().blinds[tavern_poker_tier()];
}

function tavern_poker_machine() {
	var machines = (G.maps.tavern && G.maps.tavern.machines) || [];
	for (var i = 0; i < machines.length; i++) if (machines[i].type == "poker") return machines[i];
	return { x: -168, y: -30 };
}

function tavern_poker_table() {
	if (!tavern.poker) tavern.poker = { rooms: [], gain: 0 };
	if (!tavern.poker.table)
		tavern.poker.table = { seats: [null, null, null, null, null], button: -1, hand: null, hands: 0, next: 0, log: [] };
	return tavern.poker.table;
}

function tavern_poker_seat_of(player) {
	return tavern_poker_seat_by_id(player && player.real_id);
}

function tavern_poker_seat_by_id(id) {
	var seats = tavern_poker_table().seats;
	for (var i = 0; i < seats.length; i++) if (seats[i] && seats[i].id == id) return seats[i];
	return null;
}

function tavern_poker_occupied() {
	return tavern_poker_table().seats.filter(function (seat) {
		return seat;
	});
}

function tavern_poker_ready() {
	return tavern_poker_occupied().filter(function (seat) {
		return !seat.out && seat.stack > 0;
	});
}

function tavern_poker_live(hand) {
	return hand.entries.filter(function (seat) {
		return !seat.folded;
	});
}

// A seat stays at the table until the hand it was dealt into is over, even after folding, so the chips it put in
// the pots always have an owner.
function tavern_poker_in_hand(seat) {
	var hand = tavern_poker_table().hand;
	return !!(hand && !hand.over && hand.entries.indexOf(seat) != -1);
}

// The next seat index after "from", clockwise through the seats in "candidates".
function tavern_poker_next_index(from, candidates) {
	var count = tavern_poker_definition().seats;
	for (var k = 1; k <= count; k++) {
		var index = (from + k) % count;
		for (var i = 0; i < candidates.length; i++) if (candidates[i].index == index) return index;
	}
	return -1;
}

function tavern_poker_stool(seat) {
	var machine = tavern_poker_machine(),
		stool = tavern_poker_definition().stools[seat.index];
	return { x: machine.x + stool[0], y: machine.y + stool[1] };
}

function tavern_poker_far(player, x, y, limit) {
	if (player.map != "tavern" || player.in != "tavern") return true;
	var dx = player.x - x,
		dy = player.y - y;
	return dx * dx + dy * dy > limit * limit;
}

// Escrow mirror: the seat's stack is written into the character's saved data whenever it changes, so a refund after
// a crash returns what the seat held at the last save.
function tavern_poker_mirror(seat) {
	var player = seat.player || dc_players[seat.id];
	if (!player || !player.p) return;
	player.p.poker = { token: seat.token, stack: seat.stack, server: server_id, at: new Date() };
}

function tavern_poker_log(entry) {
	var table = tavern_poker_table();
	entry.at = tavern_poker_now();
	table.log.push(entry);
	while (table.log.length > 8) table.log.shift();
}

function tavern_poker_record(entry) {
	if (!S.logs.poker) S.logs.poker = [];
	entry.at = new Date();
	lstack(S.logs.poker, entry, 200);
}

function tavern_poker_message(player, id, params, fields) {
	if (!player || !player.socket) return;
	player.socket.emit("game_log", localization.message(id, params || {}, fields || { color: "#E6B16B" }));
}

// Deck, ranking and comparison. Cards are "rank_suit" strings; scores are arrays compared left to right: the hand
// category first, then the ranks that break ties.
function tavern_poker_deck() {
	var def = tavern_poker_definition(),
		deck = [];
	def.suits.forEach(function (suit) {
		def.ranks.forEach(function (rank) {
			deck.push(rank + "_" + suit);
		});
	});
	for (var i = deck.length - 1; i > 0; i--) {
		var j = crypto.randomInt(i + 1),
			card = deck[i];
		deck[i] = deck[j];
		deck[j] = card;
	}
	return deck;
}

function tavern_poker_rank(card) {
	return tavern_poker_definition().ranks.indexOf(card.split("_")[0]) + 2;
}

function tavern_poker_suit(card) {
	return card.split("_")[1];
}

function tavern_poker_score5(cards) {
	var ranks = cards.map(tavern_poker_rank).sort(function (a, b) {
			return b - a;
		}),
		flush = cards.every(function (card) {
			return tavern_poker_suit(card) == tavern_poker_suit(cards[0]);
		}),
		unique = ranks.filter(function (rank, i) {
			return ranks.indexOf(rank) == i;
		}),
		straight = 0;
	if (unique.length == 5 && unique[0] - unique[4] == 4) straight = unique[0];
	if (unique.length == 5 && unique[0] == 14 && unique[1] == 5 && unique[4] == 2) straight = 5;
	var counts = {};
	ranks.forEach(function (rank) {
		counts[rank] = (counts[rank] || 0) + 1;
	});
	var groups = Object.keys(counts)
			.map(function (rank) {
				return [counts[rank], parseInt(rank)];
			})
			.sort(function (a, b) {
				return b[0] - a[0] || b[1] - a[1];
			}),
		kickers = groups.map(function (group) {
			return group[1];
		});
	if (straight && flush) return [8, straight];
	if (groups[0][0] == 4) return [7].concat(kickers);
	if (groups[0][0] == 3 && groups[1][0] == 2) return [6].concat(kickers);
	if (flush) return [5].concat(ranks);
	if (straight) return [4, straight];
	if (groups[0][0] == 3) return [3].concat(kickers);
	if (groups[0][0] == 2 && groups[1][0] == 2) return [2].concat(kickers);
	if (groups[0][0] == 2) return [1].concat(kickers);
	return [0].concat(ranks);
}

function tavern_poker_compare(a, b) {
	for (var i = 0; i < Math.max(a.length, b.length); i++) {
		var d = (a[i] || 0) - (b[i] || 0);
		if (d) return d;
	}
	return 0;
}

// Best five of up to seven cards.
function tavern_poker_best(cards) {
	var best = null;
	function consider(five) {
		var score = tavern_poker_score5(five);
		if (!best || tavern_poker_compare(score, best.score) > 0)
			best = { score: score, cards: five, hand: tavern_poker_definition().hands[score[0]] };
	}
	if (cards.length <= 5) consider(cards);
	else if (cards.length == 6)
		for (var a = 0; a < 6; a++)
			consider(
				cards.filter(function (card, i) {
					return i != a;
				}),
			);
	else
		for (var a = 0; a < 7; a++)
			for (var b = a + 1; b < 7; b++)
				consider(
					cards.filter(function (card, i) {
						return i != a && i != b;
					}),
				);
	return best;
}

// One public state for everyone in the Tavern. Hole cards travel separately to their seat; at showdown the cards that
// decided the hand are shown to all, with the key and the full deck order behind the published commitment.
function tavern_poker_state() {
	var def = tavern_poker_definition(),
		table = tavern_poker_table(),
		blinds = tavern_poker_blinds(),
		hand = table.hand,
		now = tavern_poker_now(),
		machine = tavern_poker_machine();
	var state = {
		event: "state",
		tier: tavern_poker_tier(),
		blinds: blinds,
		buyin: [def.buyin[0] * blinds[1], def.buyin[1] * blinds[1]],
		rake: def.rake,
		rake_cap: def.rake_cap * blinds[1],
		action_ms: def.action_ms,
		bank_ms: def.bank_ms,
		x: machine.x,
		y: machine.y,
		button: table.button,
		hands: table.hands,
		now: now,
		next: Math.max(0, table.next - now),
		log: table.log.slice(-6),
		seats: table.seats.map(function (seat) {
			if (!seat) return null;
			var entry = {
				index: seat.index,
				name: seat.name,
				stack: seat.stack,
				bet: seat.bet || 0,
				out: !!seat.out,
				dc: !!seat.dc,
				leaving: !!seat.leaving,
				folded: !!seat.folded,
				allin: !!seat.allin,
				cards: 0,
			};
			if (hand && hand.entries.indexOf(seat) != -1) {
				entry.cards = seat.cards.length;
				if (hand.over && hand.results && hand.results.shown[seat.index]) entry.shown = hand.results.shown[seat.index];
			}
			return entry;
		}),
		hand: null,
	};
	if (hand)
		state.hand = {
			n: hand.n,
			street: hand.street,
			board: hand.board.slice(),
			pot: hand.pot,
			bet: hand.bet,
			min_raise: hand.min_raise,
			acting: hand.acting,
			deadline: hand.deadline,
			banked: !!hand.banked,
			over: hand.over,
			results: hand.results,
			rake: hand.rake || 0,
			commit: hand.commit,
			key: hand.over ? hand.key : undefined,
			order: hand.over ? hand.order : undefined,
		};
	return state;
}

function tavern_poker_emit() {
	if (!instances.tavern) return;
	instance_emit(tavern, "poker", tavern_poker_state());
}

function tavern_poker_send(player) {
	if (!player || !player.socket) return;
	player.socket.emit("poker", tavern_poker_state());
	var seat = tavern_poker_seat_of(player),
		hand = tavern_poker_table().hand;
	if (seat && hand && hand.entries.indexOf(seat) != -1 && seat.cards.length)
		player.socket.emit("poker", { event: "cards", n: hand.n, cards: seat.cards.slice() });
}

// Requests from the client and from CODE. Every reply is a game_response with place "poker"; request ids make the
// CODE promises work like bet_wheel.
function tavern_poker_request(player, data) {
	var request_id = data && data.request_id;
	function fail(reason, extra) {
		var payload = Object.assign({ response: reason, place: "poker", failed: true }, extra || {});
		if (request_id) payload.request_id = request_id;
		player.socket.emit("game_response", payload);
	}
	function done(extra) {
		var payload = Object.assign({ response: "data", place: "poker", success: true }, extra || {});
		if (request_id) payload.request_id = request_id;
		player.socket.emit("game_response", payload);
	}
	if (!data || !tavern_poker_definition() || !instances.tavern) return fail("poker_unavailable");
	if (player.user) return fail("not_in_tavern");
	var event = data.event;
	if (event == "info") {
		tavern_poker_send(player);
		return done({ table: tavern_poker_state() });
	}
	if (player.map != "tavern" || player.in != "tavern") return fail("not_in_tavern");
	if (event == "join") return tavern_poker_join(player, data, fail, done);
	if (event == "leave") return tavern_poker_leave(player, fail, done);
	if (event == "act") return tavern_poker_act(player, data, fail, done);
	if (event == "sit_out" || event == "sit_in") return tavern_poker_sit(player, event == "sit_out", fail, done);
	return fail("poker_invalid_action");
}

function tavern_poker_join(player, data, fail, done) {
	var def = tavern_poker_definition(),
		table = tavern_poker_table(),
		blinds = tavern_poker_blinds(),
		machine = tavern_poker_machine(),
		min = def.buyin[0] * blinds[1],
		max = def.buyin[1] * blinds[1],
		gold = parseInt(data.gold || data.buyin) || 0,
		seat = tavern_poker_seat_of(player);
	if (tavern_poker_far(player, machine.x, machine.y, 260)) return fail("poker_far");
	if (seat) {
		// A seated player adds to a short stack between hands, up to the maximum buy-in.
		if (tavern_poker_in_hand(seat)) return fail("poker_in_hand");
		if (gold <= 0 || seat.stack + gold > max) return fail("poker_buyin", { min: 1, max: max - seat.stack });
		if (gold > player.gold) return fail("gold_not_enough");
		player.gold -= gold;
		seat.stack += gold;
		if (seat.out && seat.broke) ((seat.out = false), (seat.broke = false), (seat.out_at = null));
		tavern_poker_mirror(seat);
		tavern_poker_log({ t: "join", name: player.name, g: gold });
		tavern_poker_message(player, "server.game_log.poker_join", { amount: String(to_pretty_num(gold)) });
		resend(player, "reopen+nc");
		tavern_poker_emit();
		return done({ seat: seat.index, stack: seat.stack, buyin: gold, blinds: blinds });
	}
	for (var i = 0; i < table.seats.length; i++)
		if (table.seats[i] && table.seats[i].owner == player.owner) return fail("poker_seated");
	var index = data.seat === undefined || data.seat === null ? -1 : parseInt(data.seat);
	if (index == -1) for (var i = 0; i < table.seats.length; i++) if (!table.seats[i] && index == -1) index = i;
	if (!(index >= 0 && index < table.seats.length)) return fail("poker_full");
	if (table.seats[index]) return fail("poker_seat_taken");
	if (gold < min || gold > max) return fail("poker_buyin", { min: min, max: max });
	if (gold > player.gold) return fail("gold_not_enough");
	player.gold -= gold;
	seat = {
		index: index,
		id: player.real_id,
		owner: player.owner,
		name: player.name,
		stack: gold,
		token: randomStr(16),
		player: player,
		dc: null,
		joined: tavern_poker_now(),
		out: false,
		leaving: false,
		missed: 0,
		bet: 0,
		total: 0,
		cards: [],
		folded: true,
		allin: false,
	};
	table.seats[index] = seat;
	tavern_poker_mirror(seat);
	table.next = Math.max(table.next, tavern_poker_now() + 3000);
	tavern_poker_log({ t: "join", name: player.name, g: gold });
	tavern_poker_record({ t: "join", name: player.name, gold: gold, seat: index });
	tavern_poker_message(player, "server.game_log.poker_join", { amount: String(to_pretty_num(gold)) });
	resend(player, "reopen+nc");
	tavern_poker_emit();
	return done({ seat: index, stack: gold, buyin: gold, blinds: blinds });
}

function tavern_poker_leave(player, fail, done) {
	var seat = tavern_poker_seat_of(player);
	if (!seat) return fail("poker_not_seated");
	if (tavern_poker_in_hand(seat)) {
		seat.leaving = true;
		tavern_poker_message(player, "server.game_log.poker_leaving");
		tavern_poker_emit();
		return done({ leaving: true, stack: seat.stack });
	}
	var gold = seat.stack;
	tavern_poker_cash_out(seat, "leave");
	return done({ leaving: false, gold: gold });
}

function tavern_poker_sit(player, out, fail, done) {
	var seat = tavern_poker_seat_of(player),
		blinds = tavern_poker_blinds();
	if (!seat) return fail("poker_not_seated");
	if (!out && seat.stack < blinds[1]) return fail("poker_broke", { min: blinds[1] });
	seat.out = out;
	seat.out_at = out ? tavern_poker_now() : null;
	if (!out) seat.broke = false;
	tavern_poker_log({ t: out ? "out" : "in", name: seat.name });
	tavern_poker_emit();
	return done({ out: out });
}

function tavern_poker_act(player, data, fail, done) {
	var table = tavern_poker_table(),
		hand = table.hand,
		seat = tavern_poker_seat_of(player);
	if (!seat) return fail("poker_not_seated");
	if (!hand || hand.over || hand.acting != seat.index) return fail("poker_not_your_turn");
	var result = tavern_poker_apply(seat, ("" + (data.action || "")).toLowerCase(), data.amount || data.gold, false);
	if (result.reason) return fail(result.reason, result.extra);
	return done({ action: result.action, amount: result.amount, stack: seat.stack, pot: hand.pot });
}

// Dealing. The button moves clockwise; heads-up the button posts the small blind and acts first before the flop.
function tavern_poker_deal() {
	var def = tavern_poker_definition(),
		table = tavern_poker_table(),
		blinds = tavern_poker_blinds(),
		ready = tavern_poker_ready(),
		now = tavern_poker_now();
	if (ready.length < 2) return;
	table.hands++;
	table.button = tavern_poker_next_index(table.button, ready);
	var deck = tavern_poker_deck(),
		key = crypto.randomBytes(16).toString("hex"),
		hand = {
			n: table.hands,
			at: now,
			street: "preflop",
			deck: deck,
			key: key,
			commit: crypto.createHmac("sha256", key).update(deck.join(",")).digest("hex"),
			order: deck.slice(),
			board: [],
			pot: 0,
			bet: 0,
			min_raise: blinds[1],
			acting: -1,
			deadline: 0,
			next_at: 0,
			entries: ready,
			over: false,
			results: null,
			rake: 0,
			actions: [],
		};
	table.hand = hand;
	ready.forEach(function (seat) {
		seat.cards = [deck.pop(), deck.pop()];
		seat.bet = 0;
		seat.total = 0;
		seat.folded = false;
		seat.allin = false;
		seat.acted = false;
		seat.banked = false;
		seat.noraise = false;
		seat.before = seat.stack;
		seat.best = null;
		if (seat.dc) seat.missed++;
	});
	var small = ready.length == 2 ? table.button : tavern_poker_next_index(table.button, ready),
		big = tavern_poker_next_index(small, ready);
	tavern_poker_post(table.seats[small], blinds[0]);
	tavern_poker_post(table.seats[big], blinds[1]);
	hand.bet = blinds[1];
	hand.actions.push("s" + small + ":sb:" + table.seats[small].bet, "s" + big + ":bb:" + table.seats[big].bet);
	tavern_poker_log({ t: "deal", n: hand.n });
	ready.forEach(function (seat) {
		if (seat.player && seat.player.socket)
			seat.player.socket.emit("poker", { event: "cards", n: hand.n, cards: seat.cards.slice() });
	});
	hand.acting = big;
	tavern_poker_advance();
}

function tavern_poker_post(seat, amount) {
	var hand = tavern_poker_table().hand;
	amount = Math.min(amount, seat.stack);
	seat.stack -= amount;
	seat.bet += amount;
	seat.total += amount;
	hand.pot += amount;
	if (!seat.stack) seat.allin = true;
	tavern_poker_mirror(seat);
	return amount;
}

function tavern_poker_arm() {
	var hand = tavern_poker_table().hand;
	hand.deadline = tavern_poker_now() + tavern_poker_definition().action_ms;
	hand.banked = false;
}

// A decision. "bet" and "raise" name the total street bet to make; "allin" bets everything; "call" with nothing to
// call is a check. All-ins below a full raise do not reopen the betting for players who already acted.
function tavern_poker_apply(seat, action, amount, auto) {
	var table = tavern_poker_table(),
		hand = table.hand,
		to_call = hand.bet - seat.bet,
		result = { action: action, amount: 0 };
	if (action == "raise") action = "bet";
	if (action == "call" && to_call <= 0) action = "check";
	if (action == "allin") ((action = "bet"), (amount = seat.bet + seat.stack));
	if (action == "fold") seat.folded = true;
	else if (action == "check") {
		if (to_call > 0) return { reason: "poker_invalid_action" };
	} else if (action == "call") {
		result.amount = tavern_poker_post(seat, to_call);
	} else if (action == "bet") {
		amount = parseInt(amount) || 0;
		var max = seat.bet + seat.stack,
			min = hand.bet + hand.min_raise;
		if (seat.noraise && amount < max) return { reason: "poker_invalid_action" };
		if (amount >= max) amount = max;
		else if (amount < min) return { reason: "poker_min_raise", extra: { min: Math.min(min, max), max: max } };
		if (amount <= hand.bet) {
			// An all-in that cannot reach the current bet is a call for less.
			result.action = "call";
			result.amount = tavern_poker_post(seat, amount - seat.bet);
		} else {
			var full = amount - hand.bet >= hand.min_raise,
				raising = hand.bet > 0;
			result.amount = tavern_poker_post(seat, amount - seat.bet);
			hand.entries.forEach(function (other) {
				if (other == seat) return;
				if (full) ((other.acted = false), (other.noraise = false));
				else if (other.acted) other.noraise = true;
			});
			if (full) hand.min_raise = amount - hand.bet;
			hand.bet = amount;
			result.action = seat.allin ? "allin" : raising ? "raise" : "bet";
		}
	} else return { reason: "poker_invalid_action" };
	seat.acted = true;
	result.action = result.action || action;
	hand.actions.push(
		"s" + seat.index + ":" + result.action + (result.amount ? ":" + result.amount : "") + (auto ? ":auto" : ""),
	);
	tavern_poker_log({
		t: "act",
		name: seat.name,
		a: result.action,
		g: result.action == "call" ? result.amount : result.action == "fold" || result.action == "check" ? 0 : seat.bet,
		auto: !!auto,
		street: hand.street,
	});
	tavern_poker_advance();
	return result;
}

// Moves the action to the next seat, or ends the betting round.
function tavern_poker_advance() {
	var table = tavern_poker_table(),
		hand = table.hand,
		def = tavern_poker_definition(),
		live = tavern_poker_live(hand);
	if (live.length == 1) return tavern_poker_finish();
	// Whoever has not acted since the last full raise, or still owes the bet, is pending; before the flop this gives
	// the blinds their option even though they already posted.
	var pending = live.filter(function (seat) {
		return !seat.allin && (!seat.acted || seat.bet < hand.bet);
	});
	if (pending.length) {
		hand.acting = tavern_poker_next_index(hand.acting, pending);
		tavern_poker_arm();
		tavern_poker_emit();
		return;
	}
	hand.acting = -1;
	var actors = live.filter(function (seat) {
		return !seat.allin;
	});
	hand.next_at = tavern_poker_now() + (actors.length >= 2 ? 800 : def.between_ms);
	tavern_poker_emit();
}

function tavern_poker_next_street() {
	var table = tavern_poker_table(),
		hand = table.hand,
		blinds = tavern_poker_blinds(),
		def = tavern_poker_definition();
	hand.next_at = 0;
	hand.entries.forEach(function (seat) {
		seat.bet = 0;
		seat.acted = false;
		seat.noraise = false;
	});
	hand.bet = 0;
	hand.min_raise = blinds[1];
	if (hand.street == "preflop")
		((hand.street = "flop"), hand.board.push(hand.deck.pop(), hand.deck.pop(), hand.deck.pop()));
	else if (hand.street == "flop") ((hand.street = "turn"), hand.board.push(hand.deck.pop()));
	else if (hand.street == "turn") ((hand.street = "river"), hand.board.push(hand.deck.pop()));
	else return tavern_poker_finish();
	hand.actions.push(hand.street + ":" + hand.board.slice(-(hand.street == "flop" ? 3 : 1)).join(","));
	var live = tavern_poker_live(hand),
		actors = live.filter(function (seat) {
			return !seat.allin;
		});
	if (actors.length >= 2) {
		hand.acting = tavern_poker_next_index(table.button, actors);
		tavern_poker_arm();
	} else {
		hand.acting = -1;
		hand.next_at = tavern_poker_now() + def.between_ms;
	}
	tavern_poker_emit();
}

// The clock: a personal time bank starts once, then the server checks when it is free and folds otherwise.
function tavern_poker_timeout() {
	var table = tavern_poker_table(),
		hand = table.hand,
		def = tavern_poker_definition(),
		seat = table.seats[hand.acting];
	if (!seat) return tavern_poker_advance();
	if (!seat.banked) {
		seat.banked = true;
		hand.banked = true;
		hand.deadline = tavern_poker_now() + def.bank_ms;
		tavern_poker_emit();
		return;
	}
	var check = hand.bet - seat.bet <= 0;
	tavern_poker_message(
		seat.player,
		check ? "server.game_log.poker_auto_check" : "server.game_log.poker_auto_fold",
		{},
		{ color: "gray" },
	);
	tavern_poker_apply(seat, check ? "check" : "fold", 0, true);
}

// Showdown and awards. Pots are built per contribution level so every all-in competes only for what it covered; an
// uncalled bet returns to its owner without rake; ties split, odd gold to the first winner after the button.
function tavern_poker_finish() {
	var table = tavern_poker_table(),
		def = tavern_poker_definition(),
		blinds = tavern_poker_blinds(),
		hand = table.hand,
		live = tavern_poker_live(hand),
		now = tavern_poker_now();
	while (live.length > 1 && hand.board.length < 5) hand.board.push(hand.deck.pop());
	if (live.length > 1)
		live.forEach(function (seat) {
			seat.best = tavern_poker_best(seat.cards.concat(hand.board));
		});
	var levels = hand.entries
			.map(function (seat) {
				return seat.total;
			})
			.filter(function (total, i, all) {
				return total > 0 && all.indexOf(total) == i;
			})
			.sort(function (a, b) {
				return a - b;
			}),
		results = { winners: {}, hands: {}, shown: {}, pots: [] },
		prev = 0,
		rake_total = 0;
	levels.forEach(function (level) {
		var pot = 0,
			contributors = 0;
		hand.entries.forEach(function (seat) {
			var chips = Math.max(0, Math.min(seat.total, level) - prev);
			if (chips) ((pot += chips), contributors++);
		});
		prev = level;
		if (!pot) return;
		var eligible = live.filter(function (seat) {
			return seat.total >= level;
		});
		if (contributors == 1) {
			var owner =
				eligible[0] ||
				hand.entries.filter(function (seat) {
					return seat.total >= level;
				})[0];
			owner.stack += pot;
			results.winners[owner.index] = (results.winners[owner.index] || 0) + pot;
			results.pots.push({ gold: pot, returned: owner.index });
			return;
		}
		var winners = eligible;
		if (eligible.length > 1) {
			var best = null;
			eligible.forEach(function (seat) {
				if (!best || tavern_poker_compare(seat.best.score, best.best.score) > 0) best = seat;
			});
			winners = eligible.filter(function (seat) {
				return tavern_poker_compare(seat.best.score, best.best.score) == 0;
			});
		}
		var rake = Math.min(Math.floor((pot * def.rake) / 100), def.rake_cap * blinds[1]);
		pot -= rake;
		rake_total += rake;
		var share = Math.floor(pot / winners.length),
			odd = pot - share * winners.length,
			first = tavern_poker_next_index(table.button, winners);
		winners.forEach(function (seat) {
			var gold = share + (seat.index == first ? odd : 0);
			seat.stack += gold;
			results.winners[seat.index] = (results.winners[seat.index] || 0) + gold;
		});
		results.pots.push({
			gold: pot,
			rake: rake,
			winners: winners.map(function (seat) {
				return seat.index;
			}),
		});
	});
	if (live.length > 1)
		live.forEach(function (seat) {
			results.hands[seat.index] = seat.best.hand;
			results.shown[seat.index] = seat.cards.slice();
		});
	S.gold += rake_total;
	tavern.poker.gain = (tavern.poker.gain || 0) + rake_total;
	hand.rake = rake_total;
	hand.results = results;
	hand.over = true;
	hand.street = "showdown";
	hand.acting = -1;
	hand.ended = now;
	table.next = now + def.showdown_ms;
	var summary = {
		t: "hand",
		n: hand.n,
		tier: tavern_poker_tier(),
		board: hand.board.slice(),
		actions: hand.actions,
		winners: {},
		rake: rake_total,
		commit: hand.commit,
		key: hand.key,
		order: hand.order,
		seats: [],
	};
	hand.entries.forEach(function (seat) {
		if (table.seats[seat.index] == seat) tavern_poker_mirror(seat);
		summary.seats.push([seat.index, seat.name, seat.before, seat.stack]);
		var won = results.winners[seat.index] || 0;
		if (won > 0 && seat.stack > seat.before) {
			summary.winners[seat.name] = seat.stack - seat.before;
			tavern_poker_log({ t: "win", name: seat.name, g: won, h: results.hands[seat.index] || null });
			tavern_poker_message(
				seat.player,
				"server.game_log.poker_won",
				{ amount: String(to_pretty_num(seat.stack - seat.before)) },
				{ color: "gold" },
			);
		}
	});
	tavern_poker_record(summary);
	// Seats that were waiting for the hand to end.
	hand.entries.forEach(function (seat) {
		if (table.seats[seat.index] != seat) return;
		if (seat.stack < blinds[1] && !seat.leaving) {
			seat.out = true;
			seat.broke = true;
			seat.out_at = now;
			tavern_poker_log({ t: "out", name: seat.name });
			tavern_poker_message(
				seat.player,
				"server.game_log.poker_broke",
				{ amount: String(to_pretty_num(blinds[1])) },
				{ color: "gray" },
			);
		}
		if (seat.dc && seat.missed >= def.blind_hands && !seat.out) ((seat.out = true), (seat.out_at = now));
	});
	tavern_poker_emit();
	hand.entries.slice().forEach(function (seat) {
		if (table.seats[seat.index] == seat && seat.leaving) tavern_poker_cash_out(seat, "leave");
	});
}

// Every exit ends here: the stack returns to the purse when the character is here, otherwise the escrow record in the
// character's saved data is settled by a transaction that only pays once.
function tavern_poker_cash_out(seat, reason) {
	var table = tavern_poker_table(),
		gold = seat.stack;
	if (table.seats[seat.index] != seat) return;
	table.seats[seat.index] = null;
	seat.stack = 0;
	var player = seat.player;
	if (player && !player.dc && player.socket && players[player.socket.id] === player) {
		player.gold += gold;
		if (player.p) delete player.p.poker;
		tavern_poker_message(
			player,
			"server.game_log.poker_cash_out",
			{ amount: String(to_pretty_num(gold)) },
			{ color: "gold" },
		);
		resend(player, "reopen+nc");
	} else if (
		dc_players[seat.id] &&
		dc_players[seat.id].p &&
		dc_players[seat.id].p.poker &&
		dc_players[seat.id].p.poker.token == seat.token
	) {
		// Still being saved by this server: settle it in memory before the final save.
		dc_players[seat.id].gold += gold;
		delete dc_players[seat.id].p.poker;
		tavern_poker_record({ t: "cash_out", name: seat.name, gold: gold, reason: reason, result: "saved" });
	} else tavern_poker_refund(seat, gold, reason);
	tavern_poker_log({ t: "leave", name: seat.name, g: gold });
	tavern_poker_record({ t: "cash_out", name: seat.name, gold: gold, reason: reason });
	tavern_poker_emit();
}

function tavern_poker_refund(seat, gold, reason) {
	if (typeof tx != "function") return server_log("#X poker: no transaction helper to refund " + seat.name, 1);
	tx(async () => {
		var entity = await tx_get(A[0].id);
		if (!entity) ex("no_character");
		var escrow = entity.info && entity.info.p && entity.info.p.poker;
		if (!escrow || escrow.token != A[0].token) ex("consumed");
		if (entity.server) ex("online_elsewhere");
		entity.info.gold = (parseInt(entity.info.gold) || 0) + A[0].gold;
		delete entity.info.p.poker;
		await tx_save(entity);
	}, [{ id: seat.id, token: seat.token, gold: gold }])
		.then(function (R) {
			var result = R && R.success ? "ok" : (R && R.reason) || "failed";
			server_log("poker: refund of " + gold + " to " + seat.name + " (" + reason + "): " + result, 1);
			tavern_poker_record({ t: "refund", name: seat.name, gold: gold, reason: reason, result: result });
		})
		.catch(function (e) {
			log_trace("#X poker refund", e);
		});
}

// Hooks from node/server.js: login, disconnect, shutdown and the one-second tick.
function tavern_poker_login(player) {
	if (!tavern_poker_definition()) return;
	var seat = tavern_poker_seat_by_id(player.real_id);
	if (seat) {
		seat.player = player;
		seat.dc = null;
		seat.missed = 0;
		tavern_poker_mirror(seat);
		tavern_poker_log({ t: "back", name: seat.name });
		tavern_poker_message(player, "server.game_log.poker_back", { amount: String(to_pretty_num(seat.stack)) });
		tavern_poker_send(player);
		tavern_poker_emit();
		return;
	}
	var escrow = player.p && player.p.poker;
	if (!escrow) return;
	var gold = parseInt(escrow.stack) || 0;
	delete player.p.poker;
	if (gold <= 0) return;
	player.gold += gold;
	tavern_poker_record({
		t: "refund",
		name: player.name,
		gold: gold,
		reason: "login",
		result: "ok",
		from: escrow.server,
	});
	tavern_poker_message(
		player,
		"server.game_log.poker_refund",
		{ amount: String(to_pretty_num(gold)) },
		{ color: "gold" },
	);
}

function tavern_poker_disconnect(player) {
	if (!tavern_poker_definition() || !tavern.poker || !tavern.poker.table) return;
	var seat = tavern_poker_seat_by_id(player.real_id);
	if (!seat || seat.player !== player) return;
	tavern_poker_mirror(seat);
	seat.player = null;
	seat.dc = tavern_poker_now();
	seat.missed = 0;
	tavern_poker_log({ t: "dc", name: seat.name });
	tavern_poker_emit();
}

// A restart voids the live hand: every chip put into it returns to the seat that bet it, no rake, then all seats
// cash out. The escrow record covers a process that dies without running this.
function tavern_poker_shutdown() {
	if (!tavern.poker || !tavern.poker.table) return;
	var table = tavern_poker_table(),
		hand = table.hand;
	if (hand && !hand.over) {
		hand.entries.forEach(function (seat) {
			seat.stack += seat.total;
			seat.total = 0;
			seat.bet = 0;
			tavern_poker_mirror(seat);
		});
		hand.over = true;
		hand.voided = true;
		hand.acting = -1;
		hand.results = { winners: {}, hands: {}, shown: {}, pots: [], voided: true };
		tavern_poker_log({ t: "void" });
		tavern_poker_record({ t: "void", n: hand.n, actions: hand.actions });
	}
	table.seats.slice().forEach(function (seat) {
		if (seat) tavern_poker_cash_out(seat, "shutdown");
	});
}

function tavern_poker_tick() {
	var def = tavern_poker_definition();
	if (!def || !instances.tavern || !tavern.poker || !tavern.poker.table) return;
	var table = tavern_poker_table(),
		now = tavern_poker_now();
	try {
		table.seats.slice().forEach(function (seat) {
			if (!seat) return;
			var busy = tavern_poker_in_hand(seat);
			if (seat.player) {
				if (seat.player.dc || !seat.player.socket || players[seat.player.socket.id] !== seat.player) {
					seat.player = null;
					seat.dc = now;
				} else if (!seat.leaving && now - seat.joined > 12000) {
					var stool = tavern_poker_stool(seat);
					if (tavern_poker_far(seat.player, stool.x, stool.y, 60)) {
						seat.leaving = true;
						tavern_poker_message(seat.player, "server.game_log.poker_leaving");
						tavern_poker_emit();
					}
				}
			}
			if (busy) return;
			if (seat.leaving) tavern_poker_cash_out(seat, "leave");
			else if (seat.dc && now - seat.dc > def.grace_ms) tavern_poker_cash_out(seat, "grace");
			else if (seat.out && seat.out_at && now - seat.out_at > def.grace_ms) tavern_poker_cash_out(seat, "idle");
		});
		var hand = table.hand;
		if (hand && !hand.over) {
			if (hand.acting >= 0) {
				if (now >= hand.deadline) tavern_poker_timeout();
			} else if (hand.next_at && now >= hand.next_at) tavern_poker_next_street();
		} else if (now >= table.next && tavern_poker_ready().length >= 2) tavern_poker_deal();
	} catch (e) {
		log_trace("#X poker tick", e);
	}
}
