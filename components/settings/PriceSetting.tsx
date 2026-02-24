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

const pricingSchema = z.object({
  autoRenew: z.boolean(),
  prorateCharges: z.boolean(),
  trialPeriod: z.string().min(1, "Trial period is required"),
});

type PricingForm = z.infer<typeof pricingSchema>;
const defaultPricingModels = ["simple", "tiered", "subscription"];
const defaultBillingIntervals = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
];

function PriceSetting() {
  const {
    register: regPricing,
    handleSubmit: handlePricing,
    control: controlPricing,
    formState: { errors: pricingErrors },
  } = useForm<PricingForm>({
    resolver: zodResolver(pricingSchema),
    defaultValues: { autoRenew: true, prorateCharges: true, trialPeriod: "14" },
  });

  const onPricingSettingsSubmit: SubmitHandler<PricingForm> = (data) => {
    console.log("Pricing settings:", data);
    toast.success("Pricing settings saved!");
  };

  const onPricingSubmit: SubmitHandler<PricingForm> = (data) => {
    console.log("Pricing:", data);
    toast.success("Pricing settings saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Pricing Models</CardTitle>
          <CardDescription>
            Configure pricing strategies and billing intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePricing(onPricingSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Available Pricing Models
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {defaultPricingModels.map((model) => (
                  <div
                    key={model}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Default</Badge>
                      <span className="text-sm font-medium capitalize text-neutral-800 dark:text-neutral-100">
                        {model}
                      </span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Billing Intervals
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {defaultBillingIntervals.map((interval) => (
                  <div
                    key={interval}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Default</Badge>
                      <span className="text-sm font-medium capitalize text-neutral-800 dark:text-neutral-100">
                        {interval}
                      </span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Subscription Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-renew Subscriptions</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Automatically renew recurring subscriptions
                    </p>
                  </div>
                  <Controller
                    name="autoRenew"
                    control={controlPricing}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prorate Charges</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Calculate prorated amounts for partial periods
                    </p>
                  </div>
                  <Controller
                    name="prorateCharges"
                    control={controlPricing}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trialPeriod">
                    Default Trial Period (days)
                  </Label>
                  <Input
                    id="trialPeriod"
                    type="number"
                    {...regPricing("trialPeriod")}
                  />
                  {pricingErrors.trialPeriod && (
                    <p className="text-xs text-red-500">
                      {pricingErrors.trialPeriod.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Button type="submit">Save Pricing Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PriceSetting;
