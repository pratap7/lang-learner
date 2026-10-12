import { redirect } from "next/navigation";

export default function MistakesPage() {
  redirect("/progress?tab=mistakes");
}
