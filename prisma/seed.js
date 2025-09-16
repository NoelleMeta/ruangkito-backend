// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Jurusan
  const jurusanData = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../data/jurusan.csv'))
      .pipe(csv())
      .on('data', (row) => jurusanData.push({ id: parseInt(row.id), nama_jurusan: row.nama_jurusan }))
      .on('end', resolve)
      .on('error', reject);
  });
  await prisma.jurusan.createMany({ data: jurusanData, skipDuplicates: true });
  console.log('Jurusan seeded.');

  // 2. Seed Ruangan
  const ruanganData = [];
  const ruanganMap = {}; // Untuk mapping nama ruangan ke ID nanti
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../data/ruangan.csv'))
      .pipe(csv())
      .on('data', (row) => {
        const data = {
          id: parseInt(row.id),
          kode_ruangan: row.kode_ruangan,
          nama_ruangan: row.nama_ruangan,
          jenis_ruangan: row.jenis_ruangan
        };
        ruanganData.push(data);
        ruanganMap[row.nama_ruangan] = parseInt(row.id);
      })
      .on('end', resolve)
      .on('error', reject);
  });
  await prisma.ruangan.createMany({ data: ruanganData, skipDuplicates: true });
  console.log('Ruangan seeded.');

  // 3. Seed Users (dengan password hashing)
  const usersStream = fs.createReadStream(path.join(__dirname, '../data/users.csv')).pipe(csv());
  const salt = await bcrypt.genSalt(10);

  for await (const row of usersStream) {
    const hashedPassword = await bcrypt.hash(row.password, salt);
    const roles = row.role.split(',').map(r => r.trim().toUpperCase());

    await prisma.user.upsert({
      where: { nomor_induk: row.nomor_induk },
      update: {},
      create: {
        nomor_induk: row.nomor_induk,
        nama_lengkap: row.nama_lengkap,
        password: hashedPassword,
        role: roles,
        jurusanId: row.jurusanId ? parseInt(row.jurusanId) : null,
      },
    });
  }
  console.log('Users seeded.');

  // 4. Seed Jadwal Kuliah (gabungan dari 3 file)
  const jadwalFiles = ['jadwal_informatika.csv', 'jadwal_teknik_komputer.csv', 'jadwal_teknik_sipil.csv'];
  let allJadwal = [];

  for (const file of jadwalFiles) {
    await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(__dirname, `../data/${file}`))
        .pipe(csv())
        .on('data', (row) => {
          // Cari ruanganId berdasarkan nama ruangan di CSV
          const ruanganId = ruanganMap[row.kelas];
          if (ruanganId) {
            allJadwal.push({
              kode_matkul: row.kode_matkul,
              hari: row.hari.toLowerCase(),
              nama_matkul: row.nama_matkul,
              dosen_pengampu: row.dosen_pengampu,
              sks: parseInt(row.sks),
              mulai: row.mulai,
              selesai: row.selesai,
              ruanganId: ruanganId,
              jurusanId: parseInt(row.jurusanId),
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }
  await prisma.jadwalKuliah.createMany({ data: allJadwal, skipDuplicates: true });
  console.log('Jadwal Kuliah seeded.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });