"use client";

import { useState, useMemo, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  IconPlus,
  IconDownload,
  IconSend,
  IconEdit,
  IconTrash,
  IconEye,
  IconClock,
  IconCheck,
  IconX,
  IconUsers,
  IconCurrencyDollar,
  IconFileInvoice,
  IconCalendar,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconArrowUp,
  IconArrowDown,
  IconPaperclip,
  IconFile,
  IconFileTypePdf,
  IconPhoto,
  IconSettings,
  IconGripVertical,
  IconReceipt,
  IconFileText,
  IconArrowNarrowRight,
  IconTrendingUp,
  IconAlertTriangle,
  IconBuildingStore,
  IconChevronDown,
  IconSparkles,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// DOCUMENT TYPES
// ─────────────────────────────────────────────────────────────

type DocumentType =
  | "invoice"
  | "quote"
  | "proforma"
  | "credit_note"
  | "debit_note";

type DocumentTypeConfig = {
  key: DocumentType;
  label: string;
  description: string;
  prefix: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  accentColor: string;
};

const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  {
    key: "invoice",
    label: "Invoice",
    description: "Request payment for goods or services delivered",
    prefix: "INV",
    icon: <IconFileInvoice className="h-5 w-5" />,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    badgeColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    accentColor: "from-blue-400 to-blue-600",
  },
  {
    key: "quote",
    label: "Quote",
    description: "Provide an estimate before the work begins",
    prefix: "QTE",
    icon: <IconArrowNarrowRight className="h-5 w-5" />,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    badgeColor:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    accentColor: "from-violet-400 to-violet-600",
  },
  {
    key: "proforma",
    label: "Proforma",
    description: "Preliminary invoice before a transaction",
    prefix: "PRO",
    icon: <IconReceipt className="h-5 w-5" />,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    badgeColor:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    accentColor: "from-indigo-400 to-indigo-600",
  },
  {
    key: "credit_note",
    label: "Credit Note",
    description: "Issue a credit against a previous invoice",
    prefix: "CRN",
    icon: <IconFileText className="h-5 w-5" />,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badgeColor:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    accentColor: "from-emerald-400 to-emerald-600",
  },
  {
    key: "debit_note",
    label: "Debit Note",
    description: "Request additional payment for undercharged amounts",
    prefix: "DBN",
    icon: <IconFileText className="h-5 w-5" />,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    badgeColor:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    accentColor: "from-amber-400 to-amber-600",
  },
];

const getDocType = (key?: string) =>
  DOCUMENT_TYPES.find((d) => d.key === key) ?? DOCUMENT_TYPES[0];

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type FieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "file";

type DropdownOption = { label: string; value: string };

type CustomFieldDef = {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: DropdownOption[];
  accept?: string;
  multiple?: boolean;
};

type AttachedFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  customFields: Record<string, string | boolean | string[]>;
  attachments: AttachedFile[];
  createdAt: string;
};

type Invoice = {
  id: string;
  clientName: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  dueDate: string;
  issuedDate: string;
  items: number;
  type?: string;
};

// ─────────────────────────────────────────────────────────────
// CONSTANTS & DATA
// ─────────────────────────────────────────────────────────────

const DEFAULT_FIELD_SCHEMA: CustomFieldDef[] = [
  {
    id: "company_type",
    label: "Company Type",
    type: "dropdown",
    required: false,
    options: [
      { label: "Sole Proprietor", value: "sole" },
      { label: "Partnership", value: "partnership" },
      { label: "Private Ltd", value: "pvt_ltd" },
      { label: "Public Ltd", value: "pub_ltd" },
      { label: "NGO / Trust", value: "ngo" },
    ],
  },
  {
    id: "gst_number",
    label: "GST / Tax ID",
    type: "text",
    required: false,
    placeholder: "e.g. 27AAPFU0939F1ZV",
  },
  {
    id: "billing_address",
    label: "Billing Address",
    type: "textarea",
    required: false,
    placeholder: "123 Main St, City, State, ZIP",
  },
  {
    id: "payment_terms",
    label: "Payment Terms",
    type: "dropdown",
    required: false,
    options: [
      { label: "Due on Receipt", value: "immediate" },
      { label: "Net 7", value: "net7" },
      { label: "Net 15", value: "net15" },
      { label: "Net 30", value: "net30" },
      { label: "Net 60", value: "net60" },
    ],
  },
  {
    id: "website",
    label: "Website",
    type: "text",
    required: false,
    placeholder: "https://example.com",
  },
  {
    id: "notes",
    label: "Internal Notes",
    type: "textarea",
    required: false,
    placeholder: "Any private notes…",
  },
  { id: "active", label: "Active Client", type: "checkbox", required: false },
  {
    id: "documents",
    label: "Documents",
    type: "file",
    required: false,
    accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx",
    multiple: true,
  },
];

