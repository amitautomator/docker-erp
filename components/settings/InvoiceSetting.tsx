import z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { IconPlus } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Switch } from "../ui/switch";

const invoiceSettingsSchema = z.object({
  showLogo: z.boolean(),
  showTaxBreakdown: z.boolean(),
  showPaymentInstructions: z.boolean(),
});

type InvoiceSettingsForm = z.infer<typeof invoiceSettingsSchema>;

const defaultInvoiceStatuses = [
  "draft",
  "sent",
  "viewed",
  "partial",
  "paid",
  "overdue",
  "cancelled",
];

const defaultItemTypes = ["product", "service"];

const defaultInvoiceTypes = [
  "invoice",
  "quote",
  "proforma",
  "credit_note",
  "debit_note",
];

export default function InvoiceSetting() {
  // ✅ useForm moved inside the component
  const { control: controlInvoice, handleSubmit: handleInvoice } =
    useForm<InvoiceSettingsForm>({
      resolver: zodResolver(invoiceSettingsSchema),
      defaultValues: {
        showLogo: true,
        showTaxBreakdown: true,
        showPaymentInstructions: true,
      },
    });

  const onInvoiceSubmit = (data: InvoiceSettingsForm) => {
    console.log(data);
    toast.success("Invoice settings updated successfully!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Invoice Configuration</CardTitle>
          <CardDescription>
            Manage invoice types, statuses, and item types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvoice(onInvoiceSubmit)} className="space-y-6">
            {/* Invoice Types */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Invoice Types
                </h3>
                <Button size="sm" variant="outline" type="button">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Custom Type
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {defaultInvoiceTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                  >
                    <Badge variant="secondary">Default</Badge>
                    <span className="text-sm font-medium capitalize text-neutral-800 dark:text-neutral-100">
                      {type.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice Statuses */}
            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Invoice Statuses
                </h3>
                <Button size="sm" variant="outline" type="button">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Custom Status
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {defaultInvoiceStatuses.map((status) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                  >
                    <Badge variant="secondary">Default</Badge>
                    <span className="text-sm font-medium capitalize text-neutral-800 dark:text-neutral-100">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Types */}
            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Item Types
                </h3>
                <Button size="sm" variant="outline" type="button">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Custom Type
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {defaultItemTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                  >
                    <Badge variant="secondary">Default</Badge>
                    <span className="text-sm font-medium capitalize text-neutral-800 dark:text-neutral-100">
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Display Options
              </h3>
              <div className="space-y-4">
                {(
                  [
                    {
                      name: "showLogo",
                      label: "Show Company Logo",
                      desc: "Display your company logo on invoices",
                    },
                    {
                      name: "showTaxBreakdown",
                      label: "Show Tax Breakdown",
                      desc: "Show detailed tax calculation",
                    },
                    {
                      name: "showPaymentInstructions",
                      label: "Show Payment Instructions",
                      desc: "Include payment terms and instructions",
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <Label>{item.label}</Label>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {item.desc}
                      </p>
                    </div>
                    <Controller
                      name={item.name}
                      control={controlInvoice}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
