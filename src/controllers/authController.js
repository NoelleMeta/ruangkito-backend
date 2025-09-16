// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const loginUser = async (req, res) => {
    const { nomor_induk, password } = req.body;

    try {
        // 1. Cari user berdasarkan nomor induk
        const user = await prisma.user.findUnique({
            where: { nomor_induk },
        });

        if (!user) {
            return res.status(404).json({ message: 'Nomor induk tidak ditemukan' });
        }

        // 2. Bandingkan password yang diinput dengan yang ada di database
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // 3. Buat JWT Token
        const tokenPayload = {
            id: user.id,
            nomor_induk: user.nomor_induk,
            nama_lengkap: user.nama_lengkap,
            role: user.role,
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'your_secret_key', {
            expiresIn: '1d', // Token berlaku 1 hari
        });

        // 4. Kirim response
        res.status(200).json({
            message: 'Login berhasil',
            token: token,
            user: tokenPayload
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = { loginUser };