import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            include: ['buffer', 'crypto', 'stream', 'process'],
            globals: { Buffer: true, process: true },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@casino/shared': path.resolve(__dirname, '../../packages/shared'),
            '@casino/fairness': path.resolve(__dirname, '../../packages/fairness'),
        },
    },
    server: {
        port: 3000,
    },
});
