import Slider from "../models/slider.model.js";
import cloudinary from "../config/cloudinary.js";

export const uploadSlider = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "kel.sendangmulyo/sliderIMG",
            public_id: file.originalname.split(".")[0],
            resource_type: "image",
            overwrite: true,
          });
          return uploaded.secure_url;
        })
      );
    }

    const newSlider = new Slider({
      images: imageUrls,
    });

    await newSlider.save();

    res.status(201).json({
      success: true,
      message: "Slider berhasil diupload",
      data: newSlider,
    });
  } catch (error) {
    console.error("Slider upload error:", error);
    res.status(500).json({
      success: false,
      message: "Slider gagal diupload",
      error: error.message,
    });
  }
};

export const getAllSlider = async (req, res) => {
  try {
    const sliders = await Slider.find().populate("images", "url");
    res.status(200).json({ success: true, data: sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const editSlider = async (req, res) => {
  const { id } = req.params; // ID slider yang akan diupdate
  try {
    let imageUrls = [];

    // Jika ada file yang diupload
    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const uploaded = await cloudinary.uploader.upload(file.path, {
            folder: "kel.sendangmulyo/sliderIMG",
            public_id: file.originalname.split(".")[0],
            resource_type: "image",
            overwrite: true,
          });
          return uploaded.secure_url; // Ambil URL gambar yang diupload
        })
      );
    }

    // Cari slider berdasarkan ID
    const slider = await Slider.findById(id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider tidak ditemukan",
      });
    }

    // Update gambar slider
    slider.images = imageUrls; // Ganti gambar lama dengan gambar baru
    await slider.save(); // Simpan perubahan ke database

    res.status(200).json({
      success: true,
      message: "Slider berhasil diperbarui",
      data: slider,
    });
  } catch (error) {
    console.error("Slider update error:", error);
    res.status(500).json({
      success: false,
      message: "Slider gagal diperbarui",
      error: error.message,
    });
  }
};

export const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    await Slider.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Slider berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSliderById = async (req, res) => {
  try {
    const { id } = req.params;
    const slider = await Slider.findById(id).populate("images", "url");
    res.status(200).json({ success: true, data: slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
