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
} from "../ui/card";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import z from "zod";
import { IconCheck } from "@tabler/icons-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "../ui/textarea";

const templateSchema = z.object({
  activeTemplate: z.string().min(1, "Template is required"),
  primaryColor: z.string().min(1, "Color is required"),
  footerText: z.string().optional(),
  terms: z.string().optional(),
});

type TemplateForm = z.infer<typeof templateSchema>;

export default function TemplateSetting() {
  const [activeTemplate, setActiveTemplate] = useState("Modern");

  const {
    register: regTemplate,
    handleSubmit: handleTemplate,
    control: controlTemplate,
    formState: { errors: templateErrors, isSubmitting: isTemplateSubmitting },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      activeTemplate: "Modern",
      primaryColor: "#3b82f6",
      footerText: "Thank you for your business!",
      terms:
        "Payment is due within 30 days. Late payments may incur additional fees.",
    },
  });

  const onTemplateSubmit: SubmitHandler<TemplateForm> = (data) => {
    console.log("Template:", data);
    toast.success("Template settings saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Invoice Templates</CardTitle>
          <CardDescription>
            Customize invoice templates and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleTemplate(onTemplateSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Active Template
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {["Modern", "Classic", "Minimal", "Professional"].map(
                  (template) => (
                    <div
                      key={template}
                      onClick={() => setActiveTemplate(template)}
                      className={`group cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        activeTemplate === template
                          ? "border-blue-500"
                          : "border-neutral-200 hover:border-blue-300 dark:border-neutral-700"
                      }`}
                    >
                      <div className="mb-3 h-32 rounded bg-neutral-100 dark:bg-neutral-800" />
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-neutral-800 dark:text-neutral-100">
                          {template}
                        </p>
                        {activeTemplate === template && (
                          <Badge variant="default" className="bg-blue-500">
                            <IconCheck className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Customization
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-3">
                    <Controller
                      name="primaryColor"
                      control={controlTemplate}
                      render={({ field }) => (
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={field.value}
                            onChange={field.onChange}
                            className="h-10 w-20 cursor-pointer rounded-md border border-neutral-200"
                          />
                          <Input
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1"
                            placeholder="#3b82f6"
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
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
                    {/* <Controller
                      name={item.name}
                      control={controlInvoice}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    /> */}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Button type="submit">Save Template Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
