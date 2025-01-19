import { vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';
import * as dotenv from 'dotenv';

dotenv.config();

const getGitHash = () => {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'no-git-info';
  }
};

export default defineConfig(({ command, mode }) => {
  return {
    define: {
      __COMMIT_HASH: JSON.stringify(getGitHash()),
      __APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    build: {
      target: 'esnext',
      minify: mode === 'production',
      rollupOptions: {
        input: command === 'build' ? undefined : {
          entry: './app/entry.client.tsx',
        },
      },
    },
    plugins: [
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
          v3_singleFetch: true
        },
      }),
      UnoCSS(),
      tsconfigPaths(),
      nodePolyfills({
        include: ['path', 'buffer', 'process'],
      }),
      mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ].filter(Boolean),
    appType: 'custom',
    envPrefix: ["VITE_","OPENAI_LIKE_API_BASE_URL", "OLLAMA_API_BASE_URL", "LMSTUDIO_API_BASE_URL","TOGETHER_API_BASE_URL"],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
      modules: {
        localsConvention: 'camelCaseOnly',
      }
    },
    ssr: {
      target: 'node',
      noExternal: ['@remix-run/*', 'react-toastify', 'remix-utils']
    },
    optimizeDeps: {
      include: ['react-toastify', 'remix-utils']
    }
  };
});
