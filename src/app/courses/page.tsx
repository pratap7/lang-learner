import type { Metadata } from "next";
import { CoursesOverview } from "@/components/courses/CoursesOverview";

export const metadata: Metadata = {
  title: "German Courses (A1–C2) — DeutschPfad",
  description:
    "Explore CEFR-aligned German courses from beginner A1 to native-level C2. Interactive lessons, vocabulary audio, and grammar matrices.",
};

export default function CoursesPage() {
  return <CoursesOverview />;
}
