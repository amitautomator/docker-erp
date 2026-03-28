// import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/getServerSession";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/src/db/db"; // Your Drizzle db instance
import { organization } from "@/drizzle/schema";

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.json();

    if (!formData?.id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    console.log("✅ Better Auth Organization Created:", formData);

    const result = await db
      .update(organization)
      .set({
        business_website: formData.business_website,
        business_type: formData.business_type,
        business_address: formData.business_address,
        business_phone: formData.business_phone,
        business_email: formData.business_email,
        team_size: formData.team_size,
        business_country: formData.business_country,
        business_state: formData.business_state,
        business_city: formData.business_city,
        business_pincode: formData.business_pincode,
        gst: formData.gst,
      })
      .where(eq(organization.id, formData.id))
      .returning();

    console.log("✅ Organization Update Result: in Route file", result);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Organization updated successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("❌ Organization creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create organization",
      },
      { status: 500 },
    );
  }
}
