import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el sistema (Vercel) o archivos .env
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Define 'process.env' para evitar errores de referencia en el navegador
      // y expone la API_KEY de forma segura.
      'process.env': {
        API_KEY: env.API_KEY
      }
    }
  }
})