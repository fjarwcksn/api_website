import dotenv from "dotenv";
dotenv.config(); // Load environment variables at the start

import express from "express";
import cors from "cors";
import connectDB from "./config/database.js"; // Pastikan path ini benar
import mongoose from "mongoose"; // Diimpor tapi tidak langsung digunakan di sini, hanya untuk graceful shutdown
import cookieParser from "cookie-parser";

// Import routes
import userRoutes from "./routes/auth.route.js"; // Pastikan ini adalah rute yang menangani /login dan /register
import avatarRoutes from "./routes/avatar.route.js";
import dataRoutes from "./routes/data.route.js";
import bidangRoutes from "./routes/bidang.route.js";
import sliderRoutes from "./routes/slider.route.js";
import servicecomplaintRoutes from "./routes/servicecomplaint.route.js";

const startServer = async () => {
  try {
    // Log MONGODB_URI to debug (Bisa dihapus setelah yakin koneksi berhasil)
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
    await connectDB(); // Pastikan fungsi ini yang benar-benar melakukan koneksi ke MongoDB

    const app = express();

    // Middleware untuk parsing JSON body
    app.use(express.json()); // Untuk parsing application/json
    app.use(express.urlencoded({ extended: true })); // Untuk parsing application/x-www-form-urlencoded

    // Middleware untuk parsing cookie (jika digunakan untuk autentikasi berbasis cookie)
    app.use(cookieParser());

    // --- TAMBAH LOG DEBUGGING INI (SETELAH PARSING BODY) ---
    app.use((req, res, next) => {
      console.log('--- Incoming Request Details ---');
      console.log('URL:', req.originalUrl);
      console.log('Method:', req.method);
      console.log('Body:', req.body); // Ini yang paling penting
      console.log('Headers:', req.headers['content-type']); // Cek Content-Type header
      console.log('------------------------------');
      next();
    });
    // --- AKHIR LOG DEBUGGING ---

    // --- KONFIGURASI CORS YANG DIPERBAIKI UNTUK LOKAL ---
    // HANYA izinkan origin lokal untuk development.
    // Ketika deploy ke online, daftar ini HARUS diperbarui dengan URL publik Vercel Anda.
    const allowedOrigins = [
      "http://localhost:5173", // Admin Panel Lokal (default Vite)
      "http://localhost:3001", // Frontend Klien Lokal (default Vite)
      // Jika Anda benar-benar perlu mengizinkan IP lokal spesifik, tambahkan di sini:
      "http://192.168.90.25:3001/", // Contoh IP lokal klien
      // Hapus atau komen baris-baris URL Vercel atau Railway di sini untuk sementara debugging lokal:
      "https://kelurahansendangmulyo-admin.vercel.app",
      "https://kelurahansendangmulyo-admin.slojbgl.vercel.app",
      "https://kelurahansendangmulyo-admin-e1qi8bg87-fjarwcksns-projects.vercel.app",
      "https://kelurahansendangmulyo.vercel.app",
    ];

    app.use(
      cors({
        origin: (origin, callback) => {
          // Izinkan permintaan tanpa origin (misal: dari Postman/curl, atau file lokal)
          // Ini juga memungkinkan permintaan dari server ke server tanpa header origin
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            // Log error CORS untuk debugging di server
            console.error(`CORS blocked request from origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true, // Ini penting jika Anda menggunakan cookie atau session (seperti withCredentials: true di axios)
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Izinkan semua metode HTTP yang relevan
        allowedHeaders: ['Content-Type', 'Authorization'], // Izinkan header ini
      })
    );
    // --- AKHIR KONFIGURASI CORS ---

    // === PENTING: Pastikan CORS middleware diletakkan SEBELUM definisi rute Anda ===
    // Karena CORS harus memproses permintaan sebelum rute menanganinya.

    // Routes
    // Pastikan path dan nama variabel rute sudah sesuai dengan file Anda
    app.use("/api/v1/user", userRoutes); // Jika userRoutes menangani /login dan /register
    app.use("/api/v1/avatar", avatarRoutes);
    app.use("/api/v1/data", dataRoutes);
    app.use("/api/v1/bidang", bidangRoutes);
    app.use("/api/v1/slider", sliderRoutes);
    app.use("/api/v1/servicecomplaint", servicecomplaintRoutes);

    // Endpoint untuk root URL (opsional, untuk memastikan server hidup)
    app.get('/', (req, res) => {
      res.status(200).json({ message: 'Backend API for Kelurahan Sendang Mulyo is running!' });
    });

    // Handle 404 Not Found (jika tidak ada rute yang cocok)
    app.use((req, res, next) => {
      res.status(404).json({ message: 'API Endpoint Not Found' });
    });

    // Global Error Handler (untuk menangani error yang tidak tertangkap di rute)
    app.use((err, req, res, next) => {
      console.error(err.stack); // Log stack trace error ke console server
      res.status(err.statusCode || 500).json({
        message: err.message || 'Internal Server Error',
        // error: process.env.NODE_ENV === 'production' ? {} : err.stack // Tampilkan stack trace di dev, sembunyikan di prod
      });
    });


    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running on port ${PORT}, host 0.0.0.0`)
    );

    // Handle SIGTERM for graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("HTTP server closed.");
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
