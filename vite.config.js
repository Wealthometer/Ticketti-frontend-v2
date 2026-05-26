import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/ticketii/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://ticketii.com.ng/ticketii",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
