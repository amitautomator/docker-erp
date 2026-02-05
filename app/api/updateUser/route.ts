import { getServerSession } from "@/lib/getServerSession";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/src/db/db"; // Your Drizzle db instance
import { users } from "@/drizzle/schema";

export async function POST(req: Request) {
  // Should add try-catch block to handle potential errors
  try {
    const session = await getServerSession();
    console.log("✅ Update User Session: updateUser", session);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Should validate required fields before update
    if (!body.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const result = await db
      .update(users)
      .set({
        phone: body.phone,
        dob: body.dob,
        doj: body.doj,
      })
      .where(eq(users.id, body.id))
      .returning();

    // Should check if update was successful
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated", data: result[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
