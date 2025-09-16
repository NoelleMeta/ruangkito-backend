// src/controllers/adminController.js
const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// USERS
const listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, nomor_induk: true, nama_lengkap: true, role: true, jurusanId: true }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil users', error: error.message });
    }
};

const createUser = async (req, res) => {
    const { nomor_induk, nama_lengkap, password, role, jurusanId } = req.body;
    if (!nomor_induk || !nama_lengkap || !password || !role) {
        return res.status(400).json({ message: 'nomor_induk, nama_lengkap, password, role wajib' });
    }
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { nomor_induk, nama_lengkap, password: hashed, role, jurusanId: role === Role.ADMIN ? null : jurusanId || null }
        });
        res.status(201).json({ id: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nomor_induk, nama_lengkap, password, role, jurusanId } = req.body;
    try {
        const data = {};
        if (nomor_induk) data.nomor_induk = nomor_induk;
        if (nama_lengkap) data.nama_lengkap = nama_lengkap;
        if (typeof role !== 'undefined') data.role = role;
        if (typeof jurusanId !== 'undefined') data.jurusanId = role === Role.ADMIN ? null : jurusanId;
        if (password) data.password = await bcrypt.hash(password, 10);

        const user = await prisma.user.update({ where: { id: parseInt(id) }, data });
        res.status(200).json({ id: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'User dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus user', error: error.message });
    }
};

// JURUSAN
const listJurusan = async (req, res) => {
    try {
        const data = await prisma.jurusan.findMany();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil jurusan', error: error.message });
    }
};

const createJurusan = async (req, res) => {
    const { nama_jurusan } = req.body;
    if (!nama_jurusan) return res.status(400).json({ message: 'nama_jurusan wajib' });
    try {
        const jur = await prisma.jurusan.create({ data: { nama_jurusan } });
        res.status(201).json(jur);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat jurusan', error: error.message });
    }
};

const updateJurusan = async (req, res) => {
    const { id } = req.params;
    const { nama_jurusan } = req.body;
    try {
        const jur = await prisma.jurusan.update({ where: { id: parseInt(id) }, data: { nama_jurusan } });
        res.status(200).json(jur);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate jurusan', error: error.message });
    }
};

const deleteJurusan = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.jurusan.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Jurusan dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus jurusan', error: error.message });
    }
};

// RUANGAN
const listRuangan = async (req, res) => {
    try {
        const data = await prisma.ruangan.findMany();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil ruangan', error: error.message });
    }
};

const createRuangan = async (req, res) => {
    const { kode_ruangan, nama_ruangan, jenis_ruangan } = req.body;
    if (!kode_ruangan || !nama_ruangan || !jenis_ruangan) {
        return res.status(400).json({ message: 'kode_ruangan, nama_ruangan, jenis_ruangan wajib' });
    }
    try {
        const r = await prisma.ruangan.create({ data: { kode_ruangan, nama_ruangan, jenis_ruangan } });
        res.status(201).json(r);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat ruangan', error: error.message });
    }
};

const updateRuangan = async (req, res) => {
    const { id } = req.params;
    const { kode_ruangan, nama_ruangan, jenis_ruangan } = req.body;
    try {
        const r = await prisma.ruangan.update({
            where: { id: parseInt(id) },
            data: { kode_ruangan, nama_ruangan, jenis_ruangan }
        });
        res.status(200).json(r);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate ruangan', error: error.message });
    }
};

const deleteRuangan = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.ruangan.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Ruangan dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus ruangan', error: error.message });
    }
};

// JADWAL KULIAH
const listJadwal = async (req, res) => {
    try {
        const data = await prisma.jadwalKuliah.findMany();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil jadwal', error: error.message });
    }
};

const createJadwal = async (req, res) => {
    const { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId } = req.body;
    try {
        const j = await prisma.jadwalKuliah.create({
            data: { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId }
        });
        res.status(201).json(j);
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat jadwal', error: error.message });
    }
};

const updateJadwal = async (req, res) => {
    const { id } = req.params;
    const { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId } = req.body;
    try {
        const j = await prisma.jadwalKuliah.update({
            where: { id: parseInt(id) },
            data: { kode_matkul, hari, nama_matkul, dosen_pengampu, sks, mulai, selesai, ruanganId, jurusanId }
        });
        res.status(200).json(j);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate jadwal', error: error.message });
    }
};

const deleteJadwal = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.jadwalKuliah.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: 'Jadwal dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus jadwal', error: error.message });
    }
};

module.exports = {
    // users
    listUsers, createUser, updateUser, deleteUser,
    // jurusan
    listJurusan, createJurusan, updateJurusan, deleteJurusan,
    // ruangan
    listRuangan, createRuangan, updateRuangan, deleteRuangan,
    // jadwal
    listJadwal, createJadwal, updateJadwal, deleteJadwal
};

