import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuiz extends Document {
  lessonId: mongoose.Types.ObjectId;
  required: boolean;
  passingScore: number;
  questions: Array<{
    question: { en: string; ar: string };
    options: Array<{
      text: { en: string; ar: string };
      isCorrect: boolean;
    }>;
    explanation: { en: string; ar: string };
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      unique: true,
    },
    required: { type: Boolean, default: false },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    questions: [
      {
        question: {
          en: { type: String, required: true },
          ar: { type: String, required: true },
        },
        options: [
          {
            text: {
              en: { type: String, required: true },
              ar: { type: String, required: true },
            },
            isCorrect: { type: Boolean, required: true },
          },
        ],
        explanation: {
          en: { type: String, default: "" },
          ar: { type: String, default: "" },
        },
      },
    ],
  },
  { timestamps: true }
);

export const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
