import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMentorApplication extends Document {
  userId: mongoose.Types.ObjectId;
  about: string;
  experience: string;
  languages: Array<"en" | "ar" | "es">;
  otherLanguages?: string;
  availability: string;
  gender: "male" | "female";
  agreedToGuidelines: boolean;
  status: "pending" | "approved" | "declined";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorApplicationSchema = new Schema<IMentorApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    about: { type: String, required: true, trim: true, maxlength: 2000 },
    experience: { type: String, required: true, trim: true, maxlength: 2000 },
    languages: {
      type: [{ type: String, enum: ["en", "ar", "es"] }],
      validate: (v: string[]) => v.length > 0,
    },
    otherLanguages: { type: String, default: "", trim: true, maxlength: 200 },
    availability: { type: String, required: true, trim: true, maxlength: 500 },
    gender: { type: String, enum: ["male", "female"], required: true },
    agreedToGuidelines: { type: Boolean, required: true, validate: (v: boolean) => v === true },
    status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
    adminNote: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true }
);

MentorApplicationSchema.index({ userId: 1, createdAt: -1 });
MentorApplicationSchema.index({ status: 1 });
MentorApplicationSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export const MentorApplication: Model<IMentorApplication> =
  mongoose.models.MentorApplication ||
  mongoose.model<IMentorApplication>("MentorApplication", MentorApplicationSchema);
