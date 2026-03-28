"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import {
  IconFileInvoice,
  IconCreditCard,
  IconReceipt,
  IconTemplate,
  IconCurrency,
  IconBoxSeam,
  IconRefresh,
} from "@tabler/icons-react";

import InvoiceSetting from "@/components/settings/InvoiceSetting";
import PaymentSetting from "@/components/settings/PayementSetting";
import TaxSetting from "@/components/settings/TaxSetting";
import TemplateSetting from "@/components/settings/TemplateSetting";
import PriceSetting from "@/components/settings/PriceSetting";
import Inventory from "@/components/settings/Inventory";
import Automation from "@/components/settings/Automation";

type TabType =
  | "invoice"
  | "payment"
  | "taxes"
  | "templates"
  | "pricing"
  | "inventory"
  | "automation";

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "invoice", label: "Invoice Settings", icon: IconFileInvoice },
  { id: "payment", label: "Payment Methods", icon: IconCreditCard },
  { id: "taxes", label: "Taxes & Fees", icon: IconReceipt },
  { id: "templates", label: "Templates", icon: IconTemplate },
  { id: "pricing", label: "Pricing Models", icon: IconCurrency },
  { id: "inventory", label: "Inventory", icon: IconBoxSeam },
  { id: "automation", label: "Automation", icon: IconRefresh },
];

export default function BillingSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("invoice");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-white dark:bg-neutral-900">
        <div className="p-6 md:p-8">
          {/* ── Page header ─────────────────────────────────────── */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-neutral-800 dark:text-neutral-100">
              Billing Settings
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Configure your billing preferences, invoice templates, and payment
              options
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* ── Sidebar ───────────────────────────────────────── */}
            <aside className="w-full lg:w-64 shrink-0">
              <Card className="border-neutral-200 dark:border-neutral-700">
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                            ${
                              isActive
                                ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                                : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100"
                            }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1 text-left">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* ── Content panel ─────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {activeTab === "invoice" && <InvoiceSetting />}
              {activeTab === "payment" && <PaymentSetting />}
              {activeTab === "taxes" && <TaxSetting />}
              {activeTab === "templates" && <TemplateSetting />}
              {activeTab === "pricing" && <PriceSetting />}
              {activeTab === "inventory" && <Inventory />}
              {activeTab === "automation" && <Automation />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
