import { localized, type LocalizedText } from "@/lib/stages";
import type { CheckQuestion } from "./KnowledgeCheck";

export interface ClientQuiz {
  id: string;
  questions: CheckQuestion[];
}

function asText(value: unknown): LocalizedText {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    en: typeof v.en === "string" ? v.en : "",
    ar: typeof v.ar === "string" ? v.ar : "",
    es: typeof v.es === "string" ? v.es : "",
  };
}

export function toClientQuiz(doc: unknown, locale: string): ClientQuiz | null {
  if (!doc || typeof doc !== "object") return null;
  const quiz = doc as { _id?: unknown; questions?: unknown };
  if (!Array.isArray(quiz.questions)) return null;

  const questions: CheckQuestion[] = quiz.questions.map((raw) => {
    const q = (raw && typeof raw === "object" ? raw : {}) as { question?: unknown; options?: unknown };
    const options = Array.isArray(q.options) ? q.options : [];
    return {
      question: localized(asText(q.question), locale),
      options: options.map((option) =>
        localized(asText((option as { text?: unknown } | null)?.text), locale)
      ),
    };
  });

  if (questions.length === 0 || questions.some((q) => q.options.length === 0)) return null;
  return { id: String(quiz._id), questions };
}
