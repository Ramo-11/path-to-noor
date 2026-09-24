interface MetaListProps {
  items: Array<string | null | undefined | false>;
  className?: string;
}

export function MetaList({ items, className = "" }: MetaListProps) {
  const visible = items.filter((item): item is string => Boolean(item));
  if (visible.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-y-1 text-meta text-ink-3 ${className}`}>
      {visible.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className={index > 0 ? "ms-3 border-s border-rule ps-3" : ""}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
