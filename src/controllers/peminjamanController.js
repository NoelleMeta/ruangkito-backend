// src/controllers/peminjamanController.js
const { PrismaClient, JenisPeminjaman, Role } = require("@prisma/client");
const prisma = new PrismaClient();

const createPeminjaman = async (req, res) => {
  const {
    ruanganId,
    tujuan,
    jenisPeminjaman, // 'JAM_PENGGANTI' atau 'LAINNYA'
    waktuMulai,
    waktuSelesai,
    matkulPengganti, // Opsional, hanya untuk JAM_PENGGANTI
    dosenPengampu, // Opsional, nama dosen untuk JAM_PENGGANTI
  } = req.body;

  const peminjam = req.user; // Diambil dari middleware protect

  // Validasi input dasar
  if (!ruanganId || !jenisPeminjaman || !waktuMulai || !waktuSelesai) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  // Validasi tujuan hanya jika bukan JAM_PENGGANTI
  if (jenisPeminjaman !== JenisPeminjaman.JAM_PENGGANTI && !tujuan) {
    return res.status(400).json({ message: "Tujuan peminjaman wajib diisi" });
  }

  try {
    const approvers = [];

    const kaprodi = await prisma.user.findFirst({
      where: { role: { has: Role.KAPRODI }, jurusanId: peminjam.jurusanId },
    });

    if (!kaprodi) {
      return res.status(404).json({ message: "Kaprodi untuk jurusan Anda tidak ditemukan." });
    }

    if (jenisPeminjaman === JenisPeminjaman.LAINNYA) {
      approvers.push({ id: kaprodi.id, role: Role.KAPRODI });
    } else if (jenisPeminjaman === JenisPeminjaman.JAM_PENGGANTI) {
      if (!matkulPengganti || !dosenPengampu) {
        return res.status(400).json({ message: "Mata kuliah pengganti dan dosen pengampu wajib diisi untuk jam pengganti." });
      }

      const dosen = await prisma.user.findFirst({
        where: { nama_lengkap: dosenPengampu, role: { has: Role.DOSEN } },
      });
      if (!dosen) {
        return res.status(404).json({ message: `Dosen dengan nama ${dosenPengampu} tidak ditemukan.` });
      }

      // --- PERUBAHAN LOGIKA PENCARIAN KETUA KELAS ---
      // Memastikan ketua kelas yang dipilih harus seangkatan dan sejurusan dengan mahasiswa peminjam
      if (!peminjam.angkatan) {
        return res.status(400).json({ message: "Data angkatan Anda tidak tersedia. Silakan hubungi admin." });
      }

      if (!peminjam.jurusanId) {
        return res.status(400).json({ message: "Data jurusan Anda tidak tersedia. Silakan hubungi admin." });
      }

      // Cari ketua kelas yang sejurusan dan seangkatan dengan peminjam
      const ketuaKelas = await prisma.user.findFirst({
        where: {
          role: { has: Role.KETUA_KELAS },
          jurusanId: peminjam.jurusanId, // Harus sejurusan dengan peminjam
          angkatan: peminjam.angkatan, // Harus seangkatan dengan peminjam
        },
      });

      if (!ketuaKelas) {
        return res.status(404).json({
          message: `Ketua Kelas untuk jurusan dan angkatan Anda tidak ditemukan. Silakan hubungi admin.`,
        });
      }

      approvers.push({ id: ketuaKelas.id, role: Role.KETUA_KELAS }, { id: dosen.id, role: Role.DOSEN }, { id: kaprodi.id, role: Role.KAPRODI });
    }

    const result = await prisma.$transaction(async (tx) => {
      const peminjaman = await tx.peminjaman.create({
        data: {
          peminjamId: peminjam.id,
          ruanganId,
          tujuan,
          jenisPeminjaman,
          waktuMulai: new Date(waktuMulai),
          waktuSelesai: new Date(waktuSelesai),
          matkulPengganti,
          dosenPengampu,
          statusPeminjaman: "PENDING",
        },
      });

      const persetujuanData = approvers.map((approver) => ({
        peminjamanId: peminjaman.id,
        pemberiPersetujuanId: approver.id,
        rolePemberiPersetujuan: approver.role,
        status: "PENDING",
      }));

      await tx.persetujuan.createMany({
        data: persetujuanData,
      });

      return peminjaman;
    });

    res.status(201).json({ message: "Permintaan peminjaman berhasil dibuat", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

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
        createdAt: "desc",
      },
    });
    res.status(200).json(myBookings);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Mendapatkan semua data peminjaman berdasarkan role
const getAllPeminjaman = async (req, res) => {
  const user = req.user;

  try {
    let peminjaman = [];
    let whereClause = {};

    // Filter berdasarkan role
    if (user.role.includes(Role.ADMIN)) {
      // Admin dapat melihat semua peminjaman
      whereClause = {};
    } else if (user.role.includes(Role.DOSEN)) {
      // Dosen hanya melihat peminjaman yang memerlukan persetujuannya
      peminjaman = await prisma.peminjaman.findMany({
        where: {
          dosenPengampu: user.nama_lengkap,
        },
        include: {
          peminjam: {
            select: {
              nama_lengkap: true,
              nomor_induk: true,
              jurusan: true,
            },
          },
          ruangan: true,
          persetujuan: {
            include: {
              pemberiPersetujuan: {
                select: {
                  nama_lengkap: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(peminjaman);
    } else if (user.role.includes(Role.KAPRODI) || user.role.includes(Role.KETUA_KELAS)) {
      // Kaprodi dan Ketua Kelas hanya melihat peminjaman dari jurusan mereka
      whereClause = {
        peminjam: {
          jurusanId: user.jurusanId,
        },
      };
    } else {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk melihat data peminjaman" });
    }

    // Query peminjaman dengan filter yang sesuai
    peminjaman = await prisma.peminjaman.findMany({
      where: whereClause,
      include: {
        peminjam: {
          select: {
            nama_lengkap: true,
            nomor_induk: true,
            jurusan: true,
          },
        },
        ruangan: true,
        persetujuan: {
          include: {
            pemberiPersetujuan: {
              select: {
                nama_lengkap: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(peminjaman);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// Menghapus peminjaman (hanya untuk admin)
const deletePeminjaman = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Hanya admin yang bisa menghapus peminjaman
  if (!user.role.includes(Role.ADMIN)) {
    return res.status(403).json({ message: "Anda tidak memiliki akses untuk menghapus peminjaman" });
  }

  try {
    // Hapus semua persetujuan terkait terlebih dahulu
    await prisma.persetujuan.deleteMany({
      where: { peminjamanId: parseInt(id) },
    });

    // Kemudian hapus peminjaman
    await prisma.peminjaman.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Peminjaman berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

module.exports = { createPeminjaman, getMyPeminjaman, getAllPeminjaman, deletePeminjaman };
