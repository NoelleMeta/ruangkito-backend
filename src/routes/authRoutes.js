// src/routes/authRoutes.js
const express = require('express');
const { loginUser } = require('../controllers/authController');
const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomor_induk
 *               - password
 *             properties:
 *               nomor_induk:
 *                 type: string
 *                 description: Nomor induk pengguna
 *                 example: "1234567890"
 *               password:
 *                 type: string
 *                 description: Password pengguna
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login berhasil
 *                 token:
 *                   type: string
 *                   description: JWT token untuk autentikasi
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Password salah
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Nomor induk tidak ditemukan
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
router.post('/login', loginUser);

module.exports = router;