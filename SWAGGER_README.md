# Swagger UI Documentation

API Peminjaman Ruangan sekarang sudah dilengkapi dengan Swagger UI untuk dokumentasi API yang interaktif.

## Cara Mengakses Swagger UI

1. Jalankan server backend:
   ```bash
   npm run dev
   ```

2. Buka browser dan akses:
   ```
   http://localhost:5000/api-docs
   ```

## Fitur Swagger UI

- **Interactive API Documentation**: Dokumentasi API yang dapat di-test langsung dari browser
- **Authentication Support**: Mendukung JWT Bearer Token untuk endpoint yang memerlukan autentikasi
- **Request/Response Examples**: Contoh request dan response untuk setiap endpoint
- **Schema Definitions**: Definisi struktur data untuk semua model (User, Ruangan, Peminjaman, dll)

## Endpoint yang Didokumentasikan

### Authentication
- `POST /api/auth/login` - Login user dengan nomor induk dan password

### Ruangan
- `GET /api/ruangan/available` - Mendapatkan ruangan yang tersedia berdasarkan hari dan jam

### Peminjaman
- `POST /api/peminjaman` - Membuat permintaan peminjaman baru (JAM_PENGGANTI atau LAINNYA)

### Persetujuan
- `GET /api/persetujuan/pending` - Mendapatkan daftar permintaan persetujuan yang pending
- `PUT /api/persetujuan/:id` - Update status persetujuan (DISETUJUI atau DITOLAK)

### Admin (Hanya untuk Admin)
- `GET /api/admin/users` - Mendapatkan daftar semua pengguna
- `POST /api/admin/users` - Membuat pengguna baru
- `GET /api/admin/ruangan` - Mendapatkan daftar semua ruangan
- `POST /api/admin/ruangan` - Membuat ruangan baru
- `GET /api/admin/jurusan` - Mendapatkan daftar jurusan
- `POST /api/admin/jurusan` - Membuat jurusan baru
- `GET /api/admin/jadwal` - Mendapatkan daftar jadwal kuliah
- `POST /api/admin/jadwal` - Membuat jadwal kuliah baru

## Cara Menggunakan Authentication

1. Login melalui endpoint `/api/auth/login` dengan nomor induk dan password untuk mendapatkan JWT token
2. Klik tombol "Authorize" di Swagger UI
3. Masukkan token dengan format: `Bearer <your-jwt-token>`
4. Klik "Authorize" untuk mengaktifkan autentikasi
5. Sekarang Anda dapat mengakses endpoint yang memerlukan autentikasi

## Struktur Database

### Role Pengguna
- `MAHASISWA` - Mahasiswa
- `DOSEN` - Dosen
- `KAPRODI` - Kepala Program Studi
- `KETUA_KELAS` - Ketua Kelas
- `ADMIN` - Administrator

### Jenis Peminjaman
- `JAM_PENGGANTI` - Jam pengganti kuliah
- `LAINNYA` - Peminjaman untuk keperluan lain

### Status Persetujuan
- `PENDING` - Menunggu persetujuan
- `DISETUJUI` - Disetujui
- `DITOLAK` - Ditolak

## Catatan

- Semua endpoint admin memerlukan role "ADMIN"
- Endpoint yang memerlukan autentikasi akan menampilkan ikon kunci di Swagger UI
- Untuk peminjaman JAM_PENGGANTI, field `matkulPengganti` dan `dosenPengampu` wajib diisi
- Dokumentasi ini akan otomatis terupdate ketika ada perubahan pada route atau controller
