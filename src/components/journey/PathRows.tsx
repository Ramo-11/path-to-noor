import { PathCard } from "@/components/paths/PathCard";
import type { PathOutline } from "@/lib/learning-types";

interface PathRowsProps {
  paths: PathOutline[];
  locale: string;
}

export function PathRows({ paths, locale }: PathRowsProps) {
  return (
    <ul className={`grid gap-5 ${paths.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
      {paths.map((path) => (
        <li key={path.id} className="flex">
          <PathCard path={path} locale={locale} wide={paths.length === 1} />
        </li>
      ))}
    </ul>
  );
}
