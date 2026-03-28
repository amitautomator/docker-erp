import { getServerSession } from "@/lib/getServerSession";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/src/db/db";
import { organization, member } from "@/drizzle/schema";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userID = session.session.userId;

    const memberRecord = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, userID))
      .limit(1);

    if (!memberRecord.length) {
      return NextResponse.json(
        { error: "User not associated with any organization" },
        { status: 404 },
      );
    }

    const organizationId = memberRecord[0].organizationId;

    const existingOrg = await db
      .select()
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    if (!existingOrg.length) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    const currentData = existingOrg[0];
    const body = await req.json();

    const updateData: Partial<typeof organization.$inferInsert> = {};

    if (body.name !== undefined && body.name !== currentData.name)
      updateData.name = body.name;

    if (body.logo !== undefined && body.logo !== currentData.logo)
      updateData.logo = body.logo;

    if (
      body.business_website !== undefined &&
      body.business_website !== currentData.business_website
    )
      updateData.business_website = body.business_website;

    if (
      body.business_type !== undefined &&
      body.business_type !== currentData.business_type
    )
      updateData.business_type = body.business_type;

    if (
      body.business_address !== undefined &&
      body.business_address !== currentData.business_address
    )
      updateData.business_address = body.business_address;

    if (
      body.business_phone !== undefined &&
      body.business_phone !== currentData.business_phone
    )
      updateData.business_phone = body.business_phone;

    if (
      body.business_email !== undefined &&
      body.business_email !== currentData.business_email
    )
      updateData.business_email = body.business_email;

    if (
      body.team_size !== undefined &&
      body.team_size !== currentData.team_size
    )
      updateData.team_size = body.team_size;

    if (body.gst !== undefined && body.gst !== currentData.gst)
      updateData.gst = body.gst;

    // ── new location fields ────────────────────────────────────────────────
    if (
      body.business_city !== undefined &&
      body.business_city !== currentData.business_city
    )
      updateData.business_city = body.business_city;

    if (
      body.business_state !== undefined &&
      body.business_state !== currentData.business_state
    )
      updateData.business_state = body.business_state;

    if (
      body.business_country !== undefined &&
      body.business_country !== currentData.business_country
    )
      updateData.business_country = body.business_country;

    if (
      body.business_pincode !== undefined &&
      body.business_pincode !== currentData.business_pincode
    )
      updateData.business_pincode = body.business_pincode;
    // ──────────────────────────────────────────────────────────────────────

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No changes detected" },
        { status: 200 },
      );
    }

    const result = await db
      .update(organization)
      .set(updateData)
      .where(eq(organization.id, organizationId))
      .returning();

    return NextResponse.json({
      message: "Organization updated",
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
