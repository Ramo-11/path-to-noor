import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILesson extends Document {
  title: { en: string; ar: string };
  content: { en: unknown; ar: unknown }; // TipTap JSON
  slug: string;
  moduleId: mongoose.Types.ObjectId;
  estimatedMinutes: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    content: {
      en: { type: Schema.Types.Mixed, default: null },
      ar: { type: Schema.Types.Mixed, default: null },
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    estimatedMinutes: { type: Number, default: 5 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LessonSchema.index({ moduleId: 1 });

export const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);
