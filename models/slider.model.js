import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
  images: [{ type: String, required: true }],
});

const Slider = mongoose.model("Slider", sliderSchema);

export default Slider;
