import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  image?: string;
  role: "super_admin" | "admin" | "user";
  userType?: "revert" | "mentor";
  isActive: boolean;
  preferredLanguage: "en" | "ar" | "es";
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
  completedTopics: Array<{
    topicId: mongoose.Types.ObjectId;
    completedAt: Date;
  }>;
  assignedMentorId?: mongoose.Types.ObjectId;
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
    userType: {
      type: String,
      enum: ["revert", "mentor"],
      default: undefined,
    },
    isActive: { type: Boolean, default: true },
    preferredLanguage: {
      type: String,
      enum: ["en", "ar", "es"],
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
    completedTopics: [
      {
        topicId: { type: Schema.Types.ObjectId, ref: "Topic" },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    assignedMentorId: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
