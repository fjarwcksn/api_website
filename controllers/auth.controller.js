import User from "../models/user.models.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/send.email.js";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Email Validation
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email sudah terdaftar." });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString(); // Generate 6-digit OTP

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      otp,
    });

    // Kirim email ke pengguna
    const subject = "Email Verification";
    const message = otp;
    await sendEmail(email, subject, message, username);

    res.status(201).json({
      success: true,
      message: "Berhasil mendaftar. Silakan cek email Anda untuk verifikasi.",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mendaftar." });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;

  const user = await User.findOne({ otp });

  if (user && user.otp === otp) {
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Remove password field from the response
    const userData = user.toObject();
    delete userData.password; // Delete password from the response

    res.status(200).json({
      success: true,
      data: userData,
      message: "Berhasil verifikasi OTP",
    });
  } else {
    res.status(400).json({ success: false, message: "OTP salah" });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Gagal mendapatkan data pengguna." });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: "Pengguna tidak ditemukan" });
  }

  if (user.isVerified) {
    return res
      .status(400)
      .json({ success: false, message: "Pengguna sudah terverifikasi" });
  }

  // Generate OTP baru
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Set OTP baru ke user
  user.otp = otp;
  await user.save();

  // Kirim OTP baru ke email
  try {
    // Kirim OTP baru ke email pengguna
    const subject = "Email Verification";
    const message = otp;
    await sendEmail(user.email, subject, message, user.username);
    res
      .status(200)
      .json({ success: true, message: "OTP berhasil dikirim ulang" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengirim OTP" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email dan password harus diisi" });
    }

    // Cek apakah email terdaftar
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Email tidak ditemukan" });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Password/Email salah" });
    }

    // Periksa apakah pengguna sudah diverifikasi
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ success: false, message: "Akun belum diverifikasi" });
    }

    // Buat JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // Simpan token di cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Asli: hanya secure di produksi
      secure: false, // UBAH INI: Set ke false untuk development lokal (HTTP)
      // sameSite: "none", // Asli: none (membutuhkan secure: true)
      sameSite: "Lax", // UBAH INI: Set ke 'Lax' atau 'Strict' untuk development lokal
      maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
    });

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get Me (User Info from Middleware)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal mendapatkan informasi pengguna",
    });
  }
};

// Logout
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true, // Selalu true di produksi untuk HTTPS
      sameSite: "none", // Diperlukan untuk lintas situs
      maxAge: 0, // Hapus cookie
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
      error: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }
    res
      .status(200)
      .json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const { username, firstname, lastname } = req.body;
    const avatar = req.file;

    // Find user by ID from JWT
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    // Validate input
    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Username harus diisi" });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      username,
      _id: { $ne: user._id },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username sudah digunakan" });
    }

    // Update user fields
    user.username = username || user.username;
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;

    // Handle avatar upload
    if (avatar) {
      // If user has an existing avatar, delete it from Cloudinary
      if (user.avatarId) {
        await cloudinary.uploader.destroy(user.avatarId, {
          resource_type: "image",
        });
      }

      // Upload new avatar to Cloudinary
      const uploaded = await cloudinary.uploader.upload(avatar.path, {
        folder: "kel.tlogosari/avatar",
        public_id: avatar.originalname.split(".")[0],
        overwrite: true,
        resource_type: "image",
      });

      // Update avatar URL and ID
      user.avatar = uploaded.secure_url;
      user.avatarId = uploaded.public_id;
    }

    // Save updated user
    await user.save();

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: userData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil",
      error: error.message,
    });
  }
};
