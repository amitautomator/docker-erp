import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { IconCreditCard, IconEdit, IconTrash } from "@tabler/icons-react";
import { Badge } from "../ui/badge";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { IconPlus } from "@tabler/icons-react";

import { zodResolver } from "@hookform/resolvers/zod";

const defaultPaymentMethods = ["cash", "card", "bank_transfer", "upi"];

const paymentSchema = z.object({
  methodName: z.string().min(1, "Method name is required"),
  methodDetails: z.string().optional(),
});

const defaultPaymentStatuses = ["pending", "completed", "failed", "refunded"];
type PaymentForm = z.infer<typeof paymentSchema>;

export default function PaymentSetting() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customPaymentMethods, setCustomPaymentMethods] = useState<string[]>(
    [],
  );

  const onPaymentSubmit: SubmitHandler<PaymentForm> = (data) => {
    console.log("Payment method:", data);
    setCustomPaymentMethods((prev) => [...prev, data.methodName]);
    resetPayment();
    setIsAddDialogOpen(false);
  };

  const {
    register: regPayment,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    formState: { errors: paymentErrors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { methodName: "", methodDetails: "" },
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
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage available payment methods for invoices
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Custom Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new custom payment method
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePaymentSubmit(onPaymentSubmit)}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="methodName">Method Name</Label>
                      <Input
                        id="methodName"
                        placeholder="e.g., Cryptocurrency"
                        {...regPayment("methodName")}
                      />
                      {paymentErrors.methodName && (
                        <p className="text-xs text-red-500">
                          {paymentErrors.methodName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="methodDetails">Payment Details</Label>
                      <Input
                        id="methodDetails"
                        placeholder="Instructions or account info"
                        {...regPayment("methodDetails")}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetPayment();
                        setIsAddDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Method</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Default Payment Methods
            </h3>
            <div className="space-y-3">
              {defaultPaymentMethods.map((method) => (
                <div
                  key={method}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <IconCreditCard className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                    <div>
                      <p className="font-medium capitalize text-neutral-800 dark:text-neutral-100">
                        {method.replace(/_/g, " ")}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        Default
                      </Badge>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>

          {customPaymentMethods.length > 0 && (
            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Custom Payment Methods
              </h3>
              <div className="space-y-3">
                {customPaymentMethods.map((method, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <div className="flex items-center gap-3">
                      <IconCreditCard className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-100">
                          {method}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          Custom
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch defaultChecked />
                      <Button variant="ghost" size="sm" type="button">
                        <IconEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="text-red-600"
                        onClick={() =>
                          setCustomPaymentMethods((prev) =>
                            prev.filter((_, i) => i !== idx),
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
          )}

          <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Payment Statuses
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {defaultPaymentStatuses.map((status) => (
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
