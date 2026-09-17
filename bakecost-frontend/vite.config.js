import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // SEGURIDAD: No exponer sourcemaps en producción.
    // Los sourcemaps permiten reconstruir el código fuente original
    // desde el bundle minificado, lo que facilita la ingeniería inversa.
    // En desarrollo, Vite genera sourcemaps automáticamente en memoria
    // sin necesidad de esta opción.
    sourcemap: false,
  },

  test: {
    // Vitest — entorno de testing integrado con Vite.
    // Documentación: https://vitest.dev/config/
    environment: 'node',    // los tests de servicios/utils no necesitan DOM
    globals: true,          // describe/it/expect disponibles sin import explícito
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/services/**'],
      exclude: ['src/services/api.js'],  // axios wrapper, no testeable sin mock de red
    },
  },
});
