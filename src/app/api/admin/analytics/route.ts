import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser, getAdminAnalytics } from "@/lib/adminService";
import { ROLE_PERMISSIONS } from "@/types/admin";

export async function GET(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canViewAnalytics) {
    return NextResponse.json({ error: "Unauthorized: Insufficient permissions to view executive analytics" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as any) || "30d";

  const analytics = getAdminAnalytics(period);
  return NextResponse.json(analytics);
}
