import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  image?: string;
  role: "super_admin" | "admin" | "user";
  isActive: boolean;
  preferredLanguage: "en" | "ar";
  accounts?: Array<{
    provider: string;
    providerAccountId: string;
  }>;
  progress: Array<{
    lessonId: mongoose.Types.ObjectId;
    completedAt: Date;
  }>;
  bookmarks: mongoose.Types.ObjectId[];
  quizResults: Array<{
    quizId: mongoose.Types.ObjectId;
    score: number;
    passed: boolean;
    completedAt: Date;
  }>;
  resetToken?: string;
  resetTokenExpiry?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false },
    name: { type: String, required: true, trim: true },
    image: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "admin", "user"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    preferredLanguage: {
      type: String,
      enum: ["en", "ar"],
      default: "en",
    },
    accounts: [
      {
        provider: String,
        providerAccountId: String,
      },
    ],
    progress: [
      {
        lessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Lesson" }],
    quizResults: [
      {
        quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
        score: { type: Number, required: true },
        passed: { type: Boolean, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
