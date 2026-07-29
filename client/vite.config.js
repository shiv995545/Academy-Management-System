const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')
const path = require('path')

module.exports = defineConfig({
  root: path.resolve(__dirname),
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
