import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser, setActiveAdminRole, MOCK_ADMIN_STAFF } from "@/lib/adminService";
import { ROLE_PERMISSIONS, type AdminRole } from "@/types/admin";

export async function GET() {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  return NextResponse.json({
    user: currentAdmin,
    permissions,
    availableRoles: [
      { role: 'super_admin', label: 'Super Admin', user: MOCK_ADMIN_STAFF[0] },
      { role: 'admin', label: 'Operations Admin', user: MOCK_ADMIN_STAFF[1] },
      { role: 'curator', label: 'Curator / Native Reviewer', user: MOCK_ADMIN_STAFF[2] },
      { role: 'support_agent', label: 'Support Agent', user: MOCK_ADMIN_STAFF[3] },
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body as { role: AdminRole };

    if (!role || !ROLE_PERMISSIONS[role]) {
      return NextResponse.json({ error: "Invalid admin role specified" }, { status: 400 });
    }

    setActiveAdminRole(role);
    const updatedUser = getCurrentAdminUser();
    const permissions = ROLE_PERMISSIONS[role];

    return NextResponse.json({
      success: true,
      user: updatedUser,
      permissions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to switch role" }, { status: 500 });
  }
}
