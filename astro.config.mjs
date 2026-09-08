import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  adapter: vercel(),
});
