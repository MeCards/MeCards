import { fileURLToPath } from 'node:url';

import { type BuildOptions } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { replace } from 'esbuild-plugin-replace';
import svgr from 'esbuild-plugin-svgr';
import { ZBAR_WASM_REPOSITORY } from '@undecaf/barcode-detector-polyfill/zbar-wasm';

import { compileIndexEJSPlugin } from './compile-index-ejs.ts';
import { compileWebManifestPlugin } from './compile-webmanifest.ts';
import { compileServiceWorkerPlugin } from './compile-serviceworker.ts';

export const outdir = fileURLToPath(import.meta.resolve('../docs'));

export const config: BuildOptions = {
	bundle: true,
	entryPoints: [
		// TODO: switch to { [key]: path } ?
		fileURLToPath(import.meta.resolve('../src/app/favicon.ico')),
		fileURLToPath(import.meta.resolve('../src/app/og.png')),
		fileURLToPath(import.meta.resolve('../src/sw/main.ts')),
		fileURLToPath(import.meta.resolve('../src/sw/register.ts')),
		fileURLToPath(import.meta.resolve('../src/app/main.tsx')),
		fileURLToPath(import.meta.resolve('../src/webmanifest/webmanifest.ts')),
		fileURLToPath(import.meta.resolve('../src/app/index.ejs')),
	],
	format: 'esm',
	loader: {
		'.ico': 'copy',
		'.ejs': 'copy',
		'.png': 'file',
		'.woff2': 'file',
	},
	jsx: 'automatic',
	jsxImportSource: 'preact',
	plugins: [
		svgr({ icon: true, /* strip `width` & `height` attrs */ }),
		compileWebManifestPlugin(),
		compileIndexEJSPlugin(),
		compileServiceWorkerPlugin(),
		replace({
			values: {
				[ZBAR_WASM_REPOSITORY]: '@undecaf/zbar-wasm', // Replaces the repository URL with a local reference
				'/dist/main.js': '',
				'/dist/index.js': '',
			},
		}),
		copy({
			assets: {
				from: ['node_modules/@undecaf/zbar-wasm/dist/zbar.wasm'],
				to: ['.'],
			},
		}),
	],
	outdir,
	splitting: false, // https://github.com/evanw/esbuild/issues/4321
} as const;
