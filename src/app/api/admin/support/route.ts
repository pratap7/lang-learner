import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentAdminUser,
  getSupportTickets,
  addSupportTicketMessage,
  updateSupportTicketStatus,
} from "@/lib/adminService";
import { ROLE_PERMISSIONS } from "@/types/admin";

export async function GET(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canManageUsers && currentAdmin.role !== "curator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "all";
  const category = searchParams.get("category") || "all";
  const priority = searchParams.get("priority") || "all";

  const tickets = getSupportTickets({ status, category, priority });
  return NextResponse.json({ tickets, total: tickets.length });
}

export async function POST(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();

  try {
    const body = await request.json();
    const { ticketId, message, isInternal } = body;

    if (!ticketId || !message) {
      return NextResponse.json({ error: "Missing ticketId or message text" }, { status: 400 });
    }

    const reply = addSupportTicketMessage(ticketId, message, Boolean(isInternal));
    if (!reply) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to post message" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, status, assignedTo } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "Missing ticketId or status" }, { status: 400 });
    }

    const updated = updateSupportTicketStatus(ticketId, status, assignedTo);
    if (!updated) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update ticket" }, { status: 500 });
  }
}
