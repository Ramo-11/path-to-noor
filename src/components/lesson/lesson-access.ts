export type LessonAccess = "open" | "signIn" | "hidden";

interface AccessFields {
  audience?: unknown;
  guestAccessible?: unknown;
}

export function lessonAccess(
  lesson: AccessFields,
  user: { id?: string; userType?: string } | null | undefined
): LessonAccess {
  const mentorOnly = lesson.audience === "mentor";
  if (!user?.id) {
    return lesson.guestAccessible === false || mentorOnly ? "signIn" : "open";
  }
  if (mentorOnly && user.userType === "revert") return "hidden";
  return "open";
}
