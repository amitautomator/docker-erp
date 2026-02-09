import { getServerSession } from "@/lib/getServerSession";
import { db } from "@/drizzle/src/db/db";
import { member, organization, users } from "@/currentSchema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { orgID } = await req.json();
  console.log(orgID);

  const session = await getServerSession();
  if (!session) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: No session found" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // const members = await db
  //   .select()
  //   .from(member)
  //   .where(eq(member.organizationId, orgID));

  const data = await db.query.member.findMany({
    where: eq(member.organizationId, orgID),
    with: { users: true },
  });

  return new Response(JSON.stringify({ message: "Success", data }), {
    headers: { "Content-Type": "application/json" },
  });
}
