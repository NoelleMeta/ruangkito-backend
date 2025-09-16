const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Peminjaman Ruangan API',
      version: '1.0.0',
      description: 'API untuk sistem peminjaman ruangan kampus',
      contact: {
        name: 'API Support',
        email: 'support@peminjaman.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unik pengguna'
            },
            nomor_induk: {
              type: 'string',
              description: 'Nomor induk pengguna'
            },
            nama_lengkap: {
              type: 'string',
              description: 'Nama lengkap pengguna'
            },
            role: {
              type: 'array',
              enum: ['MAHASISWA', 'DOSEN', 'KAPRODI', 'KETUA_KELAS', 'ADMIN'],
              description: 'Role pengguna'
            },
            jurusanId: {
              type: 'integer',
              nullable: true,
              description: 'ID jurusan (null untuk admin)'
            }
          }
        },
        Jurusan: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unik jurusan'
            },
            nama_jurusan: {
              type: 'string',
              description: 'Nama jurusan'
            }
          }
        },
        Ruangan: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unik ruangan'
            },
            kode_ruangan: {
              type: 'string',
              description: 'Kode ruangan'
            },
            nama_ruangan: {
              type: 'string',
              description: 'Nama ruangan'
            },
            jenis_ruangan: {
              type: 'string',
              description: 'Jenis ruangan (Kelas atau Lab)'
            }
          }
        },
        JadwalKuliah: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unik jadwal'
            },
            kode_matkul: {
              type: 'string',
              description: 'Kode mata kuliah'
            },
            hari: {
              type: 'string',
              description: 'Hari kuliah'
            },
            nama_matkul: {
              type: 'string',
              description: 'Nama mata kuliah'
            },
            dosen_pengampu: {
              type: 'string',
              description: 'Nama dosen pengampu'
            },
            sks: {
              type: 'integer',
              description: 'Jumlah SKS'
            },
            mulai: {
              type: 'string',
              description: 'Jam mulai kuliah'
            },
            selesai: {
              type: 'string',
              description: 'Jam selesai kuliah'
            },
            ruanganId: {
              type: 'integer',
              description: 'ID ruangan'
            },
            jurusanId: {
              type: 'integer',
              description: 'ID jurusan'
            }
          }
        },
        Peminjaman: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unik peminjaman'
            },
            peminjamId: {
              type: 'integer',
              description: 'ID pengguna yang meminjam'
            },
            ruanganId: {
              type: 'integer',
              description: 'ID ruangan yang dipinjam'
            },
            tujuan: {
              type: 'string',
              description: 'Tujuan peminjaman'
            },
            jenisPeminjaman: {
              type: 'string',
              enum: ['JAM_PENGGANTI', 'LAINNYA'],
              description: 'Jenis peminjaman'
            },
            waktuMulai: {
              type: 'string',
              format: 'date-time',
              description: 'Waktu mulai peminjaman'
            },
            waktuSelesai: {
              type: 'string',
              format: 'date-time',
              description: 'Waktu selesai peminjaman'
            },
            statusPeminjaman: {
              type: 'string',
              enum: ['PENDING', 'DISETUJUI', 'DITOLAK'],
              description: 'Status persetujuan peminjaman'
            },
            matkulPengganti: {
              type: 'string',
              nullable: true,
              description: 'Mata kuliah pengganti (untuk JAM_PENGGANTI)'
            },
            dosenPengampu: {
              type: 'string',
              nullable: true,
              description: 'Nama dosen pengampu (untuk JAM_PENGGANTI)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tanggal dibuat'
            }
          }
        },
        Persetujuan: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID unik persetujuan'
            },
            peminjamanId: {
              type: 'integer',
              description: 'ID peminjaman'
            },
            pemberiPersetujuanId: {
              type: 'integer',
              description: 'ID pemberi persetujuan'
            },
            rolePemberiPersetujuan: {
              type: 'string',
              enum: ['MAHASISWA', 'DOSEN', 'KAPRODI', 'KETUA_KELAS', 'ADMIN'],
              description: 'Role pemberi persetujuan'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'DISETUJUI', 'DITOLAK'],
              description: 'Status persetujuan'
            },
            komentar: {
              type: 'string',
              nullable: true,
              description: 'Komentar persetujuan'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tanggal diupdate'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Pesan error'
            },
            error: {
              type: 'string',
              description: 'Detail error'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
