import mongoose from "mongoose";
import Bidang from "./bidang.model.js";

const dataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  date: { type: String, required: true },
  time: { type: String, required: true },
  bidang: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bidang",
    required: true,
  },
});

const Data = mongoose.model("Data", dataSchema);

export default Data;
