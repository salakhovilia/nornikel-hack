import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import packageJson from './package.json';

export default defineConfig(({ mode }) => {
    return {
        base: '/',
        build: {
            outDir: './build',
        },
        publicDir: './public',
        define: {
            'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
        },
        css: {
            modules: {
                generateScopedName: mode === 'development' ? '[name]__[local]__[hash:base64:5]' : '[hash:base64:8]',
            },
        },
        resolve: {
            alias: {
                '@domains': path.resolve(__dirname, './src/domains'),
                '@store': path.resolve(__dirname, './src/store'),
                '@api': path.resolve(__dirname, './src/api'),
                '@utils': path.resolve(__dirname, './src/utils'),
                '@components': path.resolve(__dirname, './src/components'),
                '@styles': path.resolve(__dirname, './src/styles'),
                '@assets': path.resolve(__dirname, './src/assets'),
            },
        },
        plugins: [react(), svgrPlugin()],
    };
});
