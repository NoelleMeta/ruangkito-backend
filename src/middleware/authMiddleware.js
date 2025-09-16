// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { PrismaClient, Role } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
    let token;

    // Cek apakah header authorization ada dan berformat 'Bearer [token]'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Ambil token dari header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

            // 3. Ambil data user dari database (tanpa password) dan sisipkan ke object request
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: {
                    id: true,
                    nomor_induk: true,
                    nama_lengkap: true,
                    role: true,
                    jurusanId: true
                }
            });
            
            if (!req.user) {
                return res.status(401).json({ message: 'User tidak ditemukan' });
            }

            next(); // Lanjutkan ke controller/route selanjutnya
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Tidak terotorisasi, token gagal' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Tidak terotorisasi, tidak ada token' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Tidak terotorisasi' });
        }

        // Cek jika ada peran pengguna yang cocok dengan peran yang diizinkan
        const hasRole = req.user.role.some(userRole => allowedRoles.includes(userRole));
        if (!hasRole) {
            return res.status(403).json({ message: 'Akses ditolak: role tidak memiliki izin' });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles, Role };