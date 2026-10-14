import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentAdminUser,
  getAdminContentItems,
  saveContentItem,
  updateContentReviewStatus,
  addContentReviewerNote,
  bulkExportContent,
  bulkImportContent,
} from "@/lib/adminService";
import { ROLE_PERMISSIONS, type ContentEntityType, type ContentReviewStatus } from "@/types/admin";

export async function GET(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canManageContent) {
    return NextResponse.json({ error: "Unauthorized: Insufficient permissions to view content" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const exportFormat = searchParams.get("export"); // 'json' | 'csv'
  const entityType = searchParams.get("entityType") as ContentEntityType | "all" | null;
  const reviewStatus = searchParams.get("reviewStatus") as ContentReviewStatus | "all" | null;
  const level = searchParams.get("level");
  const search = searchParams.get("search");

  if (exportFormat === "json" || exportFormat === "csv") {
    const exportedData = bulkExportContent(entityType || "all", exportFormat);
    const contentType = exportFormat === "json" ? "application/json" : "text/csv; charset=utf-8";
    const filename = `deutschpfad-content-${entityType || "all"}-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;

    return new Response(exportedData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const items = getAdminContentItems({
    entityType: entityType || undefined,
    reviewStatus: reviewStatus || undefined,
    level: level || undefined,
    search: search || undefined,
  });

  return NextResponse.json({ items, count: items.length });
}

export async function POST(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canManageContent) {
    return NextResponse.json({ error: "Unauthorized: Insufficient permissions to modify content" }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Check if bulk import action
    if (body.action === "bulk_import") {
      const { content, format } = body;
      if (!content || !format) {
        return NextResponse.json({ error: "Missing content or format for bulk import" }, { status: 400 });
      }
      const result = bulkImportContent(content, format);
      return NextResponse.json(result);
    }

    // Check if add reviewer note action
    if (body.action === "add_note") {
      const { contentId, note, statusTag } = body;
      if (!contentId || !note) {
        return NextResponse.json({ error: "Missing contentId or note text" }, { status: 400 });
      }
      const addedNote = addContentReviewerNote(contentId, note, statusTag);
      return NextResponse.json({ success: true, note: addedNote });
    }

    // Otherwise, saving a content item
    const { item } = body;
    if (!item || !item.id || !item.title) {
      return NextResponse.json({ error: "Invalid content item payload" }, { status: 400 });
    }

    const saved = saveContentItem(item);
    return NextResponse.json({ success: true, item: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save content" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const currentAdmin = getCurrentAdminUser();
  const permissions = ROLE_PERMISSIONS[currentAdmin.role];

  if (!permissions.canManageContent) {
    return NextResponse.json({ error: "Unauthorized: Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { contentId, newStatus, note } = body as {
      contentId: string;
      newStatus: ContentReviewStatus;
      note?: string;
    };

    if (!contentId || !newStatus) {
      return NextResponse.json({ error: "Missing contentId or newStatus" }, { status: 400 });
    }

    if (newStatus === "published" && !permissions.canPublishContent) {
      return NextResponse.json({ error: "Unauthorized: Only Curators and Admins can publish content" }, { status: 403 });
    }

    const updated = updateContentReviewStatus(contentId, newStatus, note);
    if (!updated) {
      return NextResponse.json({ error: "Content item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update review status" }, { status: 500 });
  }
}
