import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: 'build',
	},
	plugins: [
		react(),
		viteTsconfigPaths(),
		checker({
			// e.g. use TypeScript check
			typescript: true,
		}),
	],
});
