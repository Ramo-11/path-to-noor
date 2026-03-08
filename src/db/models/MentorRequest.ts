import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMentorRequest extends Document {
  revertId: mongoose.Types.ObjectId;
  mentorId?: mongoose.Types.ObjectId;
  status: "pending" | "assigned" | "rejected";
  message?: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorRequestSchema = new Schema<IMentorRequest>(
  {
    revertId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: undefined,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "rejected"],
      default: "pending",
    },
    message: { type: String, default: "" },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

MentorRequestSchema.index({ revertId: 1 });
MentorRequestSchema.index({ mentorId: 1 });
MentorRequestSchema.index({ status: 1 });

export const MentorRequest: Model<IMentorRequest> =
  mongoose.models.MentorRequest ||
  mongoose.model<IMentorRequest>("MentorRequest", MentorRequestSchema);
