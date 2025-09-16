// src/controllers/persetujuanController.js
const { PrismaClient, StatusPersetujuan } = require('@prisma/client');
const prisma = new PrismaClient();

// Mendapatkan semua permintaan yang perlu persetujuan dari user yang sedang login
const getPendingPersetujuan = async (req, res) => {
    const userId = req.user.id;

    try {
        const pendingList = await prisma.persetujuan.findMany({
            where: {
                pemberiPersetujuanId: userId,
                status: StatusPersetujuan.PENDING
            },
            include: {
                peminjaman: {
                    include: {
                        peminjam: {
                            select: { nama_lengkap: true, nomor_induk: true }
                        },
                        ruangan: {
                            select: { nama_ruangan: true }
                        }
                    }
                }
            }
        });

        res.status(200).json(pendingList);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Mengubah status sebuah persetujuan (Menyetujui atau Menolak)
const updatePersetujuan = async (req, res) => {
    const { id } = req.params; // id dari record persetujuan
    const { status, komentar } = req.body; // 'DISETUJUI' atau 'DITOLAK'
    const userId = req.user.id;

    if (![StatusPersetujuan.DISETUJUI, StatusPersetujuan.DITOLAK].includes(status)) {
        return res.status(400).json({ message: 'Status tidak valid' });
    }

    try {
        const persetujuanId = parseInt(id);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update status persetujuan spesifik
            const updatedPersetujuan = await tx.persetujuan.updateMany({
                where: {
                    id: persetujuanId,
                    pemberiPersetujuanId: userId // Pastikan hanya user yg berhak yg bisa update
                },
                data: { status, komentar }
            });

            if (updatedPersetujuan.count === 0) {
                throw new Error('Persetujuan tidak ditemukan atau Anda tidak berhak mengubahnya.');
            }

            const persetujuan = await tx.persetujuan.findUnique({ where: { id: persetujuanId } });
            const peminjamanId = persetujuan.peminjamanId;

            // 2. Logika untuk update status peminjaman utama
            if (status === StatusPersetujuan.DITOLAK) {
                // Jika satu saja menolak, langsung tolak peminjaman utama
                await tx.peminjaman.update({
                    where: { id: peminjamanId },
                    data: { statusPeminjaman: StatusPersetujuan.DITOLAK }
                });
            } else { // Jika disetujui
                // Cek apakah semua persetujuan lain untuk peminjaman ini sudah disetujui
                const allPersetujuan = await tx.persetujuan.findMany({
                    where: { peminjamanId: peminjamanId }
                });

                const allApproved = allPersetujuan.every(p => p.status === StatusPersetujuan.DISETUJUI);

                if (allApproved) {
                    await tx.peminjaman.update({
                        where: { id: peminjamanId },
                        data: { statusPeminjaman: StatusPersetujuan.DISETUJUI }
                    });
                }
            }
            return updatedPersetujuan;
        });

        res.status(200).json({ message: `Persetujuan berhasil diubah menjadi ${status}` });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = { getPendingPersetujuan, updatePersetujuan };