import mongoose, { Schema } from "mongoose";
mongoose.set("strictQuery", false);

const SessionSchema = new Schema(
  {
    sessionToken: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expires: { type: Date, required: true },
    device: { type: String, default: "Unknown Device" },
    browser: { type: String, default: "Unknown Browser" },
    location: { type: String, default: "Unknown Location" },
    ip: { type: String, default: "Unknown IP" },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    type: {
      type: String,
      enum: ["desktop", "mobile", "tablet"],
      default: "desktop",
    },
    os: { type: String },
    provider: { type: String },
    failureReason: { type: String },
  },
  {
    timestamps: true,
  }
);

const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default Session;
