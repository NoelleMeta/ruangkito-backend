// src/routes/ruanganRoutes.js
const express = require('express');
const { getAvailableRooms } = require('../controllers/ruanganController');
const router = express.Router();

/**
 * @swagger
 * /api/ruangan/available:
 *   get:
 *     summary: Mendapatkan daftar ruangan yang tersedia
 *     tags: [Ruangan]
 *     parameters:
 *       - in: query
 *         name: hari
 *         required: true
 *         schema:
 *           type: string
 *           enum: [senin, selasa, rabu, kamis, jumat, sabtu, minggu]
 *         description: Hari yang ingin dicek ketersediaannya
 *         example: senin
 *       - in: query
 *         name: jam_mulai
 *         required: true
 *         schema:
 *           type: string
 *           format: time
 *         description: Jam mulai peminjaman (format HH:MM)
 *         example: "10:00"
 *       - in: query
 *         name: jam_selesai
 *         required: true
 *         schema:
 *           type: string
 *           format: time
 *         description: Jam selesai peminjaman (format HH:MM)
 *         example: "12:00"
 *     responses:
 *       200:
 *         description: Daftar ruangan tersedia berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ruangan'
 *       400:
 *         description: Parameter tidak valid
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
// contoh: GET /api/ruangan/available?hari=senin&jam_mulai=10:00&jam_selesai=12:00
router.get('/ruangan/available', getAvailableRooms);

module.exports = router;