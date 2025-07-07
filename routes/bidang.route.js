import {
  createBidang,
  getAllBidang,
  deleteBidang,
} from "../controllers/bidang.controller.js";
import express from "express";

const router = express.Router();

router.post("/create", createBidang);

router.get("/all", getAllBidang);

router.delete("/delete/:id", deleteBidang);

export default router;
