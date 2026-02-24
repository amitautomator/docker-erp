import { motion } from "motion/react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectLabel,
  SelectValue,
  SelectItem,
  SelectTrigger,
  SelectSeparator,
} from "../ui/select";
import {
  Controller,
  useForm,
  SubmitHandler,
  useFieldArray,
} from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const taxSchema = z.object({
  taxName: z.string().min(1, "Tax name is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
  pricesIncludeTax: z.boolean(),
  compoundTax: z.boolean(),
  defaultTaxRate: z.string().min(1, "Default tax rate is required"),
});

type TaxForm = z.infer<typeof taxSchema>;

type TaxRate = {
  id: number;
  name: string;
  rate: number;
  enabled: boolean;
};

export default function TaxSetting() {
  const [customTaxRates, setCustomTaxRates] = useState<TaxRate[]>([
    { id: 1, name: "GST", rate: 18, enabled: true },
    { id: 2, name: "CGST", rate: 9, enabled: true },
    { id: 3, name: "SGST", rate: 9, enabled: true },
  ]);

  const defaultTaxRates = [
    { id: 1, name: "VAT", rate: 18, enabled: true },
    { id: 2, name: "GST", rate: 10, enabled: true },
    { id: 3, name: "Sales Tax", rate: 5, enabled: false },
  ];
  const [isAddTaxDialogOpen, setIsAddTaxDialogOpen] = useState(false);

  const onTaxSubmit: SubmitHandler<TaxForm> = (data) => {
    setCustomTaxRates((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: data.taxName,
        rate: Number(data.taxRate),
        enabled: true,
      },
    ]);
    resetTax();
    setIsAddTaxDialogOpen(false);
    toast.success("Tax rate added!");
  };

  const {
    register: regTax,
    handleSubmit: handleTaxSubmit,
    formState: { errors: taxErrors },
    reset: resetTax,
    control: controlTax,
  } = useForm<TaxForm>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxName: "",
      taxRate: "",
      pricesIncludeTax: false,
      compoundTax: false,
      defaultTaxRate: "",
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tax Configuration</CardTitle>
              <CardDescription>
                Manage tax rates and additional fees
              </CardDescription>
            </div>
            <Dialog
              open={isAddTaxDialogOpen}
              onOpenChange={setIsAddTaxDialogOpen}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Tax Rate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Tax Rate</DialogTitle>
                  <DialogDescription>Create a new tax rate</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTaxSubmit(onTaxSubmit)}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxName">Tax Name</Label>
                      <Input
                        id="taxName"
                        placeholder="e.g., VAT"
                        {...regTax("taxName")}
                      />
                      {taxErrors.taxName && (
                        <p className="text-xs text-red-500">
                          {taxErrors.taxName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        placeholder="18"
                        {...regTax("taxRate")}
                      />
                      {taxErrors.taxRate && (
                        <p className="text-xs text-red-500">
                          {taxErrors.taxRate.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetTax();
                        setIsAddTaxDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Tax</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTaxSubmit(onTaxSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Tax Rates
              </h3>
              <div className="space-y-3">
                {customTaxRates.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-3">
                      <IconReceipt className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-100">
                          {tax.name}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {tax.rate}% tax rate
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tax.enabled}
                        onCheckedChange={(val) =>
                          setCustomTaxRates((prev) =>
                            prev.map((t) =>
                              t.id === tax.id ? { ...t, enabled: val } : t,
                            ),
                          )
                        }
                      />
                      <Button variant="ghost" size="sm" type="button">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="text-red-600"
                        onClick={() =>
                          setCustomTaxRates((prev) =>
                            prev.filter((t) => t.id !== tax.id),
                          )
                        }
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax Settings */}
            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Tax Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Prices Include Tax</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Product prices include tax amount
                    </p>
                  </div>
                  <Controller
                    name="pricesIncludeTax"
                    control={controlTax}
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
                    <Label>Compound Tax</Label>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Calculate tax on tax (cascading)
                    </p>
                  </div>
                  <Controller
                    name="compoundTax"
                    control={controlTax}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Tax Rate</Label>
                  <Controller
                    name="defaultTaxRate"
                    control={controlTax}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {customTaxRates.map((tax) => (
                            <SelectItem key={tax.id} value={tax.id.toString()}>
                              {tax.name} ({tax.rate}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Button type="submit">Save Tax Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
