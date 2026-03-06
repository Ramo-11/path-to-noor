import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILearningPath extends Document {
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  slug: string;
  thumbnail: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  modules: Array<{
    moduleId: mongoose.Types.ObjectId;
    order: number;
  }>;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LearningPathSchema = new Schema<ILearningPath>(
  {
    title: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: "", trim: true },
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String, default: "" },
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
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const LearningPath: Model<ILearningPath> =
  mongoose.models.LearningPath ||
  mongoose.model<ILearningPath>("LearningPath", LearningPathSchema);
