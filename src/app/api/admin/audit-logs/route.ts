import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser, getAdminAuditLogs } from "@/lib/adminService";
import { ROLE_PERMISSIONS, type AdminRole } from "@/types/admin";

export async function GET(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canViewAuditLogs) {
    return NextResponse.json({ error: "Unauthorized: Insufficient permissions to view audit logs" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const role = (searchParams.get("role") as AdminRole | "all") || undefined;
  const entityType = searchParams.get("entityType") || undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 100;

  const logs = getAdminAuditLogs({ search, role, entityType, limit });
  return NextResponse.json({ logs, count: logs.length });
}
