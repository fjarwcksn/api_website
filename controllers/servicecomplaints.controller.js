import ServiceComplaint from "../models/servicecomplaints.model.js";
import cloudinary from "../config/cloudinary.js";

export const createServicecomplaints = async (req, res) => {
  try {
    const { name, email, phone, msg, title } = req.body;

    if (!name || !email || !phone || !msg || !title) {
      return res.status(400).json({
        success: false,
        message: "Semua field (name, email, phone, msg, title) wajib diisi.",
      });
    }

    const validateName = (name) => {
      const nameRegex = /^[a-zA-Z\s]+$/;
      return nameRegex.test(name);
    };

    if (!validateName(name)) {
      return res.status(400).json({
        success: false,
        message: "Format nama tidak valid.",
      });
    }

    const validatePhone = (phone) => {
      const phoneRegex = /^\d{10,12}$/;
      return phoneRegex.test(phone);
    };

    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Format nomor telepon tidak valid.",
      });
    }

    // Validate message and title to prevent script/code syntax
    const validateMsg = (msg, title) => {
      // Regex to detect common script or HTML tags
      const scriptRegex =
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<[^>]+>|javascript:/i;
      // Additional checks for suspicious characters or patterns (e.g., eval, onclick)
      const dangerousPatterns =
        /(eval|javascript|onerror|onload|onclick|onmouseover|alert\()|(<|>|<|>)/i;
      return (
        !scriptRegex.test(msg) &&
        !scriptRegex.test(title) &&
        !dangerousPatterns.test(msg) &&
        !dangerousPatterns.test(title)
      );
    };

    if (!validateMsg(msg, title)) {
      return res.status(400).json({
        success: false,
        message: "Masukan isi pengaduan atau judul dengan benar!",
      });
    }

    // Upload gambar ke Cloudinary jika ada file yang diunggah
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "kel.sendangmulyo/sevice",
            public_id: file.originalname.split(".")[0],
            resource_type: "image",
            overwrite: true,
          });
          return uploaded.secure_url; // Simpan URL gambar
        })
      );
    }

    const serviceComplaint = new ServiceComplaint({
      name,
      title,
      email,
      phone,
      msg,
      images: imageUrls,
    });

    await serviceComplaint.save();

    res.status(201).json({
      success: true,
      data: serviceComplaint,
      message: "Berhasil mengirim pengaduan",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengirim pengaduan" });
  }
};

export const getAllServicecomplaints = async (req, res) => {
  try {
    const serviceComplaints = await ServiceComplaint.find().sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: serviceComplaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteServicecomplaints = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await ServiceComplaint.findByIdAndDelete(id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Pengaduan tidak ditemukan" });
    }
    res
      .status(200)
      .json({ success: true, message: "Pengaduan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToServiceComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { responderName, responseText } = req.body;

    // Validate input
    if (!responderName || !responseText) {
      return res.status(400).json({
        success: false,
        message: "Semua field (responderName, responseText) wajib diisi.",
      });
    }

    // Validate responderName
    const validateName = (name) => {
      const nameRegex = /^[a-zA-Z\s]+$/;
      return nameRegex.test(name);
    };

    if (!validateName(responderName)) {
      return res.status(400).json({
        success: false,
        message: "Format nama responden tidak valid.",
      });
    }

    // Validate responseText to prevent script/code syntax
    const validateResponse = (text) => {
      const scriptRegex =
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|<[^>]+>|javascript:/i;
      const dangerousPatterns =
        /(eval|javascript|onerror|onload|onclick|onmouseover|alert\()|(<|>|<|>)/i;
      return !scriptRegex.test(text) && !dangerousPatterns.test(text);
    };

    if (!validateResponse(responseText)) {
      return res.status(400).json({
        success: false,
        message: "Masukan tanggapan dengan benar!",
      });
    }

    // Find and update the complaint
    const complaint = await ServiceComplaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Pengaduan tidak ditemukan",
      });
    }

    complaint.adminResponse = {
      responderName,
      responseText,
      respondedAt: new Date(),
    };

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
      message: "Tanggapan berhasil ditambahkan",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan tanggapan",
    });
  }
};
