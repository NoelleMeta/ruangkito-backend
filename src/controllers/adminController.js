// src/controllers/adminController.js
const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

// USERS
const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, nomor_induk: true, nama_lengkap: true, role: true, jurusanId: true },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil users", error: error.message });
  }
};

const createUser = async (req, res) => {
  const { nomor_induk, nama_lengkap, password, role, jurusanId } = req.body;
  if (!nomor_induk || !nama_lengkap || !password || !role) {
    return res.status(400).json({ message: "nomor_induk, nama_lengkap, password, role wajib" });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nomor_induk, nama_lengkap, password: hashed, role, jurusanId: role === Role.ADMIN ? null : jurusanId || null },
    });
    res.status(201).json({ id: user.id });
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat user", error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nomor_induk, nama_lengkap, password, role, jurusanId } = req.body;
  try {
    const data = {};
    if (nomor_induk) data.nomor_induk = nomor_induk;
    if (nama_lengkap) data.nama_lengkap = nama_lengkap;
    if (typeof role !== "undefined") data.role = role;
    if (typeof jurusanId !== "undefined") data.jurusanId = role === Role.ADMIN ? null : jurusanId;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({ where: { id: parseInt(id) }, data });
    res.status(200).json({ id: user.id });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "User dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus user", error: error.message });
  }
};

// JURUSAN
const listJurusan = async (req, res) => {
  try {
    const data = await prisma.jurusan.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil jurusan", error: error.message });
  }
};

const createJurusan = async (req, res) => {
  const { nama_jurusan } = req.body;
  if (!nama_jurusan) return res.status(400).json({ message: "nama_jurusan wajib" });
  try {
    const jur = await prisma.jurusan.create({ data: { nama_jurusan } });
    res.status(201).json(jur);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat jurusan", error: error.message });
  }
};

const updateJurusan = async (req, res) => {
  const { id } = req.params;
  const { nama_jurusan } = req.body;
  try {
    const jur = await prisma.jurusan.update({ where: { id: parseInt(id) }, data: { nama_jurusan } });
    res.status(200).json(jur);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate jurusan", error: error.message });
  }
};

const deleteJurusan = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.jurusan.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Jurusan dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus jurusan", error: error.message });
  }
};

// RUANGAN
const listRuangan = async (req, res) => {
  try {
    const data = await prisma.ruangan.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil ruangan", error: error.message });
  }
};

const createRuangan = async (req, res) => {
  const { kode_ruangan, nama_ruangan, jenis_ruangan } = req.body;
  if (!kode_ruangan || !nama_ruangan || !jenis_ruangan) {
    return res.status(400).json({ message: "kode_ruangan, nama_ruangan, jenis_ruangan wajib" });
  }
  try {
    const r = await prisma.ruangan.create({ data: { kode_ruangan, nama_ruangan, jenis_ruangan } });
    res.status(201).json(r);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat ruangan", error: error.message });
  }
};

const updateRuangan = async (req, res) => {
  const { id } = req.params;
  const { kode_ruangan, nama_ruangan, jenis_ruangan } = req.body;
  try {
    const r = await prisma.ruangan.update({
      where: { id: parseInt(id) },
      data: { kode_ruangan, nama_ruangan, jenis_ruangan },
    });
    res.status(200).json(r);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate ruangan", error: error.message });
  }
};

const deleteRuangan = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.ruangan.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Ruangan dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus ruangan", error: error.message });
  }
};

// JADWAL KULIAH
const listJadwal = async (req, res) => {
  try {
    const data = await prisma.jadwalKuliah.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil jadwal", error: error.message });
  }
};

const createJadwal = async (req, res) => {
  const { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId } = req.body;
  try {
    const j = await prisma.jadwalKuliah.create({
      data: { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId },
    });
    res.status(201).json(j);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat jadwal", error: error.message });
  }
};

