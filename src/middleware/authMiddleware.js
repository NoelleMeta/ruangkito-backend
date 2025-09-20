// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { PrismaClient, Role } = require("@prisma/client");
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");

      // Get user from the token payload (we don't need to query the db again if the payload is sufficient)
      req.user = {
        id: decoded.id,
        nomor_induk: decoded.nomor_induk,
        nama_lengkap: decoded.nama_lengkap,
        role: decoded.role,
        jurusanId: decoded.jurusanId,
        angkatan: decoded.angkatan,
      };

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Tidak terotorisasi" });
    }

    // Cek jika ada peran pengguna yang cocok dengan peran yang diizinkan
    // Pastikan req.user.role adalah array
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

    // Log untuk debugging dengan lebih detail
    console.log("Authorizing access to route:", req.originalUrl);
    console.log("User data:", req.user);
    console.log("User roles:", userRoles);
    console.log("Allowed roles for this route:", allowedRoles);

    // Jika allowedRoles kosong, izinkan semua role
    if (allowedRoles.length === 0) {
      console.log("No roles specified, allowing access");
      return next();
    }

    // Periksa apakah ada role pengguna yang cocok dengan role yang diizinkan
    const hasRole = userRoles.some((userRole) => {
      return allowedRoles.some((allowedRole) => {
        const match = String(userRole).toUpperCase() === String(allowedRole).toUpperCase();
        console.log(`Comparing ${userRole} with ${allowedRole}: ${match ? "MATCH" : "NO MATCH"}`);
        return match;
      });
    });

    console.log("Access decision:", hasRole ? "GRANTED" : "DENIED");

    if (!hasRole) {
      return res.status(403).json({ message: "Akses ditolak: role tidak memiliki izin" });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles, Role };
