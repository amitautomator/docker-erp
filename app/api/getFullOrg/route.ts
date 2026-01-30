// import axios from "axios";

import { db } from "@/drizzle/src/db/db";
import { eq } from "drizzle-orm";
import { organization } from "@/drizzle/schema";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const dbData = await db
      .select()
      .from(organization)
      .where(eq(organization.id, data.id));
    console.log("Organization Data from DB:", dbData);
    return Response.json(dbData[0]);
  } catch (error) {
    console.error("Error fetching organization data:", error);
    return Response.json(
      { error: "Failed to fetch organization" },
      { status: 500 },
    );
  }
}
