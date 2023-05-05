import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { esbuildCommonjs, viteCommonjs } from "@originjs/vite-plugin-commonjs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [viteCommonjs(), react()],
	build: {
		commonjsOptions: {
			transformMixedEsModules: true,
		},
	},
});
