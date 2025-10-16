import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: { resolve: true, entry: 'src/index.ts' },
  noExternal: ['your-problematic-package'],
  skipNodeModulesBundle: true,
  sourcemap: true,
  minify: false,
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  tsconfig: './tsconfig.production.json',
})
