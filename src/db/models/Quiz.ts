import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuiz extends Document {
  lessonId: mongoose.Types.ObjectId;
  required: boolean;
  passingScore: number;
  questions: Array<{
    question: { en: string; ar: string; es: string };
    options: Array<{
      text: { en: string; ar: string; es: string };
      isCorrect: boolean;
    }>;
    explanation: { en: string; ar: string; es: string };
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
          es: { type: String, default: "" },
        },
        options: [
          {
            text: {
              en: { type: String, required: true },
              ar: { type: String, required: true },
              es: { type: String, default: "" },
            },
            isCorrect: { type: Boolean, required: true },
          },
        ],
        explanation: {
          en: { type: String, default: "" },
          ar: { type: String, default: "" },
          es: { type: String, default: "" },
        },
      },
    ],
  },
  { timestamps: true }
);

export const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
