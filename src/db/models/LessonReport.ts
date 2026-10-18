import mongoose, { Schema, Document, Model } from "mongoose";

export const REPORT_KINDS = ["helpful", "not_helpful", "report"] as const;
export const REPORT_REASONS = ["incorrect", "translation", "video", "other"] as const;
export const REPORT_STATUSES = ["open", "resolved"] as const;

export type ReportKind = (typeof REPORT_KINDS)[number];
export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export interface ILessonReport extends Document {
  lessonId: mongoose.Types.ObjectId;
  lessonSlug: string;
  locale: string;
  kind: ReportKind;
  reason?: ReportReason;
  note?: string;
  userId?: mongoose.Types.ObjectId;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LessonReportSchema = new Schema<ILessonReport>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    lessonSlug: { type: String, required: true },
    locale: { type: String, required: true },
    kind: { type: String, enum: REPORT_KINDS, required: true },
    reason: { type: String, enum: REPORT_REASONS, default: undefined },
    note: { type: String, default: undefined, maxlength: 1000 },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
    status: { type: String, enum: REPORT_STATUSES, default: "open" },
  },
  { timestamps: true }
);

LessonReportSchema.index({ kind: 1, status: 1, createdAt: -1 });
LessonReportSchema.index({ lessonId: 1, kind: 1 });

export const LessonReport: Model<ILessonReport> =
  mongoose.models.LessonReport ||
  mongoose.model<ILessonReport>("LessonReport", LessonReportSchema);
