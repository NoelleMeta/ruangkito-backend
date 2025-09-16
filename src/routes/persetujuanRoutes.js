// src/routes/persetujuanRoutes.js
const express = require('express');
const { getPendingPersetujuan, updatePersetujuan } = require('../controllers/persetujuanController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Semua rute di file ini dilindungi
router.use(protect);

/**
 * @swagger
 * /api/persetujuan/pending:
 *   get:
 *     summary: Mendapatkan daftar permintaan persetujuan yang pending
 *     tags: [Persetujuan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar permintaan persetujuan berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Persetujuan'
 *                   - type: object
 *                     properties:
 *                       peminjaman:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Peminjaman'
 *                           - type: object
 *                             properties:
 *                               peminjam:
 *                                 type: object
 *                                 properties:
 *                                   nama_lengkap:
 *                                     type: string
 *                                   nomor_induk:
 *                                     type: string
 *                               ruangan:
 *                                 type: object
 *                                 properties:
 *                                   nama_ruangan:
 *                                     type: string
 *       401:
 *         description: Token tidak valid atau tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /api/persetujuan/pending -> Lihat permintaan persetujuan
router.get('/persetujuan/pending', getPendingPersetujuan);

/**
 * @swagger
 * /api/persetujuan/{id}:
 *   put:
 *     summary: Update status persetujuan peminjaman
 *     tags: [Persetujuan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID peminjaman
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DISETUJUI, DITOLAK]
 *                 description: Status persetujuan
 *                 example: DISETUJUI
 *               komentar:
 *                 type: string
 *                 description: Komentar persetujuan (opsional)
 *                 example: "Ruangan disetujui untuk digunakan"
 *     responses:
 *       200:
 *         description: Status persetujuan berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Persetujuan berhasil diubah menjadi DISETUJUI
 *       400:
 *         description: Data tidak valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token tidak valid atau tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Peminjaman tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// PUT /api/persetujuan/:id -> Update status persetujuan
router.put('/persetujuan/:id', updatePersetujuan);


module.exports = router;