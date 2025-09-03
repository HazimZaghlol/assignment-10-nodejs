import mongoose from "mongoose";

const { Schema } = mongoose;

const SentEmailSchema = new Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  type: { type: String },
  sentAt: { type: Date, default: Date.now },
});

export const SentEmail = mongoose.model("SentEmail", SentEmailSchema);
