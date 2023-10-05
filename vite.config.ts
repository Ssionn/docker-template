import esbuild from 'rollup-plugin-esbuild';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import terser from '@rollup/plugin-terser';
import { GlobList } from 'glob/dist/commonjs/pattern';
import { Options as SassOptions } from 'sass';
import { PreRenderedChunk } from 'rollup';
import { defineConfig, UserConfig } from 'vite';
import { glob } from 'glob';
import { stderr } from 'process';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const { nodeModulePath, realOutputPath, realSourcePath, vendorPath } = require('./vite.lib');

const config = {
    assetExtensions: {
        css: /css|less|scss/,
        js: /js|jsx|ts|tsx/
    },
    entryPoints: <GlobList>[
        'resources/ts/index.ts'
    ],
    resolveAliases: [
        { find: /^~/, replacement: path.join(__dirname, '/node_modules/') },
    ],
    resolveExternal: <RegExp[]> [],
    sourceMaps: process.env.NODE_ENV !== 'production',
    staticAssets: [],
};

export default defineConfig(({ command, mode, ssrBuild }): UserConfig => {
    return {
        resolve: {
            alias: config.resolveAliases,
        },
        server: {
            hmr: { host: 'localhost' },
        },
        build: {
            outDir: path.join(__dirname, 'public'),
            emptyOutDir: false,
            manifest: true,
            cssCodeSplit: true,
            rollupOptions: {
                external: config.resolveExternal,
                output: {
                    dir: 'public',
                    sourcemap: config.sourceMaps,
                },
            },
        },
        plugins: [
            viteStaticCopy({
                targets: config.staticAssets,
            }),
            laravel({
                input: glob.sync(config.entryPoints),
                refresh: {
                    paths: [
                        'app/**/*.php',
                        'resources/**/*.{php|js|ts|jsx|tsx|scss}',
                    ],
                },
            }),
            esbuild({
                exclude: /[^\0]/,
                target: ['esnext'],
            }),
            terser({
                ie8: true,
                module: true,
                sourceMap: config.sourceMaps
            }),
        ],
        css: {
            devSourcemap: config.sourceMaps,
            preprocessorOptions: {
                scss: <SassOptions<'sync' | 'async'>>{
                    sourceMap: config.sourceMaps,
                    style: config.sourceMaps ? 'expanded' : 'compressed',
                    verbose: true,
                },
            },
        },
    };
});
