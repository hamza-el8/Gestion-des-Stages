const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const seedData = require("./config/seed");

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/data", require("./routes/dataRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "StageFlow API is running" });
});

// Root
app.get("/", (req, res) => {
  res.json({ name: "StageFlow API", version: "1.0.0" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Seed demo data
  await seedData();

  app.listen(PORT, () => {
    console.log(`\n🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📦 API disponible sur http://localhost:${PORT}/api`);
    console.log(`🔑 Authentification : POST /api/auth/login`);
    console.log(`📊 Données protégées : /api/data (Bearer token requis)`);
  });
});