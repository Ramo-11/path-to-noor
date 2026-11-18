export interface LibrarySubjectCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  lessonCount: number;
  completedCount: number;
  isLearned: boolean;
}

export interface SubtopicView {
  id: string;
  slug: string;
  name: string;
}

export interface SubjectLessonView {
  id: string;
  slug: string;
  title: string;
  type: string;
  minutes: number;
}

export interface SubjectModuleView {
  id: string;
  title: string;
  description: string;
  path: { slug: string; title: string } | null;
  lessons: SubjectLessonView[];
}

export interface SubjectContent {
  subtopics: SubtopicView[];
  modules: SubjectModuleView[];
}

export type SubjectMePayload =
  | { signedIn: false }
  | { signedIn: true; content: SubjectContent; completedLessonIds: string[]; isLearned: boolean };

export type LibraryMePayload = { signedIn: false } | { signedIn: true; subjects: LibrarySubjectCard[] };
