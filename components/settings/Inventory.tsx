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

const inventorySchema = z.object({
  trackStock: z.boolean(),
  lowStockAlerts: z.boolean(),
  lowStockThreshold: z.string().min(1, "Threshold is required"),
  allowNegativeStock: z.boolean(),
});

type InventoryForm = z.infer<typeof inventorySchema>;

const defaultStockMovementTypes = [
  "purchase",
  "sale",
  "adjustment",
  "return",
  "transfer",
  "damage",
  "opening_stock",
];

function Inventory() {
  const {
    register: regInventory,
    handleSubmit: handleInventory,
    control: controlInventory,
    formState: { errors: inventoryErrors },
  } = useForm<InventoryForm>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      trackStock: true,
      lowStockAlerts: true,
      lowStockThreshold: "10",
      allowNegativeStock: false,
    },
  });
  const onInventorySubmit: SubmitHandler<InventoryForm> = (data) => {
    console.log("Inventory:", data);
    toast.success("Inventory settings saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Configure stock tracking and movement types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleInventory(onInventorySubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Stock Movement Types
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {defaultStockMovementTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Default</Badge>
                      <span className="text-sm font-medium capitalize text-neutral-800 dark:text-neutral-100">
                        {type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Inventory Settings
              </h3>
              <div className="space-y-4">
                {(
                  [
                    {
                      name: "trackStock",
                      label: "Track Stock Levels",
                      desc: "Enable real-time inventory tracking",
                    },
                    {
                      name: "lowStockAlerts",
                      label: "Low Stock Alerts",
                      desc: "Get notified when stock is running low",
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
                      control={controlInventory}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    {...regInventory("lowStockThreshold")}
                  />
                  {inventoryErrors.lowStockThreshold && (
                    <p className="text-xs text-red-500">
                      {inventoryErrors.lowStockThreshold.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Negative Stock</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Permit overselling and negative inventory
                    </p>
                  </div>
                  <Controller
                    name="allowNegativeStock"
                    control={controlInventory}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Button type="submit">Save Inventory Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default Inventory;
