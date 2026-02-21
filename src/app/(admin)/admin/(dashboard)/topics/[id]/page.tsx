"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { TopicForm } from "../TopicForm";

interface TopicData {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  icon: string;
  parent: { _id: string; name: { en: string; ar: string }; slug: string } | string | null;
  order: number;
  published: boolean;
}

export default function EditTopicPage() {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/admin/topics/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to load topic");
          return;
        }
        const json = await res.json();
        setTopic(json.data);
      } catch {
        setError("Failed to load topic");
      } finally {
        setLoading(false);
      }
    }
    fetchTopic();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error || "Topic not found"}</p>
      </div>
    );
  }

  // Normalize parent field: if populated object, extract _id
  const parentId =
    topic.parent && typeof topic.parent === "object" && "_id" in topic.parent
      ? topic.parent._id
      : typeof topic.parent === "string"
        ? topic.parent
        : null;

  return (
    <TopicForm
      mode="edit"
      initialData={{
        _id: topic._id,
        name: topic.name,
        description: topic.description,
        icon: topic.icon,
        parent: parentId,
        order: topic.order,
        published: topic.published,
      }}
    />
  );
}
