import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentAdminUser,
  searchLearners,
  manualUpdateUserSubscription,
  issueRefundForUser,
} from "@/lib/adminService";
import { ROLE_PERMISSIONS } from "@/types/admin";

export async function GET(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canManageUsers) {
    return NextResponse.json({ error: "Unauthorized: Insufficient permissions to view users" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const plan = searchParams.get("plan") || "all";
  const status = searchParams.get("status") || "all";
  const level = searchParams.get("level") || "all";

  const learners = searchLearners(q, { plan, status, level });
  return NextResponse.json({ learners, total: learners.length });
}

export async function PATCH(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canModifySubscriptions) {
    return NextResponse.json({ error: "Unauthorized: Only Admins can manually modify subscriptions" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, plan, status, reason } = body;

    if (!userId || !plan || !status) {
      return NextResponse.json({ error: "Missing required parameters (userId, plan, status)" }, { status: 400 });
    }

    const updated = manualUpdateUserSubscription(userId, plan, status, reason || "Admin manual modification");
    if (!updated) {
      return NextResponse.json({ error: "Learner user not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, learner: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user subscription" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canIssueRefunds) {
    return NextResponse.json({ error: "Unauthorized: Only Admins can issue refunds" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, amount, currency, reason } = body;

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: "Missing required parameters (userId, amount)" }, { status: 400 });
    }

    const result = issueRefundForUser(userId, Number(amount), currency || "USD", reason || "Customer satisfaction guarantee");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process refund" }, { status: 500 });
  }
}
