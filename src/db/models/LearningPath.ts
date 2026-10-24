import mongoose, { Schema, Document, Model } from "mongoose";
import { STAGES, type StageKey } from "@/lib/stages";
import { DEFAULT_PATH_TRACKS, TRACKS, type TrackKey } from "@/lib/tracks";

export interface ILearningPath extends Document {
  title: { en: string; ar: string; es: string };
  description: { en: string; ar: string; es: string };
  slug: string;
  thumbnail: string;
  stage?: StageKey;
  tracks: TrackKey[];
  order: number;
  outcomes: Array<{ en: string; ar: string; es: string }>;
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
    stage: {
      type: String,
      enum: STAGES,
      default: undefined,
    },
    tracks: {
      type: [{ type: String, enum: TRACKS }],
      default: () => [...DEFAULT_PATH_TRACKS],
    },
    order: { type: Number, default: 1 },
    outcomes: [
      {
        _id: false,
        en: { type: String, default: "", trim: true },
        ar: { type: String, default: "", trim: true },
        es: { type: String, default: "", trim: true },
      },
    ],
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

LearningPathSchema.index({ stage: 1, order: 1 });
LearningPathSchema.index({ tracks: 1, order: 1 });

export const LearningPath: Model<ILearningPath> =
  mongoose.models.LearningPath ||
  mongoose.model<ILearningPath>("LearningPath", LearningPathSchema);