const INVOICES: Invoice[] = [
  {
    id: "INV-001",
    clientName: "Acme Corporation",
    amount: 2500,
    status: "paid",
    dueDate: "2026-02-10",
    issuedDate: "2026-01-15",
    items: 5,
    type: "invoice",
  },
  {
    id: "QTE-002",
    clientName: "Tech Solutions Inc",
    amount: 1800,
    status: "pending",
    dueDate: "2026-02-20",
    issuedDate: "2026-02-05",
    items: 3,
    type: "quote",
  },
  {
    id: "INV-003",
    clientName: "Global Industries",
    amount: 3200,
    status: "overdue",
    dueDate: "2026-01-30",
    issuedDate: "2026-01-10",
    items: 7,
    type: "invoice",
  },
  {
    id: "PRO-004",
    clientName: "Startup Hub",
    amount: 950,
    status: "draft",
    dueDate: "2026-03-01",
    issuedDate: "2026-02-14",
    items: 2,
    type: "proforma",
  },
  {
    id: "INV-005",
    clientName: "Design Studio",
    amount: 1500,
    status: "paid",
    dueDate: "2026-02-15",
    issuedDate: "2026-01-20",
    items: 4,
    type: "invoice",
  },
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1234567890",
    customFields: {
      company_type: "pvt_ltd",
      gst_number: "27AAPFU0939F1ZV",
      billing_address: "123 Business Ave, New York",
      payment_terms: "net30",
      website: "https://acme.com",
      notes: "Long-standing client.",
      active: true,
    },
    attachments: [],
    createdAt: "2026-01-10",
  },
  {
    id: "c2",
    name: "Tech Solutions Inc",
    email: "hello@techsolutions.com",
    phone: "+1234567891",
    customFields: {
      company_type: "pvt_ltd",
      payment_terms: "net15",
      active: true,
    },
    attachments: [],
    createdAt: "2026-01-15",
  },
  {
    id: "c3",
    name: "Global Industries",
    email: "info@global.com",
    phone: "+1234567892",
    customFields: {
      company_type: "pub_ltd",
      payment_terms: "net60",
      active: false,
    },
    attachments: [],
    createdAt: "2026-01-08",
  },
];

