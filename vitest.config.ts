import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

import path from "path";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		environment: "jsdom",
		globals: true,
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		alias: {
			obsidian: path.resolve(import.meta.dirname, "./src/__mocks__/obsidian.ts"),
		},
	},
});
