/**
 * Register custom Handlebars helpers.
 */
export function registerHandlebarsHelpers() {
	/**
	 * Repeats a given block N-times.
	 * @param {number} n	The number of times the block is repeated.
	 * @param {object} options	Helper options
	 * @param {number} [options.start]	The starting index number.
	 * @param {boolean} [options.reverse] Invert the index number.
	 * @returns {string}
	 */
	Handlebars.registerHelper("times", function (n, options) {
		let accum = "";
		let data;
		if (options.data) {
			data = Handlebars.createFrame(options.data);
		}
		let { start = 0, reverse = false } = options.hash;
		for (let i = 0; i < n; ++i) {
			if (data) {
				data.index = reverse ? n - i - 1 + start : i + start;
				data.first = i === 0;
				data.last = i === n - 1;
			}
			accum += options.fn(i, { data: data });
		}
		return accum;
	});
}
