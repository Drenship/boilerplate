import { Schema, model, models, set } from "mongoose";

// @Schema
const VerificationTokenSchema = new Schema({
  expires: {
    type: Date,
    trim: true,
  },
  token: {
    type: String,
    trim: true,
  },
  identifier: {
    type: String,
    trim: true,
  },
});

export default models.VerificationToken || model("VerificationToken", VerificationTokenSchema);