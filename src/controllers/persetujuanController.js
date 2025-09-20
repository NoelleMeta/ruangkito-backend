// src/controllers/persetujuanController.js
const { PrismaClient, StatusPersetujuan, Role } = require("@prisma/client");
const prisma = new PrismaClient();

// Mendapatkan semua permintaan yang perlu persetujuan dari user yang sedang login
const getPendingPersetujuan = async (req, res) => {
  const user = req.user;

  try {
    let queryOptions = {
      include: {
        peminjaman: {
          include: {
            peminjam: {
              select: { nama_lengkap: true, nomor_induk: true, jurusan: true },
            },
            ruangan: {
              select: { nama_ruangan: true },
            },
          },
        },
        pemberiPersetujuan: {
          select: { nama_lengkap: true, role: true },
        },
      },
      orderBy: {
        peminjaman: {
          createdAt: "desc",
        },
      },
    };

    // Jika user adalah admin, tampilkan semua data peminjaman
    if (user.role.includes(Role.ADMIN)) {
      // Untuk admin, tidak perlu 'where' clause, ambil semua
    } else {
      // PERBAIKAN: Bangun kondisi 'OR' untuk user dengan multi-peran (DOSEN, KAPRODI, KETUA_KELAS)
      const whereConditions = [];

      if (user.role.includes(Role.DOSEN)) {
        whereConditions.push({
          pemberiPersetujuanId: user.id,
          rolePemberiPersetujuan: Role.DOSEN,
        });
      }
      if (user.role.includes(Role.KAPRODI)) {
        whereConditions.push({
          pemberiPersetujuanId: user.id,
          rolePemberiPersetujuan: Role.KAPRODI,
        });
      }
      if (user.role.includes(Role.KETUA_KELAS)) {
        whereConditions.push({
          pemberiPersetujuanId: user.id,
          rolePemberiPersetujuan: Role.KETUA_KELAS,
        });
      }

      // Jika user punya salah satu peran di atas, tambahkan kondisi 'where'
      if (whereConditions.length > 0) {
        queryOptions.where = { OR: whereConditions };
      } else {
        // Jika user tidak punya peran pemberi persetujuan, kembalikan array kosong
        return res.status(200).json([]);
      }
    }

    const pendingList = await prisma.persetujuan.findMany(queryOptions);
    res.status(200).json(pendingList);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Mengubah status sebuah persetujuan (Menyetujui atau Menolak)
const updatePersetujuan = async (req, res) => {
  const { id } = req.params; // id dari record persetujuan
  const { status, komentar } = req.body; // 'DISETUJUI' atau 'DITOLAK'
  const userId = req.user.id;

  if (![StatusPersetujuan.DISETUJUI, StatusPersetujuan.DITOLAK].includes(status)) {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  try {
    const persetujuanId = parseInt(id);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update status persetujuan spesifik
      const updatedPersetujuan = await tx.persetujuan.updateMany({
        where: {
          id: persetujuanId,
          pemberiPersetujuanId: userId, // Pastikan hanya user yg berhak yg bisa update
        },
        data: { status, komentar },
      });

      if (updatedPersetujuan.count === 0) {
        throw new Error("Persetujuan tidak ditemukan atau Anda tidak berhak mengubahnya.");
      }

      const persetujuan = await tx.persetujuan.findUnique({ where: { id: persetujuanId } });
      const peminjamanId = persetujuan.peminjamanId;

      // 2. Logika untuk update status peminjaman utama
      if (status === StatusPersetujuan.DITOLAK) {
        // Jika satu saja menolak, langsung tolak peminjaman utama
        await tx.peminjaman.update({
          where: { id: peminjamanId },
          data: { statusPeminjaman: StatusPersetujuan.DITOLAK },
        });

        // Update semua persetujuan lain yang masih PENDING menjadi DITOLAK
        await tx.persetujuan.updateMany({
          where: {
            peminjamanId: peminjamanId,
            status: StatusPersetujuan.PENDING,
          },
          data: {
            status: StatusPersetujuan.DITOLAK,
            komentar: komentar ? `Otomatis ditolak karena sudah ditolak oleh role lain. Alasan: ${komentar}` : "Otomatis ditolak karena sudah ditolak oleh role lain.",
          },
        });
      } else {
        // Jika disetujui
        // Cek apakah semua persetujuan lain untuk peminjaman ini sudah disetujui
        const allPersetujuan = await tx.persetujuan.findMany({
          where: { peminjamanId: peminjamanId },
        });

        const allApproved = allPersetujuan.every((p) => p.status === StatusPersetujuan.DISETUJUI);

        if (allApproved) {
          await tx.peminjaman.update({
            where: { id: peminjamanId },
            data: { statusPeminjaman: StatusPersetujuan.DISETUJUI },
          });
        }
      }
      return updatedPersetujuan;
    });

    res.status(200).json({ message: `Persetujuan berhasil diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

module.exports = { getPendingPersetujuan, updatePersetujuan };
