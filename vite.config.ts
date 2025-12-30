
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el sistema (Vercel) o archivos .env
  // FIX: Removed explicit type assertion for process, as 'process' is a global in Node.js environments like vite.config.ts.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    base: '/', // <-- Cambiado a '/' para despliegues en la raíz del dominio
    define: {
      // Define 'process.env' para evitar errores de referencia en el navegador
      // y expone la API_KEY de forma segura.
      'process.env': {
        API_KEY: env.API_KEY
      }
    }
  }
})