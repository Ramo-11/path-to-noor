import mongoose, { Schema, Document, Model } from "mongoose";

export interface IModule extends Document {
  title: { en: string; ar: string; es: string };
  description: { en: string; ar: string; es: string };
  slug: string;
  thumbnail: string;
  topics: mongoose.Types.ObjectId[];
  lessons: Array<{
    lessonId: mongoose.Types.ObjectId;
    order: number;
  }>;
  audience: "all" | "revert" | "mentor";
  guestAccessible: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    title: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: "", trim: true },
      es: { type: String, default: "", trim: true },
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String, default: "" },
      es: { type: String, default: "" },
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    thumbnail: { type: String, default: "" },
    topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
    lessons: [
      {
        lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
        order: { type: Number, default: 1 },
      },
    ],
    audience: {
      type: String,
      enum: ["all", "revert", "mentor"],
      default: "all",
    },
    guestAccessible: { type: Boolean, default: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Module: Model<IModule> =
  mongoose.models.Module || mongoose.model<IModule>("Module", ModuleSchema);
