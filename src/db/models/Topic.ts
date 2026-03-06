import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITopic extends Document {
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  slug: string;
  icon: string;
  parent: mongoose.Types.ObjectId | null;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, default: "", trim: true },
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String, default: "" },
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, default: "" },
    parent: { type: Schema.Types.ObjectId, ref: "Topic", default: null },
    order: { type: Number, default: 1 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TopicSchema.index({ parent: 1, order: 1 });

export const Topic: Model<ITopic> =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
