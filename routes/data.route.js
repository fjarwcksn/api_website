import {
  createData,
  getAllData,
  getDataByTitle,
  getDataByBidang,
  getDataById,
  updateData,
  deleteData,
} from "../controllers/data.controller.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const router = express.Router();

router.post("/create", upload.array("images", 10), createData);

router.get("/all", getAllData);

router.patch("/edit/:id", upload.array("images", 10), updateData);

router.delete("/delete/:id", deleteData);

router.get("/bidang/:bidang", getDataByBidang);

router.get("/:title", getDataByTitle);

router.get("/get/:id", getDataById);

export default router;
