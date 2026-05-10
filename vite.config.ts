
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
      // TODO: AI 서버에 CORS 설정 후 이 proxy 블록 삭제 필요
      proxy: {
        '/ai-api': {
          target: 'https://runthek-api.onrender.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ai-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // 타임아웃 2분 설정
              proxyReq.setTimeout(120000);
            });
            proxy.on('error', (err, _req, res) => {
              console.error('[Proxy Error]', err.message);
              if (res && 'writeHead' in res) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Proxy error: ' + err.message);
              }
            });
          },
        },
      },
    },
  });