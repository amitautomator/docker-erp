"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  IconSettings,
  IconFileInvoice,
  IconCreditCard,
  IconReceipt,
  IconTemplate,
  IconCurrency,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconBoxSeam,
  IconRefresh,
} from "@tabler/icons-react";

import { motion } from "motion/react";
import { toast } from "sonner";

import { z } from "zod";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import GeneralSetting from "@/components/settings/GeneralSetting";
import InvoiceSetting from "@/components/settings/InvoiceSetting";
import PaymentSetting from "@/components/settings/PayementSetting";
import TaxSetting from "@/components/settings/TaxSetting";
import TemplateSetting from "@/components/settings/TemplateSetting";
import PriceSetting from "@/components/settings/PriceSetting";
import Inventory from "@/components/settings/Inventory";
import Automation from "@/components/settings/Automation";
//
//

type TabType =
  | "general"
  | "invoice"
  | "payment"
  | "taxes"
  | "templates"
  | "pricing"
  | "inventory"
  | "automation";

export default function BillingSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  const tabs = [
    {
      id: "general" as TabType,
      label: "General",
      icon: IconSettings,
    },
    {
      id: "invoice" as TabType,
      label: "Invoice Settings",
      icon: IconFileInvoice,
    },
    {
      id: "payment" as TabType,
      label: "Payment Methods",
      icon: IconCreditCard,
    },
    {
      id: "taxes" as TabType,
      label: "Taxes & Fees",
      icon: IconReceipt,
    },
    {
      id: "templates" as TabType,
      label: "Templates",
      icon: IconTemplate,
    },
    {
      id: "pricing" as TabType,
      label: "Pricing Models",
      icon: IconCurrency,
    },
    {
      id: "inventory" as TabType,
      label: "Inventory",
      icon: IconBoxSeam,
    },
    {
      id: "automation" as TabType,
      label: "Automation",
      icon: IconRefresh,
    },
  ];

  // ── Automation Form ───────────────────────────────────────────────────────

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-white dark:bg-neutral-900">
        <div className="p-6 md:p-8">
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
            {/* Sidebar */}
            <div className="lg:w-64">
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
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-100"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            <div className="flex-1">
              {activeTab === "general" && <GeneralSetting />}

              {/* ── INVOICE SETTINGS TAB ── */}
              {activeTab === "invoice" && <InvoiceSetting />}

              {/* ── PAYMENT METHODS TAB ── */}
              {activeTab === "payment" && <PaymentSetting />}

              {/* ── TAXES TAB ── */}
              {activeTab === "taxes" && <TaxSetting />}

              {/* ── TEMPLATES TAB ── */}
              {activeTab === "templates" && <TemplateSetting />}

              {/* ── PRICING TAB ── */}
              {activeTab === "pricing" && <PriceSetting />}

              {/* ── INVENTORY TAB ── */}
              {activeTab === "inventory" && <Inventory />}

              {/* ── AUTOMATION TAB ── */}
              {activeTab === "automation" && <Automation />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