const updateJadwal = async (req, res) => {
  const { id } = req.params;
  const { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId } = req.body;
  try {
    const j = await prisma.jadwalKuliah.update({
      where: { id: parseInt(id) },
      data: { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId },
    });
    res.status(200).json(j);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate jadwal", error: error.message });
  }
};

const deleteJadwal = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.jadwalKuliah.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Jadwal dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus jadwal", error: error.message });
  }
};

// IMPORT CSV / BULK UPDATES
const { parse } = require("csv-parse/sync");
const fs = require("fs");

/**
 * Import jadwal kuliah dari file CSV pada server (upload handled by client).
 * Mengharapkan body: { filePath: string, replace: boolean }
 * - filePath: path lokal ke file CSV (mis. upload sementara ke folder uploads/filename.csv)
 * - replace: jika true maka semua jadwal untuk jurusan yang ditemukan di CSV akan dihapus terlebih dahulu
 */
const importJadwalFromCsv = async (req, res) => {
  try {
    const { filePath, replace } = req.body;
    if (!filePath) return res.status(400).json({ message: "filePath wajib" });

    if (!fs.existsSync(filePath)) return res.status(400).json({ message: "File tidak ditemukan di server" });

    const content = fs.readFileSync(filePath, "utf8");
    // parse CSV dengan header
    const records = parse(content, { columns: true, skip_empty_lines: true });

    // Convert and prepare bulk data
    const toCreate = records.map((r) => ({
      kode_matkul: r.kode_matkul || r.kode || r.kode_mat || r.id || "",
      hari: r.hari,
      nama_matkul: r.nama_matkul || r.nama || r.nama_mat || "",
      dosen_pengampu: r.dosen_pengampu || r.dosen || "",
      sks: r.sks ? parseInt(r.sks, 10) : 0,
      mulai: r.mulai || r.start || r.waktu_mulai || "",
      selesai: r.selesai || r.end || r.waktu_selesai || "",
      ruanganId: r.ruanganId ? parseInt(r.ruanganId, 10) : null,
      jurusanId: r.jurusanId ? parseInt(r.jurusanId, 10) : null,
    }));

    // Optionally replace existing jadwal untuk jurusan yang ada pada file
    const jurusanIds = Array.from(new Set(toCreate.map((t) => t.jurusanId).filter(Boolean)));
    await prisma.$transaction(async (tx) => {
      if (replace && jurusanIds.length > 0) {
        // Hapus jadwal yang berkaitan
        await tx.jadwalKuliah.deleteMany({ where: { jurusanId: { in: jurusanIds } } });
      }

      // Bulk create
      for (const item of toCreate) {
        // skip rows without required fields
        if (!item.hari || !item.nama_matkul || !item.jurusanId || !item.ruanganId) continue;
        await tx.jadwalKuliah.create({ data: item });
      }
    });

    return res.status(201).json({ message: "Import selesai", imported: toCreate.length });
  } catch (error) {
    console.error("Error importing CSV:", error);
    return res.status(500).json({ message: "Gagal mengimport CSV", error: error.message });
  }
};

/**
 * Handler untuk upload CSV via multipart (multer).
 * Expects req.file and optional req.body.replace
 */
const importJadwalUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File CSV tidak ditemukan" });
    const filePath = req.file.path;
    const replace = req.body.replace === "true" || req.body.replace === true;

    // reuse logic from importJadwalFromCsv by reading file and parsing
    const content = fs.readFileSync(filePath, "utf8");
    const records = parse(content, { columns: true, skip_empty_lines: true });
    const toCreate = records.map((r) => ({
      kode_matkul: r.kode_matkul || r.kode || r.kode_mat || r.id || "",
      hari: r.hari,
      nama_matkul: r.nama_matkul || r.nama || r.nama_mat || "",
      dosen_pengampu: r.dosen_pengampu || r.dosen || "",
      sks: r.sks ? parseInt(r.sks, 10) : 0,
      mulai: r.mulai || r.start || r.waktu_mulai || "",
      selesai: r.selesai || r.end || r.waktu_selesai || "",
      ruanganId: r.ruanganId ? parseInt(r.ruanganId, 10) : null,
      jurusanId: r.jurusanId ? parseInt(r.jurusanId, 10) : null,
    }));

    const jurusanIds = Array.from(new Set(toCreate.map((t) => t.jurusanId).filter(Boolean)));
    await prisma.$transaction(async (tx) => {
      if (replace && jurusanIds.length > 0) {
        await tx.jadwalKuliah.deleteMany({ where: { jurusanId: { in: jurusanIds } } });
      }
      for (const item of toCreate) {
        if (!item.hari || !item.nama_matkul || !item.jurusanId || !item.ruanganId) continue;
        await tx.jadwalKuliah.create({ data: item });
      }
    });

    return res.status(201).json({ message: "Import via upload selesai", imported: toCreate.length });
  } catch (error) {
    console.error("Error importing uploaded CSV:", error);
    return res.status(500).json({ message: "Gagal mengimport CSV", error: error.message });
  }
};
/**
 * Bulk upsert jadwal dari payload JSON (array of jadwal objects).
 * body: { jadwals: [{ id?, kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId }] }
 */
const bulkUpsertJadwal = async (req, res) => {
  try {
    const { jadwals } = req.body;
    if (!Array.isArray(jadwals)) return res.status(400).json({ message: "jadwals harus berupa array" });

    const results = [];
    await prisma.$transaction(async (tx) => {
      for (const j of jadwals) {
        if (j.id) {
          const updated = await tx.jadwalKuliah.update({ where: { id: parseInt(j.id) }, data: j });
          results.push({ action: "updated", id: updated.id });
        } else {
          const created = await tx.jadwalKuliah.create({ data: j });
          results.push({ action: "created", id: created.id });
        }
      }
    });

    return res.status(200).json({ message: "Bulk upsert selesai", results });
  } catch (error) {
    console.error("Error bulk upsert jadwal:", error);
    return res.status(500).json({ message: "Gagal melakukan bulk upsert", error: error.message });
  }
};

/**
 * Mengelompokkan mata kuliah menjadi 4 group: sipil (jurusanId=1), teknik_komputer (2), informatika (3), umum (semua jurusan)
 * Query param: group = sipil|teknik_komputer|informatika|umum
 */
const getGroupedMataKuliah = async (req, res) => {
  try {
    const { group } = req.query;
    let where = {};
    if (group === "sipil") where.jurusanId = 1;
    else if (group === "teknik_komputer") where.jurusanId = 2;
    else if (group === "informatika") where.jurusanId = 3;
    // umum => no where, take all

    // Return full schedule rows so the frontend can show hari, waktu, and ruangan
    const mataKuliah = await prisma.jadwalKuliah.findMany({
      where,
      select: {
        id: true,
        kode_matkul: true,
        nama_matkul: true,
        dosen_pengampu: true,
        sks: true,
        jurusanId: true,
        hari: true,
        mulai: true,
        selesai: true,
        ruanganId: true,
      },
      orderBy: [{ nama_matkul: "asc" }, { hari: "asc" }, { mulai: "asc" }],
    });

    return res.status(200).json({ message: "Berhasil", data: mataKuliah });
  } catch (error) {
    console.error("Error getGroupedMataKuliah:", error);
    return res.status(500).json({ message: "Gagal mengambil data", error: error.message });
  }
};

module.exports = {
  // users
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  // jurusan
  listJurusan,
  createJurusan,
  updateJurusan,
  deleteJurusan,
  // ruangan
  listRuangan,
  createRuangan,
  updateRuangan,
  deleteRuangan,
  // jadwal
  listJadwal,
  createJadwal,
  updateJadwal,
  deleteJadwal,
  importJadwalFromCsv,
  bulkUpsertJadwal,
  getGroupedMataKuliah,
  importJadwalUpload,
};
