
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el sistema (Vercel) o archivos .env
  // FIX: Cast process to NodeJS.Process to resolve TypeScript error for 'cwd'.
  const env = loadEnv(mode, (process as NodeJS.Process).cwd(), '');
  
  return {
    plugins: [react()],
    base: '/.builds/source/repository/', // <-- Ajusta esta ruta si tu despliegue en Hostinger está en un subdirectorio diferente
    define: {
      // Define 'process.env' para evitar errores de referencia en el navegador
      // y expone la API_KEY de forma segura.
      'process.env': {
        API_KEY: env.API_KEY
      }
    }
  }
})