// ─────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  paid: {
    label: "Paid",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
    icon: IconCheck,
  },
  pending: {
    label: "Pending",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    dot: "bg-amber-400",
    icon: IconClock,
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
    icon: IconAlertTriangle,
  },
  draft: {
    label: "Draft",
    color:
      "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
    dot: "bg-neutral-400",
    icon: IconEdit,
  },
} as const;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);
const formatBytes = (b: number) =>
  b < 1024
    ? `${b} B`
    : b < 1_048_576
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1_048_576).toFixed(1)} MB`;
const fileIcon = (mime: string) => {
  if (mime.startsWith("image/"))
    return <IconPhoto className="h-3.5 w-3.5 text-blue-500" />;
  if (mime === "application/pdf")
    return <IconFileTypePdf className="h-3.5 w-3.5 text-red-500" />;
  return <IconFile className="h-3.5 w-3.5 text-neutral-400" />;
};
const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ─────────────────────────────────────────────────────────────
// DOCUMENT TYPE SELECTOR
// ─────────────────────────────────────────────────────────────

function DocumentTypeSelector({
  selected,
  onChange,
}: {
  selected: DocumentType;
  onChange: (type: DocumentType) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {DOCUMENT_TYPES.map((dt) => {
        const isSelected = selected === dt.key;
        return (
          <button
            key={dt.key}
            type="button"
            onClick={() => onChange(dt.key)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all duration-200 select-none",
              isSelected
                ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-lg scale-[1.03]"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400",
            )}
          >
            <div
              className={cn(
                "rounded-lg p-2 transition-colors",
                isSelected ? "bg-white/20 dark:bg-black/20" : dt.color,
              )}
            >
              {dt.icon}
            </div>
            <span className="text-xs font-semibold leading-tight">
              {dt.label}
            </span>
            {isSelected && (
              <motion.div
                layoutId="type-indicator"
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-900 dark:border-neutral-100 flex items-center justify-center"
                initial={false}
              >
                <IconCheck className="h-2.5 w-2.5 text-neutral-900 dark:text-white" />
              </motion.div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CREATE DOCUMENT DIALOG
// ─────────────────────────────────────────────────────────────

function CreateDocumentDialog({
  open,
  onOpenChange,
  clients,
  defaultType,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clients: Client[];
  defaultType?: DocumentType;
  onCreated?: (invoice: Invoice) => void;
}) {
  const [docType, setDocType] = useState<DocumentType>(
    defaultType ?? "invoice",
  );
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedType = getDocType(docType);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!clientId) errs.client = "Please select a client";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      errs.amount = "Enter a valid amount";
    if (!dueDate) errs.dueDate = "Due date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const client = clients.find((c) => c.id === clientId);
    const counter = Math.floor(Math.random() * 900) + 100;
    const newDoc: Invoice = {
      id: `${selectedType.prefix}-${counter}`,
      clientName: client?.name ?? "Unknown",
      amount: Number(amount),
      status: "draft",
      dueDate,
      issuedDate: new Date().toISOString().slice(0, 10),
      items: 0,
      type: docType,
    };
    onCreated?.(newDoc);
    onOpenChange(false);
    // Reset
    setClientId("");
    setAmount("");
    setDueDate("");
    setDescription("");
    setErrors({});
    setDocType(defaultType ?? "invoice");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("rounded-lg p-1.5", selectedType.color)}>
              {selectedType.icon}
            </div>
            Create New {selectedType.label}
          </DialogTitle>
          <DialogDescription>
            Select a document type and fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Document Type Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Document Type
            </Label>
            <DocumentTypeSelector selected={docType} onChange={setDocType} />

            {/* Type description pill */}
            <AnimatePresence mode="wait">
              <motion.div
                key={docType}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
                  selectedType.badgeColor,
                )}
              >
                <IconSparkles className="h-3.5 w-3.5 shrink-0" />
                <span>{selectedType.description}</span>
                <span className="ml-auto font-mono font-semibold opacity-60">
                  {selectedType.prefix}-XXXX
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-xs font-medium text-neutral-400">
              Details
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Client */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="client">
                Client <span className="text-red-500">*</span>
              </Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger
                  className={cn("h-9", errors.client && "border-red-400")}
                >
                  <SelectValue placeholder="Select a client…" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600">
                          {c.name.charAt(0)}
                        </div>
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.client && (
                <p className="text-xs text-red-500">{errors.client}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrors((p) => {
                      const n = { ...p };
                      delete n.amount;
                      return n;
                    });
                  }}
                  className={cn("pl-7 h-9", errors.amount && "border-red-400")}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.dueDate;
                    return n;
                  });
                }}
                className={cn("h-9", errors.dueDate && "border-red-400")}
              />
              {errors.dueDate && (
                <p className="text-xs text-red-500">{errors.dueDate}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={`Describe what this ${selectedType.label.toLowerCase()} is for…`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t border-neutral-200 dark:border-neutral-700 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9"
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} className="h-9 min-w-36 gap-1.5">
            <div className={cn("rounded p-0.5", "bg-white/20")}>
              {selectedType.icon}
            </div>
            Create {selectedType.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// NEW DOCUMENT BUTTON — dropdown with type options
// ─────────────────────────────────────────────────────────────

function NewDocumentButton({
  onClick,
}: {
  onClick: (type?: DocumentType) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  const handleOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center">
        <Button
          size="sm"
          className="gap-1.5 text-sm shadow-sm rounded-r-none border-r border-white/20"
          onClick={() => {
            onClick();
            setDropdownOpen(false);
          }}
        >
          <IconPlus className="h-3.5 w-3.5" /> New Document
        </Button>
        <Button
          size="sm"
          className="shadow-sm rounded-l-none px-2 h-9"
          onClick={() => {
            setDropdownOpen((o) => {
              if (!o) document.addEventListener("mousedown", handleOutside);
              else document.removeEventListener("mousedown", handleOutside);
              return !o;
            });
          }}
        >
          <IconChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              dropdownOpen && "rotate-180",
            )}
          />
        </Button>
      </div>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Choose document type
              </p>
            </div>
            {DOCUMENT_TYPES.map((dt) => (
              <button
                key={dt.key}
                type="button"
                onClick={() => {
                  onClick(dt.key);
                  setDropdownOpen(false);
                  document.removeEventListener("mousedown", handleOutside);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <div className={cn("rounded-lg p-1.5 shrink-0", dt.color)}>
                  {dt.icon}
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm leading-tight">
                    {dt.label}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-tight mt-0.5">
                    {dt.prefix}-XXXX
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    label: status,
    color: "bg-neutral-100 text-neutral-600",
    dot: "bg-neutral-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        cfg.color,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// SCHEMA BUILDER DIALOG
// ─────────────────────────────────────────────────────────────

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long Text" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File Upload" },
];

function SchemaBuilderDialog({
  schema,
  onSave,
}: {
  schema: CustomFieldDef[];
  onSave: (s: CustomFieldDef[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CustomFieldDef[]>(schema);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const editing = draft.find((f) => f.id === editingId) ?? null;

  const addField = () => {
    const f: CustomFieldDef = {
      id: uid(),
      label: "",
      type: "text",
      required: false,
    };
    setDraft((d) => [...d, f]);
    setEditingId(f.id);
  };
  const updateField = (id: string, patch: Partial<CustomFieldDef>) =>
    setDraft((d) => d.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeField = (id: string) => {
    setDraft((d) => d.filter((f) => f.id !== id));
    if (editingId === id) setEditingId(null);
  };
  const addOption = () => {
    if (!editing || !newOptionLabel.trim()) return;
    const opt: DropdownOption = {
      label: newOptionLabel.trim(),
      value: newOptionLabel.trim().toLowerCase().replace(/\s+/g, "_"),
    };
    updateField(editing.id, { options: [...(editing.options ?? []), opt] });
    setNewOptionLabel("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <IconSettings className="h-3.5 w-3.5" /> Manage Fields
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-[80vh] max-h-175 flex-col sm:max-w-195">
        <DialogHeader>
          <DialogTitle>Client Field Schema</DialogTitle>
          <DialogDescription>
            Define what information you collect for every client.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          <div className="flex w-52 shrink-0 flex-col gap-1 overflow-y-auto border-r border-neutral-200 pr-4 dark:border-neutral-700">
            {draft.map((f) => (
              <button
                key={f.id}
                onClick={() => setEditingId(f.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  editingId === f.id
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                )}
              >
                <IconGripVertical className="h-3 w-3 shrink-0 opacity-40" />
                <span className="flex-1 truncate font-medium">
                  {f.label || (
                    <span className="italic opacity-50">Untitled</span>
                  )}
                </span>
                {f.required && <span className="text-xs text-red-400">*</span>}
              </button>
            ))}
            <button
              onClick={addField}
              className="mt-1 flex items-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:border-neutral-400 dark:border-neutral-600"
            >
              <IconPlus className="h-3 w-3" /> Add field
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {editing ? (
              <div className="space-y-4 pr-1">
                <div className="space-y-1.5">
                  <Label>Label *</Label>
                  <Input
                    value={editing.label}
                    onChange={(e) =>
                      updateField(editing.id, { label: e.target.value })
                    }
                    placeholder="Field label"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Field Type</Label>
                  <Select
                    value={editing.type}
                    onValueChange={(v) =>
                      updateField(editing.id, {
                        type: v as FieldType,
                        options: undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {["text", "number", "email", "phone", "textarea"].includes(
                  editing.type,
                ) && (
                  <div className="space-y-1.5">
                    <Label>Placeholder</Label>
                    <Input
                      value={editing.placeholder ?? ""}
                      onChange={(e) =>
                        updateField(editing.id, { placeholder: e.target.value })
                      }
                      placeholder="Hint text…"
                    />
                  </div>
                )}
                {editing.type === "dropdown" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newOptionLabel}
                        onChange={(e) => setNewOptionLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addOption()}
                        placeholder="Add option…"
                      />
                      <Button size="sm" variant="outline" onClick={addOption}>
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {(editing.options ?? []).map((opt, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-1.5 text-sm dark:bg-neutral-800"
                        >
                          <span>{opt.label}</span>
                          <button
                            onClick={() =>
                              updateField(editing.id, {
                                options: editing.options?.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                            className="text-neutral-400 hover:text-red-500"
                          >
                            <IconX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {editing.type === "file" && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Accepted types</Label>
                      <Input
                        value={editing.accept ?? ""}
                        onChange={(e) =>
                          updateField(editing.id, { accept: e.target.value })
                        }
                        placeholder=".pdf,.jpg,.docx"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="multiple"
                        checked={!!editing.multiple}
                        onCheckedChange={(v) =>
                          updateField(editing.id, { multiple: !!v })
                        }
                      />
                      <Label
                        htmlFor="multiple"
                        className="cursor-pointer font-normal"
                      >
                        Allow multiple files
                      </Label>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="required"
                    checked={editing.required}
                    onCheckedChange={(v) =>
                      updateField(editing.id, { required: !!v })
                    }
                  />
                  <Label
                    htmlFor="required"
                    className="cursor-pointer font-normal"
                  >
                    Required field
                  </Label>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeField(editing.id)}
                >
                  <IconTrash className="mr-1 h-3 w-3" /> Remove field
                </Button>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                Select a field to edit, or add a new one.
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              setOpen(false);
            }}
          >
            Save Schema
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// CLIENT FORM
// ─────────────────────────────────────────────────────────────

function ClientForm({
  schema,
  initial,
  onSave,
  onCancel,
}: {
  schema: CustomFieldDef[];
  initial?: Client;
  onSave: (c: Client) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [fields, setFields] = useState<
    Record<string, string | boolean | string[]>
  >(initial?.customFields ?? {});
  const [attachments, setAttachments] = useState<AttachedFile[]>(
    initial?.attachments ?? [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const setField = (id: string, val: string | boolean) => {
    setFields((p) => ({ ...p, [id]: val }));
    setErrors((p) => {
      const e = { ...p };
      delete e[id];
      return e;
    });
  };

  const handleFiles = async (def: CustomFieldDef, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newFiles: AttachedFile[] = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: uid(),
        name: file.name,
        size: file.size,
        mimeType: file.type,
        dataUrl: await readFileAsDataUrl(file),
        uploadedAt: new Date().toISOString(),
      })),
    );
    setAttachments((p) => (def.multiple ? [...p, ...newFiles] : newFiles));
    setUploading(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs._name = "Name is required";
    if (!email.trim()) errs._email = "Email is required";
    schema.forEach((def) => {
      if (def.required && def.type !== "file" && def.type !== "checkbox") {
        const v = fields[def.id];
        if (!v || (typeof v === "string" && !v.trim()))
          errs[def.id] = `${def.label} is required`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? uid(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      customFields: fields,
      attachments,
      createdAt: initial?.createdAt ?? new Date().toISOString().slice(0, 10),
    });
  };

  const regularFields = schema.filter((f) => f.type !== "file");
  const fileFields = schema.filter((f) => f.type === "file");

  return (
    <div className="space-y-5 py-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => {
                const e = { ...p };
                delete e._name;
                return e;
              });
            }}
            placeholder="Acme Corporation"
            className={errors._name ? "border-red-400" : ""}
          />
          {errors._name && (
            <p className="text-xs text-red-500">{errors._name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => {
                const e = { ...p };
                delete e._email;
                return e;
              });
            }}
            placeholder="contact@company.com"
            className={errors._email ? "border-red-400" : ""}
          />
          {errors._email && (
            <p className="text-xs text-red-500">{errors._email}</p>
          )}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 234 567 890"
          />
        </div>
      </div>

      {regularFields.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          <span className="text-xs font-medium text-neutral-400">
            Additional Details
          </span>
          <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {regularFields.map((def) => {
          const val = fields[def.id];
          const err = errors[def.id];
          if (def.type === "checkbox")
            return (
              <div
                key={def.id}
                className="flex items-center gap-2 sm:col-span-2"
              >
                <Checkbox
                  id={def.id}
                  checked={!!val}
                  onCheckedChange={(v) => setField(def.id, !!v)}
                />
                <Label htmlFor={def.id} className="cursor-pointer font-normal">
                  {def.label}
                </Label>
              </div>
            );
          if (def.type === "textarea")
            return (
              <div key={def.id} className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={def.id}>
                  {def.label}
                  {def.required && <span className="ml-1 text-red-500">*</span>}
                </Label>
                <Textarea
                  id={def.id}
                  value={(val as string) ?? ""}
                  onChange={(e) => setField(def.id, e.target.value)}
                  placeholder={def.placeholder}
                  className={err ? "border-red-400" : ""}
                  rows={3}
                />
                {err && <p className="text-xs text-red-500">{err}</p>}
              </div>
            );
          if (def.type === "dropdown")
            return (
              <div key={def.id} className="space-y-1.5">
                <Label>
                  {def.label}
                  {def.required && <span className="ml-1 text-red-500">*</span>}
                </Label>
                <Select
                  value={(val as string) ?? ""}
                  onValueChange={(v) => setField(def.id, v)}
                >
                  <SelectTrigger className={err ? "border-red-400" : ""}>
                    <SelectValue placeholder={`Select ${def.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {def.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {err && <p className="text-xs text-red-500">{err}</p>}
              </div>
            );
          return (
            <div key={def.id} className="space-y-1.5">
              <Label htmlFor={def.id}>
                {def.label}
                {def.required && <span className="ml-1 text-red-500">*</span>}
              </Label>
              <Input
                id={def.id}
                type={def.type === "phone" ? "tel" : def.type}
                value={(val as string) ?? ""}
                onChange={(e) => setField(def.id, e.target.value)}
                placeholder={def.placeholder}
                className={err ? "border-red-400" : ""}
              />
              {err && <p className="text-xs text-red-500">{err}</p>}
            </div>
          );
        })}
      </div>

      {fileFields.map((def) => (
        <div key={def.id} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-xs font-medium text-neutral-400">
              <IconPaperclip className="mr-1 inline-block h-3 w-3" />
              {def.label}
            </span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <button
            type="button"
            onClick={() => fileInputRefs.current[def.id]?.click()}
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition-colors hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <IconPaperclip className="h-6 w-6 text-neutral-400" />
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Click to upload {def.multiple ? "files" : "a file"}
              </p>
              {def.accept && (
                <p className="mt-0.5 text-xs text-neutral-400">{def.accept}</p>
              )}
            </div>
            <input
              ref={(el) => {
                fileInputRefs.current[def.id] = el;
              }}
              type="file"
              className="hidden"
              accept={def.accept}
              multiple={def.multiple}
              onChange={(e) => handleFiles(def, e.target.files)}
            />
          </button>
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  {fileIcon(att.mimeType)}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{att.name}</p>
                    <p className="text-xs text-neutral-400">
                      {formatBytes(att.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((p) => p.filter((a) => a.id !== att.id))
                    }
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={uploading}>
          {uploading ? "Uploading…" : initial ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CLIENT CARD
// ─────────────────────────────────────────────────────────────

function ClientCard({
  client,
  schema,
  onEdit,
  onDelete,
}: {
  client: Client;
  schema: CustomFieldDef[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const filledFields = schema.filter(
    (def) =>
      def.type !== "file" &&
      client.customFields[def.id] !== undefined &&
      client.customFields[def.id] !== "" &&
      client.customFields[def.id] !== false,
  );

  const displayLabel = (
    def: CustomFieldDef,
    val: string | boolean | string[],
  ) => {
    if (def.type === "checkbox") return val ? "Yes" : "No";
    if (def.type === "dropdown") {
      const opt = def.options?.find((o) => o.value === val);
      return opt?.label ?? (val as string);
    }
    return val as string;
  };

  const isActive = client.customFields.active;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Card className="border-neutral-200 dark:border-neutral-700 overflow-hidden group">
        <div
          className={cn(
            "h-0.5 w-full",
            isActive
              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
              : "bg-neutral-200 dark:bg-neutral-700",
          )}
        />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "rounded-lg p-2 text-sm font-bold flex items-center justify-center h-9 w-9",
                  isActive
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
                )}
              >
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 leading-tight">
                  {client.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {client.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 transition-colors"
              >
                <IconEdit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
              >
                <IconTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {client.phone && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {client.phone}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-emerald-500" : "bg-neutral-400",
                )}
              />
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {filledFields.slice(0, 2).map((def) => {
            const val = client.customFields[def.id];
            if (!val) return null;
            return (
              <div key={def.id} className="mt-2 flex items-center gap-1.5">
                <span className="text-xs text-neutral-400">{def.label}:</span>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {displayLabel(def, val)}
                </span>
              </div>
            );
          })}

          {(filledFields.length > 2 || client.attachments.length > 0) && (
            <button
              onClick={() => setExpanded((p) => !p)}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-neutral-100 dark:border-neutral-800 py-1.5 text-xs text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              {expanded
                ? "Show less"
                : `+${filledFields.length - 2 + client.attachments.length} more`}
              <IconChevronRight
                className={cn(
                  "h-3 w-3 transition-transform",
                  expanded && "rotate-90",
                )}
              />
            </button>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 dark:border-neutral-700">
                  {filledFields.slice(2).map((def) => {
                    const val = client.customFields[def.id];
                    if (!val) return null;
                    return (
                      <div key={def.id} className="flex gap-2">
                        <span className="min-w-24 text-xs text-neutral-400">
                          {def.label}
                        </span>
                        <span className="flex-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 break-all">
                          {displayLabel(def, val)}
                        </span>
                      </div>
                    );
                  })}
                  {client.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-neutral-400">
                        <IconPaperclip className="mr-1 inline-block h-3 w-3" />
                        {client.attachments.length} attachment
                        {client.attachments.length !== 1 ? "s" : ""}
                      </p>
                      {client.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.dataUrl}
                          download={att.name}
                          className="flex items-center gap-2 rounded-md border border-neutral-200 px-2 py-1.5 text-xs hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        >
                          {fileIcon(att.mimeType)}
                          <span className="flex-1 truncate font-medium text-neutral-700 dark:text-neutral-300">
                            {att.name}
                          </span>
                          <span className="text-neutral-400">
                            {formatBytes(att.size)}
                          </span>
                          <IconDownload className="h-3 w-3 text-neutral-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700 overflow-hidden group hover:shadow-sm transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100 tabular-nums">
                {value}
              </p>
              {trend && (
                <div className="mt-1.5 flex items-center gap-1">
                  <IconTrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {trend}
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "rounded-xl p-2.5 transition-transform group-hover:scale-110",
                color,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN BILLING PAGE
// ─────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "clients">(
    "invoices",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultType, setCreateDefaultType] = useState<
    DocumentType | undefined
  >();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [clientSchema, setClientSchema] =
    useState<CustomFieldDef[]>(DEFAULT_FIELD_SCHEMA);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(
    undefined,
  );
  const [clientSearch, setClientSearch] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);
  const pendingAmount = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.amount, 0);
  const overdueAmount = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);

  const saveClient = (client: Client) => {
    setClients((prev) =>
      prev.find((c) => c.id === client.id)
        ? prev.map((c) => (c.id === client.id ? client : c))
        : [...prev, client],
    );
    setIsClientFormOpen(false);
    setEditingClient(undefined);
  };

  const filteredClients = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.email.toLowerCase().includes(clientSearch.toLowerCase()),
      ),
    [clients, clientSearch],
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((inv) => {
        const matchSearch =
          inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
          statusFilter === "all" || inv.status === statusFilter;
        const matchType = typeFilter === "all" || inv.type === typeFilter;
        return matchSearch && matchStatus && matchType;
      }),
    [invoices, searchTerm, statusFilter, typeFilter],
  );

  const openCreate = (type?: DocumentType) => {
    setCreateDefaultType(type);
    setIsCreateOpen(true);
  };

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Number",
        cell: (info) => {
          const dt = getDocType(info.row.original.type);
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-200">
                {info.getValue() as string}
              </span>
              {info.row.original.type && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    dt.badgeColor,
                  )}
                >
                  {dt.icon}
                  {dt.label}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "clientName",
        header: "Client",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
              {(info.getValue() as string).charAt(0)}
            </div>
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {info.getValue() as string}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => (
          <span className="font-semibold text-neutral-800 dark:text-neutral-100 tabular-nums">
            ${(info.getValue() as number).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          const isOverdue =
            date < new Date() && info.row.original.status === "pending";
          return (
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm",
                isOverdue
                  ? "text-red-600"
                  : "text-neutral-600 dark:text-neutral-400",
              )}
            >
              <IconCalendar className="h-3.5 w-3.5" />
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right text-xs">Actions</div>,
        cell: () => (
          <div className="flex justify-end gap-1">
            {[
              { icon: IconEye, label: "View" },
              { icon: IconDownload, label: "Download" },
              { icon: IconSend, label: "Send" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                title={label}
                className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 transition-colors"
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              title="Delete"
              className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredInvoices,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-7 md:px-8">
          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-7 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="rounded-lg bg-blue-500/10 p-1.5">
                  <IconReceipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  Billing
                </h1>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 ml-9">
                Manage invoices, clients and payments
              </p>
            </div>
            <NewDocumentButton onClick={openCreate} />
          </motion.div>

          {/* ── Stats Row ── */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Revenue Collected"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={IconCurrencyDollar}
              trend="+12% this month"
              color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              delay={0}
            />
            <StatCard
              label="Pending"
              value={`$${pendingAmount.toLocaleString()}`}
              icon={IconClock}
              color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
              delay={0.06}
            />
            <StatCard
              label="Overdue"
              value={`$${overdueAmount.toLocaleString()}`}
              icon={IconAlertTriangle}
              color="bg-red-500/10 text-red-600 dark:text-red-400"
              delay={0.12}
            />
            <StatCard
              label="Active Clients"
              value={clients.filter((c) => c.customFields.active).length}
              icon={IconBuildingStore}
              color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
              delay={0.18}
            />
          </div>

          {/* ── Tab Bar ── */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-5 bg-white dark:bg-neutral-900 rounded-t-xl overflow-hidden">
            {(["invoices", "clients"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                    isActive
                      ? "border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100"
                      : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
                  )}
                >
                  {tab === "invoices" ? (
                    <IconFileInvoice className="h-3.5 w-3.5" />
                  ) : (
                    <IconUsers className="h-3.5 w-3.5" />
                  )}
                  {tab === "invoices" ? "Invoices" : "Clients"}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      isActive
                        ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400",
                    )}
                  >
                    {tab === "invoices" ? invoices.length : clients.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── INVOICES TAB ── */}
          <AnimatePresence mode="wait">
            {activeTab === "invoices" && (
              <motion.div
                key="invoices"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="border-neutral-200 dark:border-neutral-700 rounded-tl-none shadow-sm">
                  <CardHeader className="pb-0 pt-4 px-5">
                    <div className="flex flex-col gap-3">
                      {/* Row 1: Search + Create */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                          <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                          <Input
                            placeholder="Search by client or document ID…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-8 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                          />
                        </div>
                        <Button
                          size="sm"
                          className="gap-1.5 text-xs h-8 shrink-0"
                          onClick={() => openCreate()}
                        >
                          <IconPlus className="h-3.5 w-3.5" /> Create Document
                        </Button>
                      </div>

                      {/* Row 2: Status + Type filters */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {/* Status filter */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mr-0.5">
                            Status
                          </span>
                          {["all", "paid", "pending", "overdue", "draft"].map(
                            (s) => {
                              const isActive = statusFilter === s;
                              const cfg =
                                STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
                              return (
                                <button
                                  key={s}
                                  onClick={() => setStatusFilter(s)}
                                  className={cn(
                                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all border select-none",
                                    isActive && s !== "all"
                                      ? cn(
                                          cfg?.color ??
                                            "bg-neutral-100 text-neutral-700",
                                          "border-transparent shadow-sm",
                                        )
                                      : isActive && s === "all"
                                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent"
                                        : "border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 bg-transparent",
                                  )}
                                >
                                  {s === "all" ? "All" : s}
                                </button>
                              );
                            },
                          )}
                        </div>

                        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />

                        {/* Document type filter */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mr-0.5">
                            Type
                          </span>
                          <button
                            onClick={() => setTypeFilter("all")}
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all border select-none",
                              typeFilter === "all"
                                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent"
                                : "border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 bg-transparent",
                            )}
                          >
                            All
                          </button>
                          {DOCUMENT_TYPES.map((dt) => {
                            const isActive = typeFilter === dt.key;
                            return (
                              <button
                                key={dt.key}
                                onClick={() => setTypeFilter(dt.key)}
                                className={cn(
                                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize transition-all border select-none",
                                  isActive
                                    ? cn(
                                        dt.badgeColor,
                                        "border-transparent shadow-sm",
                                      )
                                    : "border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 bg-transparent",
                                )}
                              >
                                {dt.icon}
                                {dt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pt-3 pb-5">
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60">
                              {table.getHeaderGroups().map((hg) =>
                                hg.headers.map((header) => (
                                  <th
                                    key={header.id}
                                    className="px-4 py-2.5 text-left"
                                  >
                                    {header.isPlaceholder ? null : (
                                      <div
                                        onClick={header.column.getToggleSortingHandler()}
                                        className={cn(
                                          "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400",
                                          header.column.getCanSort() &&
                                            "cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200 select-none",
                                        )}
                                      >
                                        {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext(),
                                        )}
                                        {{
                                          asc: (
                                            <IconArrowUp className="h-3 w-3" />
                                          ),
                                          desc: (
                                            <IconArrowDown className="h-3 w-3" />
                                          ),
                                        }[
                                          header.column.getIsSorted() as string
                                        ] ?? null}
                                      </div>
                                    )}
                                  </th>
                                )),
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                            {table.getRowModel().rows.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={columns.length}
                                  className="py-12 text-center"
                                >
                                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                                    <IconFileInvoice className="h-8 w-8 opacity-30" />
                                    <p className="text-sm font-medium">
                                      No documents found
                                    </p>
                                    <p className="text-xs">
                                      Try adjusting your filters
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              table.getRowModel().rows.map((row, idx) => (
                                <motion.tr
                                  key={row.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: idx * 0.04 }}
                                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3">
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                      )}
                                    </td>
                                  ))}
                                </motion.tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/40">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {filteredInvoices.length === 0
                            ? "0 documents"
                            : `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length} documents`}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                          >
                            <IconChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <span className="px-2 text-xs text-neutral-600 dark:text-neutral-400">
                            {table.getState().pagination.pageIndex + 1} /{" "}
                            {table.getPageCount()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                          >
                            <IconChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ── CLIENTS TAB ── */}
            {activeTab === "clients" && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                <Card className="border-neutral-200 dark:border-neutral-700 shadow-sm">
                  <CardHeader className="pb-0 pt-4 px-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <IconSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                        <Input
                          placeholder="Search clients…"
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          className="pl-9 h-8 text-sm bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <SchemaBuilderDialog
                          schema={clientSchema}
                          onSave={setClientSchema}
                        />
                        <Dialog
                          open={isClientFormOpen}
                          onOpenChange={(o) => {
                            setIsClientFormOpen(o);
                            if (!o) setEditingClient(undefined);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-1.5 text-xs h-8">
                              <IconPlus className="h-3.5 w-3.5" /> Add Client
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
                            <DialogHeader>
                              <DialogTitle>
                                {editingClient
                                  ? "Edit Client"
                                  : "Add New Client"}
                              </DialogTitle>
                              <DialogDescription>
                                {editingClient
                                  ? "Update this client's details."
                                  : "Fill in the details below."}
                              </DialogDescription>
                            </DialogHeader>
                            <ClientForm
                              schema={clientSchema}
                              initial={editingClient}
                              onSave={saveClient}
                              onCancel={() => {
                                setIsClientFormOpen(false);
                                setEditingClient(undefined);
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pt-4 pb-5">
                    {filteredClients.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                        <div className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-4 mb-4">
                          <IconUsers className="h-8 w-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">No clients found</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Add your first client to get started
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredClients.map((client, idx) => (
                          <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <ClientCard
                              client={client}
                              schema={clientSchema}
                              onEdit={() => {
                                setEditingClient(client);
                                setIsClientFormOpen(true);
                              }}
                              onDelete={() =>
                                setClients((prev) =>
                                  prev.filter((c) => c.id !== client.id),
                                )
                              }
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Create Document Dialog ── */}
      <CreateDocumentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        clients={clients}
        defaultType={createDefaultType}
        onCreated={(doc) => setInvoices((prev) => [doc, ...prev])}
      />
    </div>
  );
}
