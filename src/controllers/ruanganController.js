// src/controllers/ruanganController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAvailableRooms = async (req, res) => {
    const { hari, jam_mulai, jam_selesai } = req.query;

    if (!hari || !jam_mulai || !jam_selesai) {
        return res.status(400).json({ message: 'Parameter hari, jam_mulai, dan jam_selesai dibutuhkan' });
    }

    try {
        // 1. Ambil semua ruangan
        const allRooms = await prisma.ruangan.findMany();

        // 2. Cari ruangan yang terpakai oleh Jadwal Kuliah pada hari dan jam tersebut
        const usedBySchedule = await prisma.jadwalKuliah.findMany({
            where: {
                hari: {
                    equals: hari.toLowerCase(),
                },
                // Logika overlap waktu
                NOT: [
                    { selesai: { lte: jam_mulai } }, // Selesai sebelum atau sama dengan jam mulai cari
                    { mulai: { gte: jam_selesai } },   // Mulai setelah atau sama dengan jam selesai cari
                ],
            },
            select: {
                ruanganId: true,
            },
        });

        // 3. (Untuk nanti) Cari ruangan yang terpakai oleh Peminjaman yang sudah DISETUJUI
        //    Saat ini kita belum implementasi peminjaman, jadi kita lewati dulu.
        //    const usedByBooking = await prisma.peminjaman.findMany({...})

        const usedRoomIds = new Set(usedBySchedule.map(j => j.ruanganId));
        
        // 4. Filter ruangan yang tersedia
        const availableRooms = allRooms.filter(room => !usedRoomIds.has(room.id));

        res.status(200).json(availableRooms);

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = { getAvailableRooms };