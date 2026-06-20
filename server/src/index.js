import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import eventRoutes from "./routes/events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware ──────────────────────────────────────────────────

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

app.use("/tracker", express.static(path.join(__dirname, "../../tracker")));

app.use("/demo", express.static(path.join(__dirname, "../../demo")));

app.use("/api", eventRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`  Dashboard API: http://localhost:${PORT}/api`);
    console.log(`  Demo pages: http://localhost:${PORT}/demo`);
    console.log(
      `  Tracker script: http://localhost:${PORT}/tracker/cf-tracker.js\n`,
    );
  });
})();
