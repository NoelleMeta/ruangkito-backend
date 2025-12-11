# Peminjaman Backend

Sistem backend untuk aplikasi peminjaman ruangan berbasis web. Dibangun dengan Express.js, PostgreSQL, dan Prisma ORM.

## Deskripsi

Aplikasi ini menyediakan REST API untuk mengelola:

- **Autentikasi & Autorisasi**: Login, register, dan manajemen role (admin, dosen, mahasiswa)
- **Manajemen Ruangan**: CRUD ruangan dengan informasi kapasitas dan lokasi
- **Jadwal Kuliah**: Impor dan manajemen jadwal kuliah dari CSV
- **Peminjaman Ruangan**: Pengajuan dan tracking peminjaman ruangan
- **Persetujuan**: Proses persetujuan peminjaman oleh admin/dosen
- **Admin Panel**: Manajemen user dan data sistem

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1
- **Database**: PostgreSQL
- **ORM**: Prisma 6.15
- **Auth**: JWT (jsonwebtoken)
- **Security**: bcryptjs
- **API Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **CSV Parsing**: csv-parser, csv-parse

## Prerequisites

- Node.js v16 atau lebih tinggi
- PostgreSQL v12 atau lebih tinggi
- npm atau yarn

## Instalasi

1. Clone repository dan install dependencies:

```bash
npm install
```

2. Setup environment variables. Buat file `.env` di root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/peminjaman_db"
PORT=5000
JWT_SECRET="your-secret-key-here"
NODE_ENV="development"
```

3. Jalankan migrasi database:

```bash
npx prisma migrate dev
```

4. (Optional) Seed database dengan data awal:

```bash
npx prisma db seed
```

## Menjalankan Aplikasi

### Development Mode (dengan hot reload)

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### Production Mode

```bash
npm start
```

## API Documentation

Swagger documentation tersedia di: `http://localhost:5000/api-docs`

## Struktur Direktori

```
src/
├── controllers/      # Logic handler untuk setiap endpoint
├── routes/          # Route definitions
├── middleware/      # Express middleware (auth, etc)
├── config/          # Konfigurasi (Swagger, database)
└── index.js         # Entry point aplikasi

prisma/
├── schema.prisma    # Database schema
├── seed.js          # Initial data seeding
└── migrations/      # Database migration files

data/
├── jadwal_*.csv     # Jadwal kuliah per jurusan
├── jurusan.csv      # Data jurusan
├── ruangan.csv      # Data ruangan
└── users.csv        # Data user awal
```

## Endpoints Utama

- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `GET /ruangan` - List ruangan
- `POST /ruangan` - Tambah ruangan (admin)
- `GET /peminjaman` - List peminjaman
- `POST /peminjaman` - Buat peminjaman baru
- `GET /persetujuan` - List persetujuan (admin)
- `PUT /persetujuan/:id` - Setujui/tolak peminjaman

Lihat `SWAGGER_README.md` untuk dokumentasi lengkap.

## Development

### Menambah Migration Baru

```bash
npx prisma migrate dev --name <migration_name>
```

### Reset Database

```bash
npx prisma migrate reset
```

### Membuka Prisma Studio (GUI Database)

```bash
npx prisma studio
```

## Kontributor

Dibuat sebagai bagian dari proyek Magang

## License

ISC
