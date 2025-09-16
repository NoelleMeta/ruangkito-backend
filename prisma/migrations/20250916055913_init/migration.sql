-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MAHASISWA', 'DOSEN', 'KAPRODI', 'KETUA_KELAS', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."JenisPeminjaman" AS ENUM ('JAM_PENGGANTI', 'LAINNYA');

-- CreateEnum
CREATE TYPE "public"."StatusPersetujuan" AS ENUM ('PENDING', 'DISETUJUI', 'DITOLAK');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "nomor_induk" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role"[],
    "jurusanId" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jurusan" (
    "id" SERIAL NOT NULL,
    "nama_jurusan" TEXT NOT NULL,

    CONSTRAINT "jurusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ruangan" (
    "id" SERIAL NOT NULL,
    "kode_ruangan" TEXT NOT NULL,
    "nama_ruangan" TEXT NOT NULL,
    "jenis_ruangan" TEXT NOT NULL,

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jadwal_kuliah" (
    "id" SERIAL NOT NULL,
    "kode_matkul" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "nama_matkul" TEXT NOT NULL,
    "dosen_pengampu" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "mulai" TEXT NOT NULL,
    "selesai" TEXT NOT NULL,
    "ruanganId" INTEGER NOT NULL,
    "jurusanId" INTEGER NOT NULL,

    CONSTRAINT "jadwal_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."peminjaman" (
    "id" SERIAL NOT NULL,
    "tujuan" TEXT NOT NULL,
    "jenisPeminjaman" "public"."JenisPeminjaman" NOT NULL,
    "waktuMulai" TIMESTAMP(3) NOT NULL,
    "waktuSelesai" TIMESTAMP(3) NOT NULL,
    "statusPeminjaman" "public"."StatusPersetujuan" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "peminjamId" INTEGER NOT NULL,
    "ruanganId" INTEGER NOT NULL,
    "matkulPengganti" TEXT,
    "dosenPengampu" TEXT,

    CONSTRAINT "peminjaman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."persetujuan" (
    "id" SERIAL NOT NULL,
    "status" "public"."StatusPersetujuan" NOT NULL DEFAULT 'PENDING',
    "komentar" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "peminjamanId" INTEGER NOT NULL,
    "pemberiPersetujuanId" INTEGER NOT NULL,
    "rolePemberiPersetujuan" "public"."Role" NOT NULL,

    CONSTRAINT "persetujuan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nomor_induk_key" ON "public"."users"("nomor_induk");

-- CreateIndex
CREATE UNIQUE INDEX "jurusan_nama_jurusan_key" ON "public"."jurusan"("nama_jurusan");

-- CreateIndex
CREATE UNIQUE INDEX "ruangan_kode_ruangan_key" ON "public"."ruangan"("kode_ruangan");

-- CreateIndex
CREATE UNIQUE INDEX "ruangan_nama_ruangan_key" ON "public"."ruangan"("nama_ruangan");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "public"."jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_kuliah" ADD CONSTRAINT "jadwal_kuliah_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "public"."ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_kuliah" ADD CONSTRAINT "jadwal_kuliah_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "public"."jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."peminjaman" ADD CONSTRAINT "peminjaman_peminjamId_fkey" FOREIGN KEY ("peminjamId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."peminjaman" ADD CONSTRAINT "peminjaman_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "public"."ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."persetujuan" ADD CONSTRAINT "persetujuan_peminjamanId_fkey" FOREIGN KEY ("peminjamanId") REFERENCES "public"."peminjaman"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."persetujuan" ADD CONSTRAINT "persetujuan_pemberiPersetujuanId_fkey" FOREIGN KEY ("pemberiPersetujuanId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
