import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser, getFeatureFlags, updateFeatureFlag } from "@/lib/adminService";
import { ROLE_PERMISSIONS } from "@/types/admin";

export async function GET() {
  const flags = getFeatureFlags();
  return NextResponse.json({ flags, count: flags.length });
}

export async function PATCH(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canManageFeatureFlags) {
    return NextResponse.json({ error: "Unauthorized: Insufficient permissions to manage feature flags" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { flagId, enabled, rolloutPercentage, description } = body;

    if (!flagId) {
      return NextResponse.json({ error: "Missing flagId" }, { status: 400 });
    }

    const updated = updateFeatureFlag(flagId, { enabled, rolloutPercentage, description });
    if (!updated) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, flag: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update feature flag" }, { status: 500 });
  }
}
