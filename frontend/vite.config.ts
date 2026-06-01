import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_")

  const claimsTarget = env.VITE_CLAIMS_API_URL || "http://localhost:3000"
  const auditTarget  = env.VITE_AUDIT_API_URL   || "http://localhost:3001"
  const userTarget   = env.VITE_USER_API_URL    || "http://localhost:3002"
  const objectTarget = env.VITE_OBJECT_API_URL  || "http://localhost:3003"

  const stripApi = (p: string) => p.replace(/^\/api/, "")

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "src": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/objects": {
          target: objectTarget,
          changeOrigin: true,
          rewrite: stripApi,
        },
        "/api/claims": {
          target: claimsTarget,
          changeOrigin: true,
          rewrite: stripApi,
        },
        "/api/users": {
          target: userTarget,
          changeOrigin: true,
          rewrite: stripApi,
        },
        "/api/audit-log": {
          target: auditTarget,
          changeOrigin: true,
          rewrite: stripApi,
        },
        "/api/stats": {
          target: claimsTarget,
          changeOrigin: true,
          rewrite: stripApi,
        },
      },
    },
  }
})
