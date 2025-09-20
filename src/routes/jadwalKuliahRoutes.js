// src/routes/jadwalKuliahRoutes.js
const express = require("express");
const { getMataKuliahByJurusan } = require("../controllers/jadwalKuliahController");
const { protect } = require("../middleware/authMiddleware"); // Impor middleware 'protect'

const router = express.Router();

// PERBAIKAN: Amankan rute ini dengan middleware 'protect'
// sehingga hanya user yang sudah login yang bisa mengakses
router.get("/jadwal-kuliah/mata-kuliah", protect, getMataKuliahByJurusan);

module.exports = router;
