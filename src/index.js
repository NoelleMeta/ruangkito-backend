// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

// Import semua rute
const authRoutes = require("./routes/authRoutes");
const ruanganRoutes = require("./routes/ruanganRoutes");
const peminjamanRoutes = require("./routes/peminjamanRoutes");
const persetujuanRoutes = require("./routes/persetujuanRoutes");
const adminRoutes = require("./routes/adminRoutes");
const jadwalKuliahRoutes = require("./routes/jadwalKuliahRoutes"); // <-- TAMBAHKAN

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Alamat frontend React Vite
    credentials: true, // Mengizinkan credentials (cookies, authorization headers)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Requested-With", "Access-Control-Allow-Origin"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
// Handle preflight requests dan log semua request untuk debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Headers:`, req.headers);
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
  } else {
    next();
  }
});
app.use(express.json());

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Peminjaman Ruangan API Documentation",
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("API Server Peminjaman Ruangan is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api", ruanganRoutes);
app.use("/api/peminjaman", peminjamanRoutes); // Perubahan di sini
app.use("/api/persetujuan", persetujuanRoutes);
app.use("/api", adminRoutes);
app.use("/api", jadwalKuliahRoutes); // <-- TAMBAHKAN

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
