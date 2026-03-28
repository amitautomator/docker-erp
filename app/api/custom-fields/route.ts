import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/src/db/db";
import { customFieldDefinitions, dropdownOptions } from "@/drizzle/schema";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";

type IncomingField = {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string | null;
  accept?: string | null;
  multiple?: boolean;
  sortOrder: number;
  options?: { label: string; value: string; sortOrder: number }[];
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fields: IncomingField[] = body.fields;

    // 🔥 Replace with your auth logic
    const organizationId = "org_123";

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // ✅ TRANSACTION (VERY IMPORTANT)
    await db.transaction(async (tx) => {
      // 1. Delete existing schema (replace mode)
      const existingFields = await tx
        .select()
        .from(customFieldDefinitions)
        .where(eq(customFieldDefinitions.organizationId, organizationId));

      const existingIds = existingFields.map((f) => f.id);

      if (existingIds.length > 0) {
        await tx
          .delete(dropdownOptions)
          .where(
            and(...existingIds.map((id) => eq(dropdownOptions.fieldDefId, id))),
          );

        await tx
          .delete(customFieldDefinitions)
          .where(eq(customFieldDefinitions.organizationId, organizationId));
      }

      // 2. Insert new fields
      for (const field of fields) {
        const fieldId = nanoid();

        await tx.insert(customFieldDefinitions).values({
          id: fieldId,
          organizationId,
          label: field.label,
          fieldType: field.type as any,
          required: field.required ?? false,
          placeholder: field.placeholder ?? null,
          accept: field.accept ?? null,
          multiple: field.multiple ?? false,
          sortOrder: field.sortOrder,
        });

        // 3. Insert dropdown options
        if (field.type === "dropdown" && field.options?.length) {
          await tx.insert(dropdownOptions).values(
            field.options.map((opt) => ({
              id: nanoid(),
              fieldDefId: fieldId,
              label: opt.label,
              value: opt.value,
              sortOrder: opt.sortOrder,
            })),
          );
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Schema save error:", error);

    return NextResponse.json(
      { error: "Failed to save schema" },
      { status: 500 },
    );
  }
}
