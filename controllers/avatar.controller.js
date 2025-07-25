import User from "../models/user.models.js";
import cloudinary from "../config/cloudinary.js";

export const uploadAvatar = async (req, res) => {
  try {
    // Pastikan user ditemukan berdasarkan ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    // Validasi apakah ada file yang diunggah
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada file yang diunggah" });
    }

    // Map file untuk mendapatkan URL dan ID dari Cloudinary dengan nama asli
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        // Mengunggah file ke Cloudinary dengan nama asli
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder: "kel.sendangmulyo/avatar", // Folder tujuan di Cloudinary
          public_id: file.originalname.split(".")[0], // Nama file tanpa ekstensi
          overwrite: true, // Overwrite jika ada file dengan nama yang sama
          resource_type: "image", // Tipe file
        });

        return {
          url: uploaded.secure_url, // URL gambar dari Cloudinary
        };
      })
    );

    // Simpan avatar ke user (gunakan URL dari gambar pertama)
    user.avatar = imageUrls[0].url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar berhasil diunggah",
      data: { avatar: user.avatar }, // Kirim kembali avatar URL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengunggah avatar",
      error: error.message,
    });
  }
};

export const getAvatar = async (req, res) => {
  try {
    // Pastikan user ditemukan berdasarkan ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: "Avatar berhasil diambil",
      data: { avatar: user.avatar }, // Kirim kembali avatar URL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil avatar",
      error: error.message,
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    // Pastikan user ditemukan berdasarkan ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    // Validasi apakah ada file yang diunggah
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada file yang diunggah" });
    }

    // Jika user sudah memiliki avatar sebelumnya, hapus dari Cloudinary
    if (user.avatarId) {
      await cloudinary.uploader.destroy(user.avatarId, {
        resource_type: "image", // Jenis file
      });
    }

    // Unggah file baru ke Cloudinary
    const file = req.files[0]; // Ambil file pertama (karena hanya satu avatar)
    const uploaded = await cloudinary.uploader.upload(file.path, {
      folder: "kel.sendangmulyo/products", // Folder tujuan di Cloudinary
      public_id: file.originalname.split(".")[0], // Nama file tanpa ekstensi
      overwrite: true, // Ganti jika ada nama file yang sama
      resource_type: "image", // Tipe file
    });

    // Perbarui avatar URL dan avatar ID di user
    user.avatar = uploaded.secure_url; // URL gambar dari Cloudinary
    user.avatarId = uploaded.public_id; // ID file di Cloudinary
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar berhasil diperbarui",
      data: { avatar: user.avatar }, // Kirim kembali avatar URL
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui avatar",
      error: error.message,
    });
  }
};
