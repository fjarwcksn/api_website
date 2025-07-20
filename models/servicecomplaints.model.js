import mongoose from "mongoose";

const serviceComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  images: [{ type: String, required: true }], // Changed to optional to allow complaints without images
  msg: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  adminResponse: {
    responderName: { type: String, required: false },
    responseText: { type: String, required: false },
    respondedAt: { type: Date, required: false },
  },
});

const ServiceComplaints = mongoose.model(
  "ServiceComplaint",
  serviceComplaintSchema
);

export default ServiceComplaints;
