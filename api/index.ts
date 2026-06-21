import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// API Route - Health Check or fallback endpoints
app.get("/api/health", (req: any, res: any) => {
  res.json({ status: "ok", message: "Vercel serverless adapter is active." });
});

app.post("/api/ai-chat", (req: any, res: any) => {
  res.status(501).json({ error: "Fitur AI dinonaktifkan." });
});

app.post("/api/ai-autofill-estimate", (req: any, res: any) => {
  res.status(501).json({ error: "Fitur AI dinonaktifkan." });
});

export default app;
