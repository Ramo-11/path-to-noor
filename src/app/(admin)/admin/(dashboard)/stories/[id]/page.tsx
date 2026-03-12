"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StoryForm } from "../StoryForm";

interface StoryData {
  _id: string;
  personName: { en: string; ar: string; es: string };
  title: { en: string; ar: string; es: string };
  excerpt: { en: string; ar: string; es: string };
  content: { en: string; ar: string; es: string };
  videoUrl: string;
  videoType: "youtube" | "upload" | "none";
  thumbnail: string;
  type: "text" | "video" | "both";
  featured: boolean;
  published: boolean;
  order: number;
}

export default function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStory() {
      try {
        const res = await fetch(`/api/admin/stories/${id}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to load story");
          return;
        }
        const json = await res.json();
        setStory(json.data);
      } catch {
        setError("Failed to load story");
      } finally {
        setLoading(false);
      }
    }
    fetchStory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error || "Story not found"}</p>
      </div>
    );
  }

  return (
    <StoryForm
      mode="edit"
      initialData={{
        _id: story._id,
        personName: story.personName,
        title: story.title,
        excerpt: story.excerpt,
        content: story.content || { en: "", ar: "", es: "" },
        videoUrl: story.videoUrl || "",
        videoType: story.videoType || "none",
        thumbnail: story.thumbnail || "",
        type: story.type || "text",
        featured: story.featured,
        published: story.published,
        order: story.order,
      }}
    />
  );
}
