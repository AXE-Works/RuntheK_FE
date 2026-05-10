
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'figma:asset/f22cd6caca8a6adcf9d14066d71db254d1dd3efe.png': path.resolve(__dirname, './src/assets/f22cd6caca8a6adcf9d14066d71db254d1dd3efe.png'),
        'figma:asset/edd8bddbbfd9997ba5938d1c59bdcc8624994fe5.png': path.resolve(__dirname, './src/assets/edd8bddbbfd9997ba5938d1c59bdcc8624994fe5.png'),
        'figma:asset/e6df51e2fef0e90e4a5b9ec74fca2b279396ff66.png': path.resolve(__dirname, './src/assets/e6df51e2fef0e90e4a5b9ec74fca2b279396ff66.png'),
        'figma:asset/cdcf6aef6f5dc59877b72eb14c6d627b81215bb0.png': path.resolve(__dirname, './src/assets/cdcf6aef6f5dc59877b72eb14c6d627b81215bb0.png'),
        'figma:asset/c88481014a08b2a567aac1cec80b7c426b09e07e.png': path.resolve(__dirname, './src/assets/c88481014a08b2a567aac1cec80b7c426b09e07e.png'),
        'figma:asset/bf25e33d83d38f05091debda15180d433fd641f7.png': path.resolve(__dirname, './src/assets/bf25e33d83d38f05091debda15180d433fd641f7.png'),
        'figma:asset/b940caf9f3a52bcc9317c793ebc094db911b237b.png': path.resolve(__dirname, './src/assets/b940caf9f3a52bcc9317c793ebc094db911b237b.png'),
        'figma:asset/b0ebadcb106092f3870013d41b944d17ad62cc07.png': path.resolve(__dirname, './src/assets/b0ebadcb106092f3870013d41b944d17ad62cc07.png'),
        'figma:asset/ade16fc310679880d8b27a51a4119372559298ac.png': path.resolve(__dirname, './src/assets/ade16fc310679880d8b27a51a4119372559298ac.png'),
        'figma:asset/a70139183377d3b29d32b52ddb5e92d8d08643a1.png': path.resolve(__dirname, './src/assets/a70139183377d3b29d32b52ddb5e92d8d08643a1.png'),
        'figma:asset/9dd419fc9efa1fe8c3d879dbc5999eb7b1e56b0b.png': path.resolve(__dirname, './src/assets/9dd419fc9efa1fe8c3d879dbc5999eb7b1e56b0b.png'),
        'figma:asset/829b223a519c61d51eb440aff46c5258b749cc2b.png': path.resolve(__dirname, './src/assets/829b223a519c61d51eb440aff46c5258b749cc2b.png'),
        'figma:asset/7ff527a942cb2aee7f6ba7d6ee1f7e7728027265.png': path.resolve(__dirname, './src/assets/7ff527a942cb2aee7f6ba7d6ee1f7e7728027265.png'),
        'figma:asset/7a69d9c6cfa5fcbe36b303df9ffda1b6ffcbfa6c.png': path.resolve(__dirname, './src/assets/7a69d9c6cfa5fcbe36b303df9ffda1b6ffcbfa6c.png'),
        'figma:asset/79d4f6cc74be928a57c88c53b40db6b2d3cd95de.png': path.resolve(__dirname, './src/assets/79d4f6cc74be928a57c88c53b40db6b2d3cd95de.png'),
        'figma:asset/65307f82f4edd39f235fd1f1c4447f0260c9ff0b.png': path.resolve(__dirname, './src/assets/65307f82f4edd39f235fd1f1c4447f0260c9ff0b.png'),
        'figma:asset/51a5e2a1c117384317beaacc6d491ec9b013de97.png': path.resolve(__dirname, './src/assets/51a5e2a1c117384317beaacc6d491ec9b013de97.png'),
        'figma:asset/4698b69be884fac981643b6f568e9afcc8cc3f35.png': path.resolve(__dirname, './src/assets/4698b69be884fac981643b6f568e9afcc8cc3f35.png'),
        'figma:asset/441b7c322663b0c22bc75be1f0b9d085555f709d.png': path.resolve(__dirname, './src/assets/441b7c322663b0c22bc75be1f0b9d085555f709d.png'),
        'figma:asset/3a1a22d8b95ada8e9dda55dbabda0c9a7fb403c6.png': path.resolve(__dirname, './src/assets/3a1a22d8b95ada8e9dda55dbabda0c9a7fb403c6.png'),
        'figma:asset/2837fdead800498e4b0136649e9bfa4bce6e67ea.png': path.resolve(__dirname, './src/assets/2837fdead800498e4b0136649e9bfa4bce6e67ea.png'),
        'figma:asset/20f8bd4d4ddb5c475cf341190cd31810e72b8a55.png': path.resolve(__dirname, './src/assets/20f8bd4d4ddb5c475cf341190cd31810e72b8a55.png'),
        'figma:asset/177ddc65e5d8b8b62892207d206d125838f7503f.png': path.resolve(__dirname, './src/assets/177ddc65e5d8b8b62892207d206d125838f7503f.png'),
        'figma:asset/16c6d9d81e462eeee89276924c168639e5d98eac.png': path.resolve(__dirname, './src/assets/16c6d9d81e462eeee89276924c168639e5d98eac.png'),
        'figma:asset/07a246916133d7895f5afd801bc625394df51dc8.png': path.resolve(__dirname, './src/assets/07a246916133d7895f5afd801bc625394df51dc8.png'),
        'figma:asset/068b706a31429220d8c8a8addc0507812913b6b6.png': path.resolve(__dirname, './src/assets/068b706a31429220d8c8a8addc0507812913b6b6.png'),
        'figma:asset/0687bfed68092d1b067490d6a2f911735a24b16f.png': path.resolve(__dirname, './src/assets/0687bfed68092d1b067490d6a2f911735a24b16f.png'),
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