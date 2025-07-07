import mongoose from "mongoose";

const bidangSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const Bidang = mongoose.model("Bidang", bidangSchema);

export default Bidang;
