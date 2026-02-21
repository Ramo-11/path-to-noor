"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface QuizDeleteButtonProps {
  id: string;
}

export function QuizDeleteButton({ id }: QuizDeleteButtonProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete quiz");
        return;
      }
      router.refresh();
    } catch {
      alert("Failed to delete quiz");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setDeleteOpen(true)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Quiz?"
        message="This action cannot be undone. The quiz will be permanently deleted."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
