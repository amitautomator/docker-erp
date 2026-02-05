import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

export async function GET(
  request: Request,
  { params }: { params: { invitationID: string } },
) {
  try {
    const { invitationID } = await params;
    console.log("Accepting invitation ID:", invitationID);
    const data = await auth.api.acceptInvitation({
      body: { invitationId: invitationID },
      headers: await headers(),
    });
    console.log("Invitation accepted:", data);
    if (!data) {
      return NextResponse.json(
        { error: "Failed to accept invitation" },
        { status: 400 },
      );
    }
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? new URL(request.url).origin;
    return NextResponse.redirect(new URL("/user/team-members", baseUrl));
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    if (error.message?.includes("expired")) {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 410 },
      );
    }
    if (error.message?.includes("already accepted")) {
      return NextResponse.json(
        { error: "This invitation has already been accepted" },
        { status: 409 },
      );
    }
    if (error.message?.includes("not found")) {
      return NextResponse.json(
        { error: "Invitation not found or invalid" },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
