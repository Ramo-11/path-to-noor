import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILearningPath extends Document {
  title: { en: string; ar: string; es: string };
  description: { en: string; ar: string; es: string };
  slug: string;
  thumbnail: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  modules: Array<{
    moduleId: mongoose.Types.ObjectId;
    order: number;
  }>;
  audience: "all" | "revert" | "mentor";
  guestAccessible: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LearningPathSchema = new Schema<ILearningPath>(
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
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    estimatedHours: { type: Number, default: 1 },
    modules: [
      {
        moduleId: { type: Schema.Types.ObjectId, ref: "Module" },
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

export const LearningPath: Model<ILearningPath> =
  mongoose.models.LearningPath ||
  mongoose.model<ILearningPath>("LearningPath", LearningPathSchema);
