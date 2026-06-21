import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API point
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is fully operational" });
  });

  // Placeholder APIs for compatibility (in case old clients still request them)
  app.post("/api/ai-chat", (req, res) => {
    res.status(501).json({ error: "Fitur AI dinonaktifkan." });
  });

  app.post("/api/ai-autofill-estimate", (req, res) => {
    res.status(501).json({ error: "Fitur AI dinonaktifkan." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
