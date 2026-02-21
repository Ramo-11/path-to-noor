import Link from "next/link";
import { HelpCircle, Pencil } from "lucide-react";
import { getQuizzes } from "@/lib/data";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { QuizDeleteButton } from "./QuizDeleteButton";

interface QuizRow {
  _id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lessonId: any;
  required: boolean;
  passingScore: number;
  questionsCount: number;
}

const columns: Column<QuizRow>[] = [
  {
    key: "lesson",
    header: "Lesson",
    render: (item) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">
          {item.lessonId?.title?.en || "Unknown Lesson"}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400" dir="rtl">
          {item.lessonId?.title?.ar || ""}
        </p>
      </div>
    ),
  },
  {
    key: "questions",
    header: "Questions",
    render: (item) => (
      <span className="text-slate-600 dark:text-slate-400">
        {item.questionsCount}
      </span>
    ),
  },
  {
    key: "passingScore",
    header: "Passing Score",
    render: (item) => (
      <span className="text-slate-600 dark:text-slate-400">
        {item.passingScore}%
      </span>
    ),
  },
  {
    key: "required",
    header: "Required",
    render: (item) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          item.required
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
        }`}
      >
        {item.required ? "Required" : "Optional"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (item) => (
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/quizzes/${item._id}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <QuizDeleteButton id={item._id} />
      </div>
    ),
  },
];

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const params = paginationSchema.parse(rawParams);
  const { data, pagination } = await getQuizzes(params);

  const serialized: QuizRow[] = data.map((q) => ({
    _id: q._id.toString(),
    lessonId: q.lessonId,
    required: q.required,
    passingScore: q.passingScore,
    questionsCount: q.questions?.length || 0,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Quizzes"
        description="Assess learner understanding with lesson quizzes"
        icon={HelpCircle}
        createHref="/admin/quizzes/new"
        createLabel="Create Quiz"
      />

      <DataTable
        columns={columns}
        data={serialized}
        keyField="_id"
        emptyMessage="No quizzes found"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
