import Bidang from "../models/bidang.model.js";

export const createBidang = async (req, res) => {
  try {
    const { name } = req.body;
    const bidang = new Bidang({ name });
    await bidang.save();
    return res
      .status(201)
      .json({ success: true, message: "Bidang berhasil dibuat" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBidang = async (req, res) => {
  try {
    const bidang = await Bidang.find();
    return res.status(200).json({ success: true, bidang });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBidang = async (req, res) => {
  try {
    const { id } = req.params;
    await Bidang.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Bidang berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
