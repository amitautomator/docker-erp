import { useState, useRef, useEffect } from "react";
import z from "zod";

import {
  useForm,
  Controller,
  Control,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import axios from "axios";
import { fetchOrgData } from "@/lib/utils";

import {
  IconPlus,
  IconTrash,
  IconFileInvoice,
  IconReceipt,
  IconFileText,
  IconArrowNarrowRight,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react";

const BUILT_IN_TYPES = [
  "invoice",
  "quote",
  "proforma",
  "credit_note",
  "debit_note",
] as const;

type BuiltInType = (typeof BUILT_IN_TYPES)[number];

const DEFAULT_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "partial",
  "paid",
  "overdue",
  "cancelled",
];

const typeConfigSchema = z.object({
  label: z.string().min(1, "Label is required"),
  isCustom: z.boolean(),
  prefix: z.string().min(1, "Prefix is required"),
  nextNumber: z.string().min(1, "Next number is required"),
  dueDays: z.string().min(1, "Due days is required"),
  statuses: z.array(z.string()).min(1, "At least one status required"),
  customStatuses: z.array(z.object({ label: z.string().min(1) })),
  footerText: z.string().optional(),
  terms: z.string().optional(),
  showLogo: z.boolean(),
  showTaxBreakdown: z.boolean(),
  showTermsandConditions: z.boolean(),
});

const formSchema = z.object({
  configs: z.record(z.string(), typeConfigSchema),
});

type TypeConfig = z.infer<typeof typeConfigSchema>;

type FormValues = z.infer<typeof formSchema>;

const BUILT_IN_SEED: Record<BuiltInType, Partial<TypeConfig>> = {
  invoice: {
    label: "Invoice",
    prefix: "INV-",
    dueDays: "30",
    footerText: "Thank you for your business.",
    terms: "Payment due within 30 days.",
  },
  quote: {
    label: "Quote",
    prefix: "QTE-",
    dueDays: "14",
    footerText: "This quote is valid for 14 days.",
    terms: "Prices subject to change after expiry.",
  },
  proforma: {
    label: "Proforma",
    prefix: "PRO-",
    dueDays: "7",
    footerText: "This is a proforma invoice.",
    terms: "Full payment required before dispatch.",
  },
  credit_note: {
    label: "Credit Note",
    prefix: "CRN-",
    dueDays: "0",
    footerText: "Credit applied to your account.",
    terms: "Issued as per our returns policy.",
  },
  debit_note: {
    label: "Debit Note",
    prefix: "DBN-",
    dueDays: "30",
    footerText: "",
    terms: "",
  },
};

const makeConfig = (
  overrides: Partial<TypeConfig> & { label: string; isCustom: boolean },
): TypeConfig => ({
  prefix: "CUS-",
  nextNumber: "1001",
  dueDays: "30",
  statuses: DEFAULT_STATUSES,
  customStatuses: [],
  footerText: "",
  terms: "",
  showLogo: true,
  showTaxBreakdown: true,
  showTermsandConditions: false,
  ...overrides,
});

const buildDefaults = (): FormValues["configs"] => {
  const configs: FormValues["configs"] = {};
  BUILT_IN_TYPES.forEach((key) => {
    configs[key] = makeConfig({
      ...BUILT_IN_SEED[key],
      label: BUILT_IN_SEED[key].label!,
      isCustom: false,
      showTermsandConditions: key === "invoice" || key === "proforma",
    });
  });
  return configs;
};

const STATUS_COLORS: Record<string, string> = {
  draft:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  viewed:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  partial:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  cancelled:
    "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  invoice: <IconFileInvoice className="h-3.5 w-3.5" />,
  quote: <IconArrowNarrowRight className="h-3.5 w-3.5" />,
  proforma: <IconReceipt className="h-3.5 w-3.5" />,
  credit_note: <IconFileText className="h-3.5 w-3.5" />,
  debit_note: <IconFileText className="h-3.5 w-3.5" />,
};

const slugify = (str: string) =>
  str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

function AddTypePopover({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    setOpen(false);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
          open
            ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
            : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300",
        )}
      >
        <IconPlus className="h-3.5 w-3.5" />
        Add Type
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+4px)] left-0 z-50 w-64 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl p-3 space-y-2.5"
          >
            <div>
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                New invoice type
              </p>
              <p className="text-[11px] text-neutral-400">
                Give it a name — you can configure everything after.
              </p>
            </div>
            <Input
              ref={inputRef}
              placeholder="e.g. Rental Invoice"
              className="h-8 text-sm"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
                if (e.key === "Escape") setOpen(false);
              }}
            />
            {value.trim() && (
              <p className="text-[11px] text-neutral-400">
                Key:{" "}
                <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 rounded">
                  {slugify(value)}
                </code>
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 text-xs flex-1"
                type="button"
                onClick={submit}
                disabled={!value.trim()}
              >
                <IconCheck className="h-3 w-3 mr-1" /> Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2"
                type="button"
                onClick={() => setOpen(false)}
              >
                <IconX className="h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeleteConfirm({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm rounded-b-lg"
    >
      <div className="text-center space-y-3 max-w-xs px-6">
        <div className="flex justify-center text-amber-500">
          <IconAlertTriangle className="h-9 w-9" />
        </div>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          Delete{" "}
          <span className="text-neutral-900 dark:text-white">
            &quot;{label}&quot;
          </span>{" "}
          ?
        </p>
        <p className="text-xs text-neutral-500">
          All configuration for this type will be permanently lost.
        </p>
        <div className="flex gap-2 justify-center pt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs px-4"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-8 text-xs px-4"
            type="button"
            onClick={onConfirm}
          >
            Delete Type
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function TypeConfigPanel({
  typeKey,
  isCustom,
  control,
  register,
  errors,
  watch,
  setValue,
  onDelete,
}: {
  typeKey: string;
  isCustom: boolean;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  watch: UseFormWatch<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  onDelete?: () => void;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const base = `configs.${typeKey}` as const; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customStatuses = (watch(base as any)?.customStatuses ?? []) as {
    label: string;
  }[]; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedStatuses: string[] = (watch(base as any)?.statuses ??
    DEFAULT_STATUSES) as string[];

  const toggleStatus = (status: string) => {
    const next = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue(`${base}.statuses` as any, next, { shouldDirty: true });
  };

  const addCustomStatus = () => {
    setValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `${base}.customStatuses` as any,
      [...customStatuses, { label: "" }],
      {
        shouldDirty: true,
      },
    );
  };

  const removeCustomStatus = (idx: number) => {
    setValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      `${base}.customStatuses` as any,
      customStatuses.filter((_: { label: string }, i: number) => i !== idx),
      { shouldDirty: true },
    );
  };

  return (
    <div className="relative space-y-6">
      <AnimatePresence>
        {showDelete && (
          <DeleteConfirm
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={(watch(base as any)?.label ?? typeKey) as string}
            onConfirm={() => {
              setShowDelete(false);
              onDelete?.();
            }}
            onCancel={() => setShowDelete(false)}
          />
        )}
      </AnimatePresence>

      {/* Custom type header — rename + delete */}
      {isCustom && (
        <div className="flex items-end gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex-1 space-y-1.5 max-w-xs">
            <Label className="text-xs text-neutral-500">Type Label</Label>
            <Input
              placeholder="e.g. Rental Invoice"
              className="h-8 text-sm"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...register(`${base}.label` as any)}
            />
            {errors?.configs?.[typeKey]?.label && (
              <p className="text-xs text-red-500">
                {errors.configs[typeKey].label.message}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setShowDelete(true)}
            className="h-8 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 gap-1.5"
          >
            <IconTrash className="h-3.5 w-3.5" />
            Delete Type
          </Button>
        </div>
      )}

      {/* Numbering */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Numbering
        </h4>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              name: "prefix",
              label: "Prefix",
              type: "text",
              placeholder: "INV-",
            },
            {
              name: "nextNumber",
              label: "Next Number",
              type: "number",
              placeholder: "1001",
            },
            {
              name: "dueDays",
              label: "Due Days",
              type: "number",
              placeholder: "30",
            },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name} className="space-y-1.5">
              <Label className="text-xs text-neutral-500 dark:text-neutral-400">
                {label}
              </Label>
              <Input
                type={type}
                placeholder={placeholder}
                className="h-9 text-sm" // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...register(`${base}.${name}` as any)}
              />
              {errors?.configs?.[typeKey]?.[name as keyof TypeConfig] && (
                <p className="text-xs text-red-500">
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (errors.configs[typeKey][name as keyof TypeConfig] as any)
                      ?.message
                  }
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Statuses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Invoice Statuses
          </h4>
          <button
            type="button"
            onClick={addCustomStatus}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <IconPlus className="h-3 w-3" /> Add custom
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEFAULT_STATUSES.map((status) => {
            const active = selectedStatuses.includes(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatus(status)}
                title={active ? "Click to disable" : "Click to enable"}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all border select-none",
                  active
                    ? cn(
                        STATUS_COLORS[status] ??
                          "bg-neutral-100 text-neutral-700",
                        "border-transparent shadow-sm",
                      )
                    : "border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600 bg-transparent",
                )}
              >
                {status}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {customStatuses.map((cs: { label: string }, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <Input
                placeholder="Custom status label..."
                className="h-8 text-sm flex-1" // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...register(`${base}.customStatuses.${idx}.label` as any)}
              />
              <button
                type="button"
                onClick={() => removeCustomStatus(idx)}
                className="text-neutral-400 hover:text-red-500 transition-colors shrink-0"
              >
                <IconX className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Display toggles */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Display Options
        </h4>
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              ["showLogo", "Show Logo"],
              ["showTaxBreakdown", "Tax Breakdown"],
              ["showPaymentInstructions", "Payment Instructions"],
            ] as const
          ).map(([field, label]) => (
            <div
              key={field}
              className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-2.5"
            >
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                {label}
              </span>
              <Controller // eslint-disable-next-line @typescript-eslint/no-explicit-any
                name={`${base}.${field}` as any}
                control={control}
                render={({ field: f }) => (
                  <Switch
                    checked={f.value}
                    onCheckedChange={f.onChange}
                    className="scale-90"
                  />
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer & Terms */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400">
            Footer Text
          </Label>
          <Input
            placeholder="Printed at the bottom of the document"
            className="h-9 text-sm" // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...register(`${base}.footerText` as any)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-neutral-500 dark:text-neutral-400">
            Terms & Conditions
          </Label>
          <Textarea
            rows={3}
            placeholder="Enter terms and conditions..."
            className="text-sm resize-none" // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...register(`${base}.terms` as any)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InvoiceSetting() {
  const [typeOrder, setTypeOrder] = useState<string[]>([...BUILT_IN_TYPES]);
  const [activeTab, setActiveTab] = useState<string>("invoice");

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      configs: buildDefaults(),
    },
  });

  const handleAddType = (label: string) => {
    const key = slugify(label);
    if (!key) {
      toast.error("Invalid name.");
      return;
    }
    if (typeOrder.includes(key)) {
      toast.error(`A type with key "${key}" already exists.`);
      return;
    }
    setValue(`configs.${key}`, makeConfig({ label, isCustom: true }), {
      shouldDirty: true,
    });
    setTypeOrder((prev) => [...prev, key]);
    setActiveTab(key);
    toast.success(`"${label}" type created!`);
  };

  const handleDeleteType = (key: string) => {
    const configs = getValues("configs");
    const updated = { ...configs };
    delete updated[key]; // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("configs", updated as any, { shouldDirty: true });
    const newOrder = typeOrder.filter((k) => k !== key);
    setTypeOrder(newOrder);
    setActiveTab(newOrder[newOrder.length - 1] ?? "");
  };

  const onSubmitInvoice = async (data: FormValues) => {
    try {
      console.log("Invoice settings:", data);
      const organization = await fetchOrgData();
      if (!organization) {
        toast.error("Organization data not found.");
        return;
      }
      await axios.post("/api/setting/invoiceSetting", {
        ...data,
        organization: organization,
      });
      toast.success("Invoice settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1"
    >
      <form onSubmit={handleSubmit(onSubmitInvoice)} className="space-y-5">
        {/* Header */}
        <Card className="border-neutral-200 dark:border-neutral-700">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">
                  Invoice Configuration
                </CardTitle>
                <CardDescription className="mt-0.5 text-sm">
                  Configure each invoice type independently. Create custom types
                  to match your workflow.
                </CardDescription>
              </div>
              {isDirty && (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-300 dark:border-amber-700 dark:text-amber-400 text-xs shrink-0"
                >
                  Unsaved changes
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Per-type configuration */}
        <Card className="border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
            {typeOrder.map((key) => {
              const label = watch(`configs.${key}.label`) ?? key;
              const isCustom = watch(`configs.${key}.isCustom`) ?? false;
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "group flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                    isActive
                      ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                      : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
                  )}
                >
                  {TYPE_ICONS[key] ?? <IconFileText className="h-3.5 w-3.5" />}
                  <span>{label}</span>
                  {isCustom && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none transition-colors",
                        isActive
                          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                          : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400",
                      )}
                    >
                      custom
                    </span>
                  )}
                </button>
              );
            })}

            <AddTypePopover onAdd={handleAddType} />
          </div>

          {/* Config panel */}
          <CardContent className="pt-6 relative min-h-75">
            <AnimatePresence mode="wait">
              {activeTab && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <TypeConfigPanel
                    typeKey={activeTab}
                    isCustom={!!watch(`configs.${activeTab}.isCustom`)}
                    control={control}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    onDelete={
                      watch(`configs.${activeTab}.isCustom`)
                        ? () => handleDeleteType(activeTab)
                        : undefined
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-32.5">
            {isSubmitting ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
