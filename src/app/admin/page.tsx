import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
  title: "Admin & Operations Console — DeutschPfad",
  description:
    "Secure role-based administration portal for curriculum authoring, native reviews, customer subscription management, support inbox, feature flags, and business analytics.",
};

export default function AdminPage() {
  return <AdminLayout />;
}
