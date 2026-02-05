import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/getServerSession";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { email, role, organizationId } = await req.json();

    console.log(email, role, organizationId, "server session user");

    if (!email || !role || !organizationId) {
      return NextResponse.json(
        { error: "Email, role, and organizationId are required" },
        { status: 400 },
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    console.log("Organization ID:", organizationId);

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    const headersList = await headers();

    const data = await auth.api.createInvitation({
      body: { email, role, organizationId, resend: true },
      headers: headersList,
    });

    console.log("Invitation created:", data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error inviting user:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    // Add specific error handling for auth API errors
    if (error?.response?.status === 409) {
      return NextResponse.json(
        { error: "User already invited or exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: error?.message || "Failed to invite user" },
      { status: 500 },
    );
  }
}
