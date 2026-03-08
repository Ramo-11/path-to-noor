"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

interface LessonOption {
  _id: string;
  title: { en: string; ar: string };
}

interface QuizOption {
  textEn: string;
  textAr: string;
  textEs: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  questionEn: string;
  questionAr: string;
  questionEs: string;
  options: QuizOption[];
  explanationEn: string;
  explanationAr: string;
  explanationEs: string;
}

function emptyOption(): QuizOption {
  return { textEn: "", textAr: "", textEs: "", isCorrect: false };
}

function emptyQuestion(): QuizQuestion {
  return {
    questionEn: "",
    questionAr: "",
    questionEs: "",
    options: [emptyOption(), emptyOption()],
    explanationEn: "",
    explanationAr: "",
    explanationEs: "",
  };
}

export default function NewQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [lessonId, setLessonId] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [required, setRequired] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([emptyQuestion()]);

  useEffect(() => {
    fetch("/api/admin/lessons")
      .then((res) => res.json())
      .then((data) => setLessons(data.data || []))
      .catch(() => {});
  }, []);

  function updateQuestion(index: number, field: keyof QuizQuestion, value: string) {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateOption(qIndex: number, oIndex: number, field: keyof QuizOption, value: string | boolean) {
    setQuestions((prev) => {
      const updated = [...prev];
      const question = { ...updated[qIndex] };
      const options = [...question.options];
      options[oIndex] = { ...options[oIndex], [field]: value };
      question.options = options;
      updated[qIndex] = question;
      return updated;
    });
  }

  function addOption(qIndex: number) {
    setQuestions((prev) => {
      const updated = [...prev];
      const question = { ...updated[qIndex] };
      question.options = [...question.options, emptyOption()];
      updated[qIndex] = question;
      return updated;
    });
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestions((prev) => {
      const updated = [...prev];
      const question = { ...updated[qIndex] };
      question.options = question.options.filter((_, i) => i !== oIndex);
      updated[qIndex] = question;
      return updated;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        lessonId,
        passingScore,
        required,
        questions: questions.map((q) => ({
          question: { en: q.questionEn, ar: q.questionAr, es: q.questionEs },
          options: q.options.map((o) => ({
            text: { en: o.textEn, ar: o.textAr, es: o.textEs },
            isCorrect: o.isCorrect,
          })),
          explanation: { en: q.explanationEn, ar: q.explanationAr, es: q.explanationEs },
        })),
      };

      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create quiz");
        return;
      }

      router.push("/admin/quizzes");
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/quizzes"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quizzes
        </Link>
      </div>

      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Create Quiz
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Lesson Select */}
          <div>
            <label htmlFor="lessonId" className={labelClass}>
              Lesson
            </label>
            <select
              id="lessonId"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select a lesson...</option>
              {lessons.map((lesson) => (
                <option key={lesson._id} value={lesson._id}>
                  {lesson.title.en}
                </option>
              ))}
            </select>
          </div>

          {/* Passing Score & Required */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="passingScore" className={labelClass}>
                Passing Score (%)
              </label>
              <input
                id="passingScore"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="flex items-center pt-7">
              <input
                id="required"
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="required" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                Required to pass before continuing
              </label>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Questions
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Question {qIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove question"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Question (English)</label>
                    <input
                      type="text"
                      value={question.questionEn}
                      onChange={(e) => updateQuestion(qIndex, "questionEn", e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Question (Arabic)</label>
                    <input
                      type="text"
                      value={question.questionAr}
                      onChange={(e) => updateQuestion(qIndex, "questionAr", e.target.value)}
                      dir="rtl"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Question (Spanish)</label>
                    <input
                      type="text"
                      value={question.questionEs}
                      onChange={(e) => updateQuestion(qIndex, "questionEs", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">
                    Options
                  </label>
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                    >
                      <div className="flex items-center pt-2.5">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) => updateOption(qIndex, oIndex, "isCorrect", e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-600 text-green-600 focus:ring-green-500"
                          title="Mark as correct"
                        />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={option.textEn}
                          onChange={(e) => updateOption(qIndex, oIndex, "textEn", e.target.value)}
                          placeholder="Option (English)"
                          required
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={option.textAr}
                          onChange={(e) => updateOption(qIndex, oIndex, "textAr", e.target.value)}
                          placeholder="Option (Arabic)"
                          dir="rtl"
                          className={inputClass}
                        />
                        <input
                          type="text"
                          value={option.textEs}
                          onChange={(e) => updateOption(qIndex, oIndex, "textEs", e.target.value)}
                          placeholder="Option (Spanish)"
                          className={inputClass}
                        />
                      </div>
                      {question.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="p-1.5 mt-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove option"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Option
                  </button>
                </div>

                {/* Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Explanation (English, optional)</label>
                    <input
                      type="text"
                      value={question.explanationEn}
                      onChange={(e) => updateQuestion(qIndex, "explanationEn", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Explanation (Arabic, optional)</label>
                    <input
                      type="text"
                      value={question.explanationAr}
                      onChange={(e) => updateQuestion(qIndex, "explanationAr", e.target.value)}
                      dir="rtl"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Explanation (Spanish, optional)</label>
                    <input
                      type="text"
                      value={question.explanationEs}
                      onChange={(e) => updateQuestion(qIndex, "explanationEs", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 font-medium text-sm transition-colors inline-flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Creating..." : "Create Quiz"}
            </button>
            <Link
              href="/admin/quizzes"
              className="px-6 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
