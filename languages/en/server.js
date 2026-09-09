// Authored backend messages. Protocol identifiers and player text are excluded.
module.exports = {
	// node/server.js and node/server_functions.js party_update packet. {player} is the joining character name.
	"server.party.joined": "{player} joined the party",
	// node/server.js party_update packet. {player} joins via {inviter}, another character in the party.
	"server.party.joined_with_invite": "{player} joined the party with {inviter}'s invite",
	// node/server_functions.js leave_party. {player} is the departing character name.
	"server.party.left": "{player} left the party",
	// node/server.js administrator ban command response. {result} is the raw returned operation result.
	"server.admin.ban_result": "Ban: {result}",
	// node/server.js administrator ban command returned no operation result.
	"server.admin.ban_no_result": "Ban: No result",
	// api.js:1339; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {character} = character.
	"server.api.auto_saved": "Auto-saved [{character}]",
	// api.js:1340; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name; {slot} = slot.
	"server.api.auto_saved_js": "Auto-saved {name}.{slot}.js",
	// api.js:1961; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.deck_not_found": "Deck not found",
	// api.js:1900; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.deleted": "Deleted!",
	// api.js:1333; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {old_name} = old_name; {slot} = slot. api.js:1334; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {old_name} = old_name; {slot} = slot.
	"server.api.deleted_js": "Deleted {old_name}.{slot}.js",
	// api.js:592; api authored display. Keep character, item, monster, map, and product names unchanged. api.js:1883; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.done": "Done!",
	// api.js:272; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.email_changed_verification_email_re_sent_refresh_the_page": "Email changed! Verification email re-sent. Refresh the page.",
	// api.js:347; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.emailed_password_reset_instructions": "Emailed password reset instructions",
	// api.js:734; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.api.flew_away": "{name} flew away ...",
	// api.js:542; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.api.is_alive": "{name} is alive!",
	// api.js:781; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.api.is_no_more": "{name} is no more ...",
	// api.js:1370; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {value} = code_list[slot][0]; {slot} = slot. api.js:1371; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {value} = code_list[slot][0]; {slot} = slot.
	"server.api.loaded_js": "Loaded {value}.{slot}.js",
	// api.js:1355; api authored display. Keep character, item, monster, map, and product names unchanged. api.js:1356; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.loaded_the_default_code": "Loaded the default code",
	// api.js:106; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.logged_in": "Logged In!",
	// api.js:353; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.logged_out": "Logged Out",
	// api.js:372; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.logged_out_everywhere": "Logged Out Everywhere",
	// api.js:1224; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.mail_deleted": "Mail deleted.",
	// api.js:1885; api authored display. Keep character, item, monster, map, and product names unchanged. api.js:1902; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.map_didn_t_exist": "Map didn't exist",
	// api.js:318; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.new_password_set": "New password set!",
	// api.js:1376; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.not_found": "Not Found",
	// api.js:295; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.password_changed": "Password changed!",
	// api.js:653; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name; {nname} = nname.
	"server.api.renamed_to": "{name} renamed to {nname}",
	// api.js:1338; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name; {slot} = slot. api.js:1341; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name; {slot} = slot.
	"server.api.saved_js": "Saved {name}.{slot}.js",
	// api.js:827; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.sent_the_disconnect_signal_to_the_server": "Sent the disconnect signal to the server",
	// api.js:231; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.setting_changed": "Setting changed!",
	// api.js:191; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.signup_complete": "Signup Complete!",
	// api.js:652; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(price).
	"server.api.spent_shells": "Spent {amount} shells",
	// api.js:1469; api authored display. Keep character, item, monster, map, and product names unchanged.
	"server.api.tutorial_reset": "Tutorial Reset!",
	// api.js:1664; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = result.shells. api.js:1824; api authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = shells.
	"server.api.you_received_shells": "You received {amount} SHELLS!",
	// node/server_functions.js:2696; chat_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.chat_log.alert": "ALERT",
	// node/server.js:4191; chat_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {attacker} = attacker.name; {player} = player.name.
	"server.chat_log.defeated": "{attacker} defeated {player}",
	// node/server.js:2767; chat_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {victor} = victor.name; {target} = target.name.
	"server.chat_log.pwned": "{victor} pwned {target}",
	// node/logic/market_patron_runtime.js:211; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.a_parcel_and_1_shell_good_to_see_your_shop": "A parcel, and 1 SHELL. Good to see your shop!",
	// node/logic/market_patron_runtime.js:211; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.a_parcel_for_keeping_a_shop_on_the_square": "A parcel for keeping a shop on the square.",
	// node/server_functions.js:3113; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.burn": "BURN!",
	// node/server_functions.js:3088; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.freeze": "FREEZE!",
	// node/server.js:3214; floating authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:10153; floating authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:10187; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.immune": "IMMUNE!",
	// node/server.js:9949; floating authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:10053; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.no_hits": "NO HITS",
	// node/server.js:8052; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.no_space": "NO SPACE",
	// node/server_functions.js:3091; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.poison": "POISON!",
	// node/server.js:12238; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.roarrrrrrr": "ROARRRRRRR",
	// node/server.js:4049; floating authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:4112; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.second_chance": "SECOND CHANCE!",
	// node/server.js:12228; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.seppuku": "SEPPUKU",
	// node/server.js:3856; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.sneak": "SNEAK!",
	// node/server_functions.js:3085; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.stun": "STUN!",
	// node/server.js:3851; floating authored display. Keep character, item, monster, map, and product names unchanged.
	"server.floating.sugar_rush": "SUGAR RUSH!",
	// node/server.js:11642; game_chat authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name.
	"server.game_chat.joined_the_duel": "{player} joined the duel!",
	// node/server.js:5106; game_chat authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {target} = target.name.
	"server.game_chat.muted": "Muted {target}",
	// node/server.js:5109; game_chat authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {target} = target.name.
	"server.game_chat.unmuted": "Unmuted {target}",
	// node/server.js:2871; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:13119; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.a_tome_fades_away": "A tome fades away",
	// node/server.js:11509; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:11523; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.already_dueling": "Already dueling",
	// node/server.js:11610; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.already_in_a_duel": "Already in a duel!",
	// node/server.js:10968; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:10971; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.authorization_in_progress": "Authorization in progress.",
	// node/server.js:5122; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {e} = e.
	"server.game_log.ban_error": "Ban error: {e}",
	// node/server.js:12021; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {odds} = data.odds.
	"server.game_log.bet_accepted_on": "Bet accepted on {odds}",
	// node/server.js:12078; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gold).
	"server.game_log.bet_gold": "Bet: {amount} gold",
	// node/server_functions.js:1653; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.better_luck_next_time": "Better luck next time",
	// node/server.js:11607; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.can_t_join_the_duel_from_a_pvp_zone": "Can't join the duel from a pvp zone!",
	// node/server.js:11526; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.can_t_start_a_duel_if_any_of_the_parties_are_already": "Can't start a duel if any of the parties are already in a pvp zone",
	// node/server.js:11520; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.challenge_expired": "Challenge expired",
	// node/server.js:10471; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.click_method_is_deprecated": "'click' method is deprecated.",
	// node/server.js:6180; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.code_slots_increased_to_100": "CODE slots increased to 100!",
	// node/server_functions.js:3751; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server_functions.js:3803; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.didn_t_receive_anything": "Didn't receive anything",
	// node/server.js:11616; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.duel_already_started": "Duel already started",
	// node/server.js:11613; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.duel_expired": "Duel expired",
	// node/logic/encouragement.js:463; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gold).
	"server.game_log.encouragement_gold": "{amount} encouragement gold",
	// node/server_functions.js:2666; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.full_inventory_unable_to_receive_a_prize": "Full inventory. Unable to receive a prize.",
	// node/server.js:2919; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(round(lost_xp * 0.95)). node/server.js:2946; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(lost_xp).
	"server.game_log.gained_experience": "Gained {amount} experience",
	// node/server.js:15240; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(xp).
	"server.game_log.gained_marketing_xp": "Gained {amount} marketing XP",
	// node/server.js:7804; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gold).
	"server.game_log.gave_gold": "Gave {amount} gold",
	// node/server.js:10801; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(r.gold). node/server.js:10938; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(cgold). node/server.js:12022; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(data.gold).
	"server.game_log.gold": "{amount} gold",
	// node/server_functions.js:1450; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(bet.edge).
	"server.game_log.house_edge_gold": "House edge: {amount} gold",
	// node/server.js:11506; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.invalid": "Invalid",
	// node/server.js:11665; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {invited} = invited.name.
	"server.game_log.invited_to_party": "Invited {invited} to party",
	// node/server.js:5858; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name.
	"server.game_log.is_spectating_the_duel": "{player} is spectating the duel",
	// node/server.js:8081; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.item_gone": "Item gone",
	// node/server.js:8451; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.joined_the_giveaway": "Joined the giveaway!",
	// node/server.js:11805; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {kicked} = kicked.name.
	"server.game_log.kicked": "{player} kicked {kicked}",
	// node/server.js:11754; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:11784; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.left_the_party": "Left the party",
	// node/server.js:11710; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.left_your_current_party": "Left your current party",
	// node/server.js:10677; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.line_violation_detected": "Line violation detected",
	// node/server.js:7481; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {item} = item_name(player.slots[slot]); {amount} = to_pretty_num(price).
	"server.game_log.listed_at_gold": "Listed {item} at {amount} gold",
	// node/server.js:7461; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {q} = data.q; {item} = item_name(player.slots[slot]); {amount} = to_pretty_num(price).
	"server.game_log.listed_at_gold_each": "Listed {q} {item} at {amount} gold each",
	// node/server.js:7457; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {q} = data.q; {item} = item_name(player.slots[slot]).
	"server.game_log.listed_to_giveaway": "Listed {q} {item} to giveaway!",
	// node/server.js:7477; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {item} = item_name(player.slots[slot]).
	"server.game_log.listed_to_giveaway_2": "Listed {item} to giveaway!",
	// node/server.js:2912; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gain_gold). node/server.js:2938; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gain_gold).
	"server.game_log.looted_gold": "Looted {amount} gold",
	// node/server.js:13125; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.lost_1_level": "Lost 1 level",
	// node/server.js:2884; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(lost_xp).
	"server.game_log.lost_experience": "Lost {amount} experience",
	// node/server.js:2883; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(lost_gold).
	"server.game_log.lost_gold": "Lost {amount} gold",
	// node/server_functions.js:1480; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(bet.gold); {num} = tavern.dice.num.
	"server.game_log.lost_gold_2": "Lost: {amount} gold [{num}]",
	// node/server.js:10678; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.make_sure_you_only_move_with_the_built_in_move_function": "Make sure you only move with the built-in move function",
	// node/server.js:5148; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {monster} = data.monster.
	"server.game_log.monster_not_found": "Monster not found: {monster}",
	// node/server.js:7793; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.no_longer_possible": "No longer possible",
	// node/server.js:5143; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {id} = data.id.
	"server.game_log.no_safe_spot_near": "No safe spot near: {id}",
	// node/server.js:5161; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {monster} = data.monster.
	"server.game_log.no_safe_spot_near_2": "No safe spot near: {monster}",
	// node/server.js:12454; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.not_connected_to_the_mainframe": "Not connected to the mainframe",
	// node/server.js:12017; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.not_enough_gold": "Not enough gold",
	// node/server.js:12009; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.not_taking_bets_yet": "Not taking bets yet!",
	// node/server.js:11619; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.not_your_duel": "Not your duel",
	// node/server.js:12077; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {value} = num.toFixed(2); {value2} = dir.toUpperCase().
	"server.game_log.num": "Num: {value} {value2}",
	// node/server.js:5102; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {id} = data.id. node/server.js:5113; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {id} = data.id. node/server.js:5130; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {id} = data.id.
	"server.game_log.player_not_found": "Player not found: {id}",
	// node/server.js:7820; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:7873; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:7890; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:7948; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:7966; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:8866; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:8883; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.purchase_failed": "Purchase failed",
	// node/server.js:2911; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {target} = target.name.
	"server.game_log.pwned": "Pwned {target}",
	// node/server.js:2937; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name; {target} = target.name.
	"server.game_log.pwned_2": "{name} pwned {target}",
	// node/server_functions.js:2177; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {item} = names.map((name) => G.items[name].name).join(" + "); {value} = jar ? " + " + jarName : "".
	"server.game_log.received": "Received: {item}{value}",
	// node/server.js:14382; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.received_a_movement_penalty": "Received a movement penalty",
	// node/server.js:8599; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(round(price * (1 - player.tax))). node/server.js:8700; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(round(price * (1 - seller.tax))). node/server.js:14191; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gold). node/server_functions.js:2439; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gold). node/server_functions.js:3741; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(drop[2]).
	"server.game_log.received_gold": "Received {amount} gold",
	// node/server.js:2902; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(tome_gold).
	"server.game_log.received_gold_from_the_tome": "Received {amount} gold from the tome",
	// node/server.js:678; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = req.body.ncash. node/server.js:7824; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(shells).
	"server.game_log.received_shells": "Received {amount} shells",
	// node/server.js:11682; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {invited} = invited.name.
	"server.game_log.requested_to_join_s_party": "Requested to join {invited}'s party",
	// node/server.js:10517; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.rook_is_still_reading_the_sands": "Rook is still reading the sands.",
	// node/server.js:10526; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {G} = G.npcs[data.destination].name.
	"server.game_log.rook_marks_the_first_steps_toward": "Rook marks the first steps toward {G}.",
	// node/server.js:8597; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(price - round(price * (1 - player.tax))); {value} = player.tax * 100. node/server.js:8698; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(price - round(price * (1 - seller.tax))); {value} = seller.tax * 100.
	"server.game_log.sales_tax_gold": "Sales tax {amount} gold [{value}%]",
	// node/server.js:2861; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {attacker} = attacker.name.
	"server.game_log.slain_by": "Slain by {attacker}",
	// node/server.js:8064; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(gold). node/server.js:8600; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(price). node/server.js:8695; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(price).
	"server.game_log.spent_gold": "Spent {amount} gold",
	// node/server.js:7898; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(cost). node/server.js:7976; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(cost).
	"server.game_log.spent_shells": "Spent {amount} shells",
	// node/server_functions.js:1650; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {roll} = roll.
	"server.game_log.the_lucky_number_is_black": "The lucky number is {roll} Black",
	// node/server_functions.js:1646; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {roll} = roll.
	"server.game_log.the_lucky_number_is_green": "The lucky number is {roll} Green",
	// node/server_functions.js:1648; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {roll} = roll.
	"server.game_log.the_lucky_number_is_red": "The lucky number is {roll} Red",
	// node/server.js:14383; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.this_might_have_happened_if_your_network_is_too_slow": "This might have happened if your network is too slow",
	// node/server.js:7361; game_log authored display. Keep character, item, monster, map, and product names unchanged. node/server.js:7587; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.unequip_your_offhand_item_to_use_this_two_handed_weapon": "Unequip your offhand item to use this two-handed weapon.",
	// node/server.js:6153; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.unlock_failed": "Unlock Failed.",
	// node/server.js:6176; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.unlock_failed_email_hello_adventure_land_with_a_screenshot": "Unlock Failed. Email hello@adventure.land with a screenshot.",
	// node/server_functions.js:1446; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(bet.win); {num} = tavern.dice.num.
	"server.game_log.won_gold": "Won: {amount} gold [{num}]",
	// node/server.js:15341; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {winner} = winner.name; {player} = player.name; {item} = G.items[item.name].name. node/server.js:15414; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {winner} = winner.name; {player} = player.name; {item} = G.items[item.name].name.
	"server.game_log.won_s_giveaway_of": "{winner} won {player}'s giveaway of {item}!",
	// node/server.js:14357; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {def} = def.name.
	"server.game_log.wore_off": "{def} wore off ...",
	// node/server.js:10965; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.wrong_passphrase": "Wrong passphrase!",
	// node/server.js:12013; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.you_already_have_5_active_bets": "You already have 5 active bets",
	// node/server.js:9093; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.you_are_out_of_pokes": "You are out of pokes!",
	// node/server.js:11808; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.you_ve_been_removed_from_the_party": "You've been removed from the party",
	// node/server_functions.js:1656; game_log authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {amount} = to_pretty_num(totals[id]).
	"server.game_log.you_ve_won_gold": "You've won {amount} gold",
	// node/server.js:6160; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.your_code_slots_are_already_unlocked_you_can_lend_your_ancient_computer":
		"Your CODE slots are already unlocked. You can lend your Ancient Computer to a friend in need, that's why there are 2 charges :]",
	// node/server.js:14319; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.your_pickaxe_broke_down": "Your pickaxe broke down ...",
	// node/server.js:14282; game_log authored display. Keep character, item, monster, map, and product names unchanged.
	"server.game_log.your_rod_broke_down": "Your rod broke down ...",
	// node/server_functions.js:2355; notice authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {monster} = G.monsters[name].name.
	"server.notice.event_is_over": "{monster} Event is over ...",
	// node/server_functions.js:2407; notice authored display. Keep character, item, monster, map, and product names unchanged.
	"server.notice.goo_brawl_has_begun": "Goo Brawl has begun!",
	// node/server_functions.js:2859; notice authored display. Keep character, item, monster, map, and product names unchanged.
	"server.notice.goo_brawl_is_about_to_start": "Goo Brawl is about to start!",
	// node/server_functions.js:2414; notice authored display. Keep character, item, monster, map, and product names unchanged.
	"server.notice.goo_brawl_is_over_hope_you_had_fun": "Goo Brawl is over, hope you had fun!",
	// node/server_functions.js:2363; notice authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {monster} = G.monsters[name].name.
	"server.notice.has_been_defeated": "{monster} has been defeated!",
	// node/server.js:657; notice authored display. Keep character, item, monster, map, and product names unchanged.
	"server.notice.server_live_reload_failed": "Server Live Reload Failed",
	// adventure_functions.js:447; page authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {value} = parts[2].
	"server.page.adventure_land_code_docs": "{value}() — Adventure Land CODE Docs",
	// adventure_functions.js:456; page authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.page.adventure_land_docs": "{name} — Adventure Land Docs",
	// adventure_functions.js:459; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.adventure_land_docs_2": "Adventure Land Docs",
	// main.js:186; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.adventure_land_for_vs_code": "Adventure Land for VS Code",
	// adventure_functions.js:420; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.adventure_land_game_world_and_logo": "Adventure Land game world and logo",
	// adventure_functions.js:457; page authored display. Keep character, item, monster, map, and product names unchanged. adventure_functions.js:460; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.adventure_land_guides_code_references_game_data_items_monsters_skills_and_systems": "Adventure Land guides, CODE references, game data, items, monsters, skills, and systems.",
	// adventure_functions.js:450; page authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.page.adventure_land_item_guide": "{name} — Adventure Land Item Guide",
	// adventure_functions.js:451; page authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.page.adventure_land_item_reference_for": "Adventure Land item reference for {name}.",
	// main.js:141; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.adventure_land_mainframe": "Adventure Land Mainframe",
	// adventure_functions.js:453; page authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.page.adventure_land_monster_guide": "{name} — Adventure Land Monster Guide",
	// adventure_functions.js:454; page authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {name} = name.
	"server.page.adventure_land_monster_reference_for": "Adventure Land monster reference for {name}.",
	// adventure_functions.js:493; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.adventure_land_the_code_mmorpg": "Adventure Land — The Code MMORPG",
	// main.js:271; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.all_online_merchants": "All Online Merchants!",
	// main.js:221; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.characters": "Characters",
	// adventure_functions.js:448; page authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {value} = parts[2].
	"server.page.code_reference_for_in_adventure_land": "CODE reference for {value}() in Adventure Land.",
	// main.js:343; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.invalid_password_reset_url": "Invalid Password Reset URL",
	// main.js:204; page authored display. Keep character, item, monster, map, and product names unchanged. main.js:230; page authored display. Keep character, item, monster, map, and product names unchanged. main.js:232; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.not_found": "Not Found",
	// main.js:735; page authored display. Keep character, item, monster, map, and product names unchanged.
	"server.page.realm_atlas_adventure_land": "Realm Atlas | Adventure Land",
	// node/server_functions.js:2679; server_message authored display. Keep character, item, monster, map, and product names unchanged.
	"server.server_message.a_b_testing_has_begun": "A/B Testing has begun!",
	// node/server_functions.js:2866; server_message authored display. Keep character, item, monster, map, and product names unchanged.
	"server.server_message.a_b_testing_is_about_to_start": "A/B Testing is about to start!",
	// node/server.js:7985; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {region} = region; {server_name} = server_name.
	"server.server_message.blessed": "{player} blessed {region} {server_name}",
	// node/server.js:4185; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {attacker} = attacker.name; {player} = player.name.
	"server.server_message.defeated": "{attacker} defeated {player}",
	// node/server_functions.js:2218; anniversary server announcement. Preserve the full reward item name Anniversary Gift, distinct from Gift. Keep character, monster, map, and product names unchanged. Parameters: {target} = next.target; {map} = G.maps[next.map].name.
	"server.server_message.find_in_use_your_anniversary_visit_to_send_a_kiss_for_a": "Find {target} in {map}! Use your Anniversary Visit to send a kiss for a slice and an Anniversary Gift.",
	// node/server.js:4476; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {amount} = to_pretty_num(amount).
	"server.server_message.found_shells": "{player} found {amount} shells",
	// node/server.js:1224; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {level} = player.level.
	"server.server_message.is_now_level": "{player} is now level {level}",
	// node/server.js:1226; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {level} = player.level.
	"server.server_message.is_now_level_2": "{player} is now level {level}!",
	// node/server.js:12866; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {monster_def} = monster_def.name.
	"server.server_message.join_the_fight_against": "Join the fight against {monster_def}!",
	// node/server.js:15495; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name.
	"server.server_message.joined_adventure_land": "{player} joined Adventure Land!",
	// node/server.js:10753; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {amount} = to_pretty_num(server_tax(round(chest.gold * r.goldm), true)). node/server.js:10823; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {amount} = to_pretty_num(server_tax(round(chest.gold * r.goldm), true)).
	"server.server_message.looted_gold": "{player} looted {amount} gold",
	// node/server.js:2763; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {victor} = victor.name; {target} = target.name.
	"server.server_message.pwned": "{victor} pwned {target}",
	// node/server_functions.js:2170; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {jarName} = jarName.
	"server.server_message.received_an": "{player} received an {jarName}!",
	// node/server.js:14175; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {amount} = to_pretty_num(gold). node/server_functions.js:3744; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {player} = player.name; {amount} = to_pretty_num(drop[2]).
	"server.server_message.received_gold": "{player} received {amount} gold",
	// node/server.js:16081; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {x} = x.
	"server.server_message.server_shutdown_in": "Server shutdown in: {x}",
	// node/server.js:12860; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {monster_def} = monster_def.name; {map} = G.maps[monster.map].name.
	"server.server_message.spawned_in": "{monster_def} spawned in {map}!",
	// node/server_functions.js:2655; server_message authored display. Keep character, item, monster, map, and product names unchanged. Parameters: {winner} = winner.
	"server.server_message.team_wins_hope_you_all_had_fun": "Team {winner} wins! Hope you all had fun!",
	// api.js load_article_api. {name} is the requested article identifier.
	"server.api.article_not_found": "Article not found: {name}",
	// api.js character privacy confirmation.
	"server.api.character_private": "Character is now private",
	// api.js character privacy confirmation, including the account-name warning.
	"server.api.character_private_rename": "Character is now private WARNING: SORT YOUR CHARACTERS ONCE TO AUTO-CHANGE YOUR ACCOUNT NAME",
	// api.js character privacy confirmation.
	"server.api.character_public": "Character isn't private anymore",
	// node/server_functions.js event_loop. {winner} and {loser} are character names.
	"server.duel.defeated": "{winner} defeated {loser}!",
	// node/server_functions.js event_loop. {winner} is a character name.
	"server.duel.winner": "{winner} wins the duel!",
	// adventure_functions.js Password reset email subject.
	"server.email.reset_subject": "Password Reminder from Adventure Land",
	// adventure_functions.js reset email plain text. {url} is the password reset link.
	"server.email.reset_text": "To reset your password, please visit: {url}",
	// adventure_functions.js Verification email subject.
	"server.email.verification_subject": "Welcome to Adventure Land! Verification Link + Early Game Suggestions Inside",
	// adventure_functions.js verification email plain text. {url} is the verification link.
	"server.email.verification_text": "To Verify Your Email: {url}",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.come_to_papa": "Come to papa",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.distance": "Social distancing what?",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.feeling": "HELP ME…I'm FEELING.",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.give_me_that": "Give me that! Don't you know you're not supposed to take things that don't belong to you? What's the matter with you? You some kind of wild animal?",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.green": "It's because I'm green isn't it?",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.holiday": "Holiday who-be what-ee?",
	// node/server_functions.js event_loop. {target} is the target character name inside a playful utterance.
	"server.grinch.innie": "Innie, minnie, tiny {target}innie",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.interaction": "I could use a little social interaction.",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.kids_today": "Kids today. So desensitized by movies and television.",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.not_chew_toy": "This is not a chew toy!",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.nothing_to_wear": "Stupid. Ugly. Out of date. This is ridiculous. If I can't find something nice to wear I'm not going.",
	// node/server_functions.js event_loop. {target} is the target character name.
	"server.grinch.poor": "Poor, poor, {target}",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.ribbons": "It came without ribbons, it came without tags. It came without packages, boxes, or bags.",
	// node/server_functions.js event_loop, Grinch reacts to the holiday sweater.
	"server.grinch.sweater": "Ugh. What's that ugly thing you are wearing?! I can't look at it. Stop.",
	// node/server_functions.js event_loop, one random Grinch utterance.
	"server.grinch.that_chew_toy": "That is not a chew toy!",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.fished.a": "Fished a {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.fished.an": "Fished an {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.fished.many": "Fished {item} [x{quantity}]",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.found.a": "Found a {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.found.an": "Found an {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.found.many": "Found {item} [x{quantity}]",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.glitched.a": "Glitched a {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.glitched.an": "Glitched an {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.glitched.many": "Glitched {item} [x{quantity}]",
	// node/server.js:10756. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.looted.a": "Looted a {item}",
	// node/server.js:10756. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.looted.an": "Looted an {item}",
	// node/server.js:10756. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.looted.many": "Looted {item} [x{quantity}]",
	// node/server.js:10891. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.lost.a": "Lost a {item}",
	// node/server.js:10891. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.lost.an": "Lost an {item}",
	// node/server.js:10891. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.lost.many": "Lost {item} [x{quantity}]",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.mined.a": "Mined a {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.mined.an": "Mined an {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.mined.many": "Mined {item} [x{quantity}]",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_fished.a": "{player} fished a {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_fished.an": "{player} fished an {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_fished.many": "{player} fished {item} [x{quantity}]",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_found.a": "{player} found a {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_found.an": "{player} found an {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_found.many": "{player} found {item} [x{quantity}]",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_glitched.a": "{player} glitched a {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_glitched.an": "{player} glitched an {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_glitched.many": "{player} glitched {item} [x{quantity}]",
	// node/server.js:10875. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_looted.a": "{player} looted a {item}",
	// node/server.js:10875. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_looted.an": "{player} looted an {item}",
	// node/server.js:10875. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_looted.many": "{player} looted {item} [x{quantity}]",
	// node/server.js:14109. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_lost.a": "{player} lost a {item}",
	// node/server.js:14109. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_lost.an": "{player} lost an {item}",
	// node/server.js:14109. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_lost.many": "{player} lost {item} [x{quantity}]",
	// node/server.js:14034. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_lost_compound.a": "{player} lost a {item}'s",
	// node/server.js:14034. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_lost_compound.an": "{player} lost an {item}'s",
	// node/server.js:14034. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_lost_compound.many": "{player} lost {item} [x{quantity}]'s",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_mined.a": "{player} mined a {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_mined.an": "{player} mined an {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_mined.many": "{player} mined {item} [x{quantity}]",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_received.a": "{player} received a {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_received.an": "{player} received an {item}",
	// node/server.js add_item. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.named_received.many": "{player} received {item} [x{quantity}]",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.received.a": "Received a {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.received.an": "Received an {item}",
	// node/server_functions.js exchange. Complete item message. {item} is the established native item display name with any level/property; {quantity} is the item count; {player}, when present, is a character name. Translate the article with the entire sentence.
	"server.item.received.many": "Received {item} [x{quantity}]",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.player.a": "{player} killed a {monster}",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.player.an": "{player} killed an {monster}",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.player.none": "{player} killed {monster}",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.player.the": "{player} killed the {monster}",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.you.a": "You killed a {monster}",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.you.an": "You killed an {monster}",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.you.none": "You killed {monster}",
	// node/server_functions.js kill_message. {player} and {monster} are native names. Keep the complete sentence and its article together.
	"server.kill.you.the": "You killed the {monster}",
	// adventure_functions.js referral reward system mail. {name} is the referred account name.
	"server.mail.friend_token_message": "For inviting {name} to Adventure Land!",
	// adventure_functions.js referral reward system mail subject. Friend Token is the item name.
	"server.mail.friend_token_subject": "A Friend Token!",
	// node/server.js giveaway system mail. {player} is the host character and {participants} is the list of entrant names.
	"server.mail.giveaway_message": "Congratulations, you won {player}'s giveaway. Participants were: {participants}",
	// node/server.js giveaway system mail subject.
	"server.mail.giveaway_subject": "You've won a giveaway!",
	// node/server_functions.js hardcore participation reward mail.
	"server.mail.hardcore_participation": "Reward for Participation",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward accessory5. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.accessory5": "Reward for First +V Accessory",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward accessory6. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.accessory6": "Reward for First +S Accessory",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_ent. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_ent": "Reward for First Ent Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_franky. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_franky": "Reward for First Franky Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_fvampire. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_fvampire": "Reward for First Ms.Vampire Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_goo. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_goo": "Reward for First Goo Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_mage_70. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_mage_70": "Reward for First Mage to Level 70",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_mvampire. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_mvampire": "Reward for First Mr.Vampire Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_paladin_70. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_paladin_70": "Reward for First Paladin to Level 70",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_priest_70. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_priest_70": "Reward for First Priest to Level 70",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_ranger_70. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_ranger_70": "Reward for First Ranger to Level 70",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_rogue_70. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_rogue_70": "Reward for First Rogue to Level 70",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_skeletor. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_skeletor": "Reward for First Skeletor Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_stompy. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_stompy": "Reward for First Stompy Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_wabbit. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_wabbit": "Reward for First Wabbit Kill",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward first_warrior_70. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.first_warrior_70": "Reward for First Warrior to Level 70",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward item10. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.item10": "Reward for First +X Item",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward item11. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.item11": "Reward for First +Y Item",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward item12. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.item12": "Reward for First +Z Item",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward item8. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.item8": "Reward for First +8 Item",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward item9. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.item9": "Reward for First +9 Item",
	// node/server_functions.js send_hardcore_rewards, complete system-mail text for reward leader. Keep item tiers and native monster names unchanged.
	"server.mail.hardcore_reward.leader": "Reward for Leadership",
	// node/server_functions.js hardcore reward mail subject.
	"server.mail.hardcore_subject": "HARDCORE: Congratulations!",
	// node/logic/market_patron_runtime.js committed Merrit receipt explanation.
	"server.merrit.receipt": "Your shop stayed stocked for two minutes and left the neighbors room.",
	// adventure_functions.js default search description. Keep Adventure Land and JavaScript unchanged.
	"server.page.description": "Adventure Land is a persistent code MMORPG where you control up to four characters with JavaScript, explore, trade, craft, and fight alongside other players.",
	// main.js email verification result.
	"server.page.verification_already": "Your Email Is Already Verified",
	// main.js email verification result.
	"server.page.verification_complete": "Your Email Is Now Verified",
	// main.js email verification result.
	"server.page.verification_failed": "Email Verification Failed",
	// node/server.js add_shells, tome reward. {amount} is the formatted Shell count.
	"server.shells.earned": "Earned {amount} SHELLS",
	// node/server.js add_shells, non-tome receipt. {amount} is the formatted Shell count.
	"server.shells.received": "Received {amount} SHELLS",
	// api.js tutorial_api, a lesson still has pending tasks.
	"server.tutorial.complete_current": "Complete the current lesson before continuing.",
	// api.js tutorial_api. {task} is an unrecognized CODE task identifier.
	"server.tutorial.invalid_task": "Invalid task '{task}'",
	// api.js tutorial_api. {lesson} is the completed tutorial title.
	"server.tutorial.lesson_complete": "Lesson '{lesson}' Complete!",
	// api.js tutorial_api, a task from another lesson.
	"server.tutorial.other_lesson": "That task belongs to another lesson.",
	// api.js tutorial_api. {task} is the current tutorial task label.
	"server.tutorial.task_complete": "Task '{task}' Complete!",
	// main.js saved CODE script error. Keep the xrequire method name unchanged.
	"server.code.xrequire_not_found": "xrequire: Code not found",
	// main.js saved CODE script error. Keep the load_code method name unchanged.
	"server.code.load_not_found": "load_code: Code not found",
	// main.js map preview/editor routes, no map supplied.
	"server.page.no_map": "no map",
	// main.js map editor permission error.
	"server.page.not_permitted": "Not Permitted!",
	// main.js Steam news route, no news item is available. Keep Steam unchanged.
	"server.page.steam_news_unavailable": "Steam news unavailable",
	// Steam checkout item description. {count} is the purchased premium currency amount; fit within 128 characters.
	"server.payment.shells": "{count} Shells",
	// node/server.js calculate_player_stats; short rebuke sent before disconnection after repeated invalid XP. Uses the existing game_log display event.
	"server.game_log.you_monster": "You monster!",
	// Compact parenthesized failure marker sent back by the game server when a cross-server private message cannot be delivered because the target account was not found. Used in the existing private-chat display and floating PM text. Preserve parentheses, use a concise native marker for failed delivery, and never translate player-authored messages. The raw CODE PM event still receives the original (FAILED).
	"server.pm.delivery_failed": "(FAILED)",
};
