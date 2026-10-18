"use client";

import { useSyncExternalStore } from "react";

interface LocalDateProps {
  value: string;
  locale: string;
  className?: string;
}

const noopSubscribe = () => () => {};

function format(value: string, locale: string, timeZone?: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone }).format(new Date(value));
}

export function LocalDate({ value, locale, className }: LocalDateProps) {
  const text = useSyncExternalStore(
    noopSubscribe,
    () => format(value, locale),
    () => format(value, locale, "UTC")
  );

  return (
    <time dateTime={value} className={className}>
      {text}
    </time>
  );
}
