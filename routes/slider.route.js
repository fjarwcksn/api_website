import {
  uploadSlider,
  getAllSlider,
  editSlider,
  getSliderById,
  deleteSlider,
} from "../controllers/slider.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

// Upload slider
router.post("/create", upload.array("images", 10), uploadSlider);

// Get all slider
router.get("/all", getAllSlider);

// Get slider by ID
router.get("/get/:id", getSliderById);

// Edit slider
router.patch("/edit/:id", upload.array("images", 10), editSlider);

// Delete slider
router.delete("/delete/:id", deleteSlider);

export default router;
