import { useState } from "react";

import { motion } from "framer-motion";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "../ui/card";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import z from "zod";
import { IconCheck } from "@tabler/icons-react";

import { zodResolver } from "@hookform/resolvers/zod";

const automationSchema = z.object({
  autoSendInvoices: z.boolean(),
  paymentConfirmations: z.boolean(),
  overdueReminders: z.boolean(),
  reminderDaysBefore: z.string(),
  reminderDayAfter: z.string(),
  reminderDaysAfter: z.string(),
  enableRecurring: z.boolean(),
  daysBeforeEnd: z.string(),
});

type AutomationForm = z.infer<typeof automationSchema>;

function Automation() {
  const {
    register: regAutomation,
    handleSubmit: handleAutomation,
    control: controlAutomation,
    formState: { errors: automationErrors },
  } = useForm<AutomationForm>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      autoSendInvoices: true,
      paymentConfirmations: true,
      overdueReminders: true,
      reminderDaysBefore: "7",
      reminderDayAfter: "1",
      reminderDaysAfter: "7",
      enableRecurring: true,
      daysBeforeEnd: "5",
    },
  });

  // ── Submit Handlers ───────────────────────────────────────────────────────

  const onAutomationSubmit: SubmitHandler<AutomationForm> = (data) => {
    console.log("Automation:", data);
    toast.success("Automation settings saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Automation & Notifications</CardTitle>
          <CardDescription>
            Configure automatic actions and reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAutomation(onAutomationSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Email Automation
              </h3>
              <div className="space-y-4">
                {(
                  [
                    {
                      name: "autoSendInvoices",
                      label: "Auto-send Invoices",
                      desc: "Automatically email invoices when created",
                    },
                    {
                      name: "paymentConfirmations",
                      label: "Payment Confirmations",
                      desc: "Send confirmation emails for payments",
                    },
                    {
                      name: "overdueReminders",
                      label: "Overdue Reminders",
                      desc: "Send reminders for overdue invoices",
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
                      control={controlAutomation}
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

            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Reminder Schedule
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    className="w-20"
                    {...regAutomation("reminderDaysBefore")}
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    days before due date
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    className="w-20"
                    {...regAutomation("reminderDayAfter")}
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    day after due date
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    className="w-20"
                    {...regAutomation("reminderDaysAfter")}
                  />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    days after due date
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Recurring Invoices
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Recurring Invoices</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Allow creation of recurring invoices
                    </p>
                  </div>
                  <Controller
                    name="enableRecurring"
                    control={controlAutomation}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daysBeforeEnd">
                    Days Before End to Create Next
                  </Label>
                  <Input
                    id="daysBeforeEnd"
                    type="number"
                    {...regAutomation("daysBeforeEnd")}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Button type="submit">Save Automation Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Automation;
