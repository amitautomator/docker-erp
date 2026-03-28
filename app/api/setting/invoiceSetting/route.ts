import { NextResponse } from "next/server";
import { db } from "@/drizzle/src/db/db";
import { invoiceSetting } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "@/lib/getServerSession";
import { Code } from "lucide-react";

type DocConfig = {
  label: string;
  isCustom: boolean;
  prefix: string;
  nextNumber: string;
  dueDays: string;
  statuses: string[];
  customStatuses: string[];
  footerText: string;
  terms: string;
  showLogo: boolean;
  showTaxBreakdown: boolean;
  showTermsandConditions: boolean;
};

type InvoiceConfigs = Record<string, DocConfig>;

export async function POST(req: Request) {
  const {
    configs,
    organization,
  }: { configs: InvoiceConfigs; organization: { id: string } } =
    await req.json();

  const session = await getServerSession();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // console.log("Received invoice settings payload:", { configs, organization });

  if (!organization?.id) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 },
    );
  }

  const docTypes = Object.keys(configs);
  const prefix: Record<string, string> = {};
  const default_due_days: Record<string, number> = {};
  const status_options: Record<string, string[]> = {};
  const payment_terms: Record<string, string> = {};
  const number_padding: Record<string, number> = {};
  const footer_text: Record<string, string> = {};
  const show_logo: Record<string, boolean> = {};
  const show_tax_breakdown: Record<string, boolean> = {};
  const show_terms_and_conditions: Record<string, boolean> = {};

  for (const [type, cfg] of Object.entries(configs)) {
    prefix[type] = cfg.prefix;
    default_due_days[type] = Number(cfg.dueDays);
    status_options[type] = [...cfg.statuses, ...cfg.customStatuses];
    payment_terms[type] = cfg.terms;
    number_padding[type] = 1001; // Default padding; can be made configurable later
    footer_text[type] = cfg.footerText;
    show_logo[type] = cfg.showLogo;
    show_tax_breakdown[type] = cfg.showTaxBreakdown;
    show_terms_and_conditions[type] = cfg.showTermsandConditions;
  }

  const payload = {
    organizationId: organization.id,
    invoice_types: docTypes,
    prefix,
    default_due_days,
    status_options,
    payment_terms,
    number_padding,
    footer_text,
    show_logo,
    show_tax_breakdown,
    show_terms_and_conditions,
  };

  console.log("Constructed payload for DB upsert:", payload);

  const existing = await db
    .select({ id: invoiceSetting.id })
    .from(invoiceSetting)
    .where(eq(invoiceSetting.organizationId, organization.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(invoiceSetting)
      .set(payload)
      .where(eq(invoiceSetting.organizationId, organization.id));
  } else {
    await db.insert(invoiceSetting).values({ id: uuidv4(), ...payload });
  }

  return NextResponse.json({ message: "Invoice settings saved.", code: 200 });
}
