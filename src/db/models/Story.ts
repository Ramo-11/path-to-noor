import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStory extends Document {
  personName: { en: string; ar: string; es: string };
  title: { en: string; ar: string; es: string };
  excerpt: { en: string; ar: string; es: string };
  content: { en: string; ar: string; es: string };
  videoUrl: string;
  videoType: "youtube" | "upload" | "none";
  thumbnail: string;
  type: "text" | "video" | "both";
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    personName: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: "", trim: true },
      es: { type: String, default: "", trim: true },
    },
    title: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: "", trim: true },
      es: { type: String, default: "", trim: true },
    },
    excerpt: {
      en: { type: String, required: true },
      ar: { type: String, default: "" },
      es: { type: String, default: "" },
    },
    content: {
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
      es: { type: String, default: "" },
    },
    videoUrl: { type: String, default: "" },
    videoType: {
      type: String,
      enum: ["youtube", "upload", "none"],
      default: "none",
    },
    thumbnail: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "video", "both"],
      default: "text",
    },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StorySchema.index({ published: 1, order: 1 });
StorySchema.index({ featured: 1, published: 1 });

export const Story: Model<IStory> =
  mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
