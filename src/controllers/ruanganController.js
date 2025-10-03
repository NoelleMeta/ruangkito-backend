// src/controllers/ruanganController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAvailableRooms = async (req, res) => {
  const { hari, jam_mulai, jam_selesai } = req.query;

  if (!hari || !jam_mulai || !jam_selesai) {
    return res.status(400).json({ message: "Parameter hari, jam_mulai, dan jam_selesai dibutuhkan" });
  }

  try {
    // 1. Ambil semua ruangan
    const allRooms = await prisma.ruangan.findMany();

    // 2. Cari ruangan yang terpakai oleh Jadwal Kuliah pada hari dan jam tersebut
    const usedBySchedule = await prisma.jadwalKuliah.findMany({
      where: {
        hari: {
          equals: hari.toLowerCase(),
        },
        // Logika overlap waktu
        NOT: [
          { selesai: { lte: jam_mulai } }, // Selesai sebelum atau sama dengan jam mulai cari
          { mulai: { gte: jam_selesai } }, // Mulai setelah atau sama dengan jam selesai cari
        ],
      },
      select: {
        ruanganId: true,
      },
    });

    // 3. (Untuk nanti) Cari ruangan yang terpakai oleh Peminjaman yang sudah DISETUJUI
    //    Saat ini kita belum implementasi peminjaman, jadi kita lewati dulu.
    //    const usedByBooking = await prisma.peminjaman.findMany({...})

    const usedRoomIds = new Set(usedBySchedule.map((j) => j.ruanganId));

    // 4. Filter ruangan yang tersedia
    const availableRooms = allRooms.filter((room) => !usedRoomIds.has(room.id));

    res.status(200).json(availableRooms);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

/**
 * GET /api/ruangan/availability?date=YYYY-MM-DD
 * Returns hours and for each room a map of hour->status where status is:
 *  - 'DISETUJUI' -> occupied
 *  - 'PENDING' -> pending booking
 *  - true -> available
 */
const getDailyAvailability = async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: "Parameter date=YYYY-MM-DD dibutuhkan" });

  // validate basic format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ message: "Format date harus YYYY-MM-DD" });

  try {
    // build hours 08:00 .. 21:00
    const hours = [];
    for (let h = 8; h <= 21; h++) {
      hours.push(String(h).padStart(2, "0") + ":00");
    }

    // load rooms
    const rooms = await prisma.ruangan.findMany();

    // weekday name in lower-case (matching jadwalKuliah.hari values)
    const wk = new Date(date + "T00:00:00").getDay();
    const dayNames = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    const weekday = dayNames[wk];

    // load jadwal kuliah for that weekday
    const jadwals = await prisma.jadwalKuliah.findMany({ where: { hari: { equals: weekday } } });

    // load peminjaman that intersect the date (any status)
    const dayStart = new Date(date + "T00:00:00.000Z");
    const dayEnd = new Date(date + "T23:59:59.999Z");
    const peminjaman = await prisma.peminjaman.findMany({
      where: {
        OR: [{ waktuMulai: { lte: dayEnd }, waktuSelesai: { gte: dayStart } }],
      },
    });

    // helper: convert HH:MM to minutes
    const hhmmToMin = (t) => {
      const [hh, mm] = t.split(":").map(Number);
      return hh * 60 + (mm || 0);
    };

    // build room slot maps
    const roomsWithSlots = rooms.map((r) => {
      const slots = {};
      hours.forEach((h) => (slots[h] = true)); // default available

      // mark jadwalKuliah as occupied
      jadwals.forEach((j) => {
        if (j.ruanganId !== r.id) return;
        // j.mulai/j.selesai are strings like HH:MM
        const jStart = hhmmToMin(j.mulai);
        const jEnd = hhmmToMin(j.selesai);
        hours.forEach((h) => {
          const s = hhmmToMin(h);
          const e = s + 60;
          // overlap
          if (!(jEnd <= s || jStart >= e)) {
            slots[h] = "DISETUJUI";
          }
        });
      });

      // mark peminjaman
      peminjaman.forEach((p) => {
        if (p.ruanganId !== r.id) return;
        const pStart = new Date(p.waktuMulai).getTime();
        const pEnd = new Date(p.waktuSelesai).getTime();
        hours.forEach((h) => {
          const sDate = new Date(date + "T" + h + ":00.000Z").getTime();
          const eDate = sDate + 60 * 60 * 1000;
          // overlap
          if (!(pEnd <= sDate || pStart >= eDate)) {
            if (p.statusPeminjaman === "DISETUJUI") {
              slots[h] = "DISETUJUI";
            } else if (p.statusPeminjaman === "PENDING") {
              // only mark pending if not already occupied by jadwal or approved booking
              if (slots[h] !== "DISETUJUI") slots[h] = "PENDING";
            }
            // DITOLAK -> ignore
          }
        });
      });

      return {
        id: r.id,
        nama_ruangan: r.nama_ruangan,
        kode_ruangan: r.kode_ruangan,
        jenis_ruangan: r.jenis_ruangan,
        slots,
      };
    });

    res.json({ date, weekday, hours, rooms: roomsWithSlots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: err.message });
  }
};

module.exports = { getAvailableRooms, getDailyAvailability };
