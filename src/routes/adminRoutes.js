// src/routes/adminRoutes.js
const express = require('express');
const {
	listUsers, createUser, updateUser, deleteUser,
	listJurusan, createJurusan, updateJurusan, deleteJurusan,
	listRuangan, createRuangan, updateRuangan, deleteRuangan,
	listJadwal, createJadwal, updateJadwal, deleteJadwal
} = require('../controllers/adminController');
const { protect, authorizeRoles, Role } = require('../middleware/authMiddleware');

const router = express.Router();

// Semua endpoint admin dilindungi dan hanya untuk ADMIN
router.use(protect, authorizeRoles(Role.ADMIN));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Mendapatkan daftar semua pengguna
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Token tidak valid atau tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Akses ditolak, hanya admin yang bisa mengakses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Membuat pengguna baru
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomor_induk
 *               - nama_lengkap
 *               - password
 *               - role
 *             properties:
 *               nomor_induk:
 *                 type: string
 *                 description: Nomor induk pengguna
 *                 example: "1234567890"
 *               nama_lengkap:
 *                 type: string
 *                 description: Nama lengkap pengguna
 *                 example: "John Doe"
 *               password:
 *                 type: string
 *                 description: Password pengguna
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [MAHASISWA, DOSEN, KAPRODI, KETUA_KELAS, ADMIN]
 *                 description: Role pengguna
 *                 example: "MAHASISWA"
 *               jurusanId:
 *                 type: integer
 *                 description: ID jurusan (opsional, null untuk admin)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pengguna berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID pengguna yang baru dibuat
 *                   example: 1
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
 *       403:
 *         description: Akses ditolak, hanya admin yang bisa mengakses
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Users
router.get('/admin/users', listUsers);
router.post('/admin/users', createUser);
router.put('/admin/users/:id', updateUser);
router.delete('/admin/users/:id', deleteUser);

// Jurusan
router.get('/admin/jurusan', listJurusan);
router.post('/admin/jurusan', createJurusan);
router.put('/admin/jurusan/:id', updateJurusan);
router.delete('/admin/jurusan/:id', deleteJurusan);

/**
 * @swagger
 * /api/admin/ruangan:
 *   get:
 *     summary: Mendapatkan daftar semua ruangan
 *     tags: [Admin - Ruangan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar ruangan berhasil didapatkan
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ruangan'
 *   post:
 *     summary: Membuat ruangan baru
 *     tags: [Admin - Ruangan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kode_ruangan
 *               - nama_ruangan
 *               - jenis_ruangan
 *             properties:
 *               kode_ruangan:
 *                 type: string
 *                 description: Kode ruangan
 *                 example: "LAB001"
 *               nama_ruangan:
 *                 type: string
 *                 description: Nama ruangan
 *                 example: "Lab Komputer 1"
 *               jenis_ruangan:
 *                 type: string
 *                 description: Jenis ruangan
 *                 example: "Lab"
 *     responses:
 *       201:
 *         description: Ruangan berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ruangan'
 */
// Ruangan
router.get('/admin/ruangan', listRuangan);
router.post('/admin/ruangan', createRuangan);
router.put('/admin/ruangan/:id', updateRuangan);
router.delete('/admin/ruangan/:id', deleteRuangan);

// Jadwal Kuliah
router.get('/admin/jadwal', listJadwal);
router.post('/admin/jadwal', createJadwal);
router.put('/admin/jadwal/:id', updateJadwal);
router.delete('/admin/jadwal/:id', deleteJadwal);

module.exports = router;


