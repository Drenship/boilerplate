import { Schema, model, models, Document, Types } from "mongoose";
import "@/libs/database/mongoose/models/marketplace/marketplace"; // Assurez-vous que ce chemin est correct

export interface IContentAccess extends Document {
  user: Types.ObjectId;
  marketplace: Types.ObjectId;
  accessType: "lifetime" | "subscription";
  contentIds: string[];
  orderId: Types.ObjectId;
  subscriptionId?: Types.ObjectId | null;
  accessGrantedAt: Date;
  accessExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ContentAccessSchema = new Schema<IContentAccess>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    marketplace: {
      type: Schema.Types.ObjectId,
      ref: "Marketplace",
      required: true,
    },
    accessType: {
      type: String,
      enum: ["lifetime", "subscription"],
      required: true,
    },
    contentIds: [{ type: Schema.Types.ObjectId, ref: "MarketplaceContents" }],
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
      default: null,
    },
    accessGrantedAt: { type: Date, default: Date.now },
    accessExpiresAt: { type: Date, default: null },
  },
  {
    timestamps: true, // Ajoute les champs createdAt et updatedAt automatiquement
  }
); 


// Indexation pour optimiser les requêtes fréquentes
ContentAccessSchema.index({ user: 1 });
ContentAccessSchema.index({ marketplace: 1 });
ContentAccessSchema.index({ contentIds: 1 });

export default models.ContentAccess ||
  model<IContentAccess>("ContentAccess", ContentAccessSchema);
