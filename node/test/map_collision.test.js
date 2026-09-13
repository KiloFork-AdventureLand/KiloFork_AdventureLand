const assert = require("node:assert/strict");
const test = require("node:test");
const vm = require("node:vm");
const { extract, read } = require("./helpers/server_vm");

for (const axis of ["x_lines", "y_lines"]) {
	test(`saved ${axis} block movement across negative and positive coordinates`, () => {
		const context = vm.createContext({
			Place: "server",
			perfc: { roam_ops: 0 },
			m_line_x: false,
			m_line_y: false,
			line_hit_x: null,
			line_hit_y: null,
		});
		vm.runInContext(read("common/js/common_functions.js"), context);
		vm.runInContext(read("js/old_common_functions.js"), context);
		vm.runInContext(extract(read("adventure_functions.js"), "process_map"), context);
		const coordinates = [-104, -240, -464, -96, 104, 240, 464, 8];
		const data = { tiles: [], placements: [], [axis]: coordinates.map((position) => [position, -50, 50]) };
		context.process_map({ info: { data } });
		context.G = { geometry: { test: data }, dimensions: {} };
		const vertical = axis === "x_lines";

		for (const position of coordinates) {
			for (const direction of [-1, 1]) {
				const from = position - direction * 20;
				const to = position + direction * 20;
				const entity = {
					map: "test",
					type: "character",
					x: vertical ? from : 0,
					y: vertical ? 0 : from,
					going_x: vertical ? to : 0,
					going_y: vertical ? 0 : to,
				};
				context.set_base(entity);
				assert.equal(context.can_move(entity), false, `wall at ${position}, direction ${direction}`);
				const move = context.calculate_move(entity, entity.going_x, entity.going_y);
				const stopped = vertical ? move.x : move.y;
				assert.ok(direction * (stopped - from) > 0, "movement advances toward the wall");
				assert.ok(direction * (stopped - position) < 0, "movement stops before the wall");
				if (vertical) entity.y = entity.going_y = 60;
				else entity.x = entity.going_x = 60;
				assert.equal(context.can_move(entity), true, "movement past the wall's end stays open");
			}
		}
	});
}
