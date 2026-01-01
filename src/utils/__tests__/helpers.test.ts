import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getFormattedDate } from "@/utils/helpers";
// eslint-disable-next-line no-restricted-imports
import moment from "moment";

describe("getFormattedDate", () => {
	beforeEach(() => {
		// Mock window.moment
		vi.stubGlobal("moment", moment);
		// Mock window object property if needed, though stubGlobal handles global scope
		// @ts-ignore
		window.moment = moment;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("should return formatted date", () => {
		const format = "YYYY-MM-DD";
		const today = moment().format(format);
		expect(getFormattedDate(format)).toBe(today);
	});
});
