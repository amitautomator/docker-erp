import { getServerSession } from "@/lib/getServerSession";
import { db } from "@/drizzle/src/db/db";
import { member } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { orgID } = await req.json();

  const session = await getServerSession();
  console.log("Session in team-members route:", session);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: No session found" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const data = await db.query.member.findMany({
    where: eq(member.organizationId, orgID),
    with: {
      user: true,
      organization: true,
    },
  });

  // console.log(data);
  return new Response(JSON.stringify({ message: "Success", data }), {
    headers: { "Content-Type": "application/json" },
  });
}
