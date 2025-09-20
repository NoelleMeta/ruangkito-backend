// src/routes/peminjamanRoutes.js
const express = require("express");
const { createPeminjaman, getMyPeminjaman, getAllPeminjaman, deletePeminjaman } = require("../controllers/peminjamanController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/peminjaman:
 *   post:
 *     summary: Membuat permintaan peminjaman ruangan baru
 *     tags: [Peminjaman]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ruanganId
 *               - tujuan
 *               - jenisPeminjaman
 *               - waktuMulai
 *               - waktuSelesai
 *             properties:
 *               ruanganId:
 *                 type: integer
 *                 description: ID ruangan yang ingin dipinjam
 *                 example: 1
 *               tujuan:
 *                 type: string
 *                 description: Tujuan peminjaman ruangan
 *                 example: "Kuliah mata kuliah Algoritma"
 *               jenisPeminjaman:
 *                 type: string
 *                 enum: [JAM_PENGGANTI, LAINNYA]
 *                 description: Jenis peminjaman
 *                 example: "JAM_PENGGANTI"
 *               waktuMulai:
 *                 type: string
 *                 format: date-time
 *                 description: Waktu mulai peminjaman (format ISO 8601)
 *                 example: "2024-01-15T10:00:00.000Z"
 *               waktuSelesai:
 *                 type: string
 *                 format: date-time
 *                 description: Waktu selesai peminjaman (format ISO 8601)
 *                 example: "2024-01-15T12:00:00.000Z"
 *               matkulPengganti:
 *                 type: string
 *                 description: Mata kuliah pengganti (wajib untuk JAM_PENGGANTI)
 *                 example: "Algoritma dan Struktur Data"
 *               dosenPengampu:
 *                 type: string
 *                 description: Nama dosen pengampu (wajib untuk JAM_PENGGANTI)
 *                 example: "Dr. John Doe"
 *     responses:
 *       201:
 *         description: Permintaan peminjaman berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permintaan peminjaman berhasil dibuat
 *                 data:
 *                   $ref: '#/components/schemas/Peminjaman'
 *       400:
 *         description: Data tidak valid atau ruangan tidak tersedia
 *       401:
 *         description: Token tidak valid atau tidak ada
 *       500:
 *         description: Server error
 */
router.post("/", protect, createPeminjaman);

/**
 * @swagger
 * /api/peminjaman/saya:
 *   get:
 *     summary: Mendapatkan riwayat peminjaman user yang sedang login
 *     tags: [Peminjaman]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Riwayat peminjaman berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Peminjaman'
 *       401:
 *         description: Token tidak valid atau tidak ada
 *       500:
 *         description: Server error
 */
// --- RUTE BARU UNTUK RIWAYAT ---
router.get("/saya", protect, getMyPeminjaman);

/**
 * @swagger
 * /api/peminjaman/all:
 *   get:
 *     summary: Mendapatkan semua data peminjaman sesuai role pengguna
 *     tags: [Peminjaman]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data peminjaman berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Peminjaman'
 *       401:
 *         description: Token tidak valid atau tidak ada
 *       403:
 *         description: Tidak memiliki akses
 *       500:
 *         description: Server error
 */
router.get("/all", protect, getAllPeminjaman);

/**
 * @swagger
 * /api/peminjaman/{id}:
 *   delete:
 *     summary: Menghapus data peminjaman (hanya untuk admin)
 *     tags: [Peminjaman]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID peminjaman yang akan dihapus
 *     responses:
 *       200:
 *         description: Peminjaman berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak ada
 *       403:
 *         description: Tidak memiliki akses admin
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, deletePeminjaman);

module.exports = router;
