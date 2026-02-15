import { getServerSession } from "@/lib/getServerSession";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/src/db/db"; // Your Drizzle db instance
import { users } from "@/drizzle/schema";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    console.log(session?.session?.userId);
    if (!session?.session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log(body);

    const updateData: Partial<typeof users.$inferInsert> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.dob !== undefined) updateData.dob = body.dob;
    if (body.doj !== undefined) updateData.doj = body.doj;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.session.userId))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User updated",
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
