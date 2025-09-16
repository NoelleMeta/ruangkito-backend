// src/controllers/peminjamanController.js
const { PrismaClient, JenisPeminjaman, Role } = require('@prisma/client');
const prisma = new PrismaClient();

const createPeminjaman = async (req, res) => {
    const {
        ruanganId,
        tujuan,
        jenisPeminjaman, // 'JAM_PENGGANTI' atau 'LAINNYA'
        waktuMulai,
        waktuSelesai,
        matkulPengganti, // Opsional, hanya untuk JAM_PENGGANTI
        dosenPengampu // Opsional, nama dosen untuk JAM_PENGGANTI
    } = req.body;

    const peminjamId = req.user.id; // Diambil dari middleware protect

    // Validasi input dasar
    if (!ruanganId || !tujuan || !jenisPeminjaman || !waktuMulai || !waktuSelesai) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try {
        const approvers = [];
        
        // Logic untuk menentukan siapa saja yang perlu menyetujui
        const kaprodi = await prisma.user.findFirst({
            where: { role: { has: Role.KAPRODI }, jurusanId: req.user.jurusanId }
        });

        if (!kaprodi) {
            return res.status(404).json({ message: 'Kaprodi untuk jurusan Anda tidak ditemukan.' });
        }

        if (jenisPeminjaman === JenisPeminjaman.LAINNYA) {
            approvers.push({ id: kaprodi.id, role: Role.KAPRODI });
        } else if (jenisPeminjaman === JenisPeminjaman.JAM_PENGGANTI) {
            if (!dosenPengampu) {
                return res.status(400).json({ message: 'Dosen pengampu wajib diisi untuk jam pengganti.' });
            }

            // Cari dosen berdasarkan nama
            const dosen = await prisma.user.findFirst({
                where: { nama_lengkap: dosenPengampu, role: { has: Role.DOSEN } }
            });
            if (!dosen) {
                return res.status(404).json({ message: `Dosen dengan nama ${dosenPengampu} tidak ditemukan.` });
            }

            // Cari ketua kelas (asumsi 1 ketua kelas per jurusan untuk penyederhanaan)
             const ketuaKelas = await prisma.user.findFirst({
                where: { role: { has: Role.KETUA_KELAS }, jurusanId: req.user.jurusanId }
            });
            if (!ketuaKelas) {
                return res.status(404).json({ message: 'Ketua Kelas untuk jurusan Anda tidak ditemukan.' });
            }

            approvers.push(
                { id: ketuaKelas.id, role: Role.KETUA_KELAS },
                { id: dosen.id, role: Role.DOSEN },
                { id: kaprodi.id, role: Role.KAPRODI }
            );
        }

        // Gunakan transaksi untuk memastikan semua data dibuat atau tidak sama sekali
        const result = await prisma.$transaction(async (tx) => {
            // 1. Buat record peminjaman
            const peminjaman = await tx.peminjaman.create({
                data: {
                    peminjamId,
                    ruanganId,
                    tujuan,
                    jenisPeminjaman,
                    waktuMulai: new Date(waktuMulai),
                    waktuSelesai: new Date(waktuSelesai),
                    matkulPengganti,
                    dosenPengampu,
                    statusPeminjaman: 'PENDING'
                }
            });

            // 2. Buat record persetujuan untuk setiap approver
            const persetujuanData = approvers.map(approver => ({
                peminjamanId: peminjaman.id,
                pemberiPersetujuanId: approver.id,
                rolePemberiPersetujuan: approver.role,
                status: 'PENDING'
            }));

            await tx.persetujuan.createMany({
                data: persetujuanData
            });

            return peminjaman;
        });

        res.status(201).json({ message: 'Permintaan peminjaman berhasil dibuat', data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI BARU UNTUK RIWAYAT PEMINJAMAN ---
const getMyPeminjaman = async (req, res) => {
    const peminjamId = req.user.id;
    try {
        const myBookings = await prisma.peminjaman.findMany({
            where: { peminjamId },
            include: {
                ruangan: {
                    select: {
                        nama_ruangan: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc', // Urutkan dari yang terbaru
            },
        });
        res.status(200).json(myBookings);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};


module.exports = { createPeminjaman, getMyPeminjaman }; // <-- Tambahkan getMyPeminjaman di sini