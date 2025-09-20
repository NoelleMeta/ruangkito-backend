// src/controllers/jadwalKuliahController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Mendapatkan daftar mata kuliah berdasarkan jurusan
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getMataKuliahByJurusan = async (req, res) => {
  try {
    const { jurusanId, search } = req.query;

    // Validasi jurusanId
    if (!jurusanId) {
      return res.status(400).json({ message: "Parameter jurusanId diperlukan" });
    }

    // Konversi jurusanId ke integer
    const jurusanIdInt = parseInt(jurusanId, 10);
    if (isNaN(jurusanIdInt)) {
      return res.status(400).json({ message: "jurusanId harus berupa angka" });
    }

    // Query untuk mendapatkan mata kuliah berdasarkan jurusan
    // dan filter berdasarkan search term jika ada
    // Tidak perlu filter berdasarkan angkatan karena semua angkatan bisa mengambil mata kuliah yang sama
    const mataKuliah = await prisma.jadwalKuliah.findMany({
      where: {
        jurusanId: jurusanIdInt,
        ...(search && {
          OR: [{ nama_matkul: { contains: search, mode: "insensitive" } }, { kode_matkul: { contains: search, mode: "insensitive" } }],
        }),
      },
      select: {
        id: true,
        kode_matkul: true,
        nama_matkul: true,
        dosen_pengampu: true,
        sks: true,
      },
      distinct: ["nama_matkul"], // Menghindari duplikasi mata kuliah
      orderBy: { nama_matkul: "asc" },
    });

    return res.status(200).json({
      message: "Berhasil mendapatkan daftar mata kuliah",
      data: mataKuliah,
    });
  } catch (error) {
    console.error("Error getting mata kuliah:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

module.exports = {
  getMataKuliahByJurusan,
};
