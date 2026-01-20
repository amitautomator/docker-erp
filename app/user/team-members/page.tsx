"use client";

import React, { useState, useTransition, useMemo, useCallback } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  Users,
  MapPin,
  Briefcase,
  Mail,
  Globe,
  Phone,
  FileText,
  Plus,
  Pencil,
  Loader2,
} from "lucide-react";

// import { toast } from "sonner"; // Optional: if you want toast notifications

// Constants

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Zod Schema with enhanced validation
const formSchema = z.object({
  businessLogo: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      { message: "Logo must be less than 5MB" },
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      { message: "Only .jpg, .jpeg, .png and .webp formats are supported" },
    ),
  businessName: z
    .string()
    .min(2, { message: "Business name must be at least 2 characters" })
    .max(100, { message: "Business name must be less than 100 characters" })
    .trim(),
  teamSize: z
    .int({ message: "Team size must be a whole number" })
    .min(1, { message: "Team size must be at least 1" })
    .max(100000, { message: "Team size seems unrealistic" }),
  businessAddress: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be less than 200 characters" })
    .trim(),
  businessIndustry: z
    .string()
    .min(2, { message: "Industry is required" })
    .max(50, { message: "Industry must be less than 50 characters" })
    .trim(),
  ownerEmail: z
    .string()
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .trim(),
  businessWebsite: z
    .string()
    .trim()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid URL format" },
    )
    .optional()
    .or(z.literal("")),
  ownerPhone: z
    .string()
    .regex(/^[0-9\s+()-]+$/, { message: "Invalid phone number format" })
    .min(10, { message: "Phone number must be at least 10 digits" })
    .trim(),
  gst: z
    .string()
    .regex(/^[0-9A-Z]*$/, {
      message: "GST should contain only uppercase letters and numbers",
    })
    .length(15, { message: "GST number must be exactly 15 characters" })
    .optional()
    .or(z.literal("")),
});

type BusinessProfileValues = z.infer<typeof formSchema>;

// Helper function to get business details
const getBusinessDetails = (data: BusinessProfileValues) => [
  {
    id: "address",
    icon: MapPin,
    label: "Business Address",
    value: data.businessAddress,
  },
  {
    id: "email",
    icon: Mail,
    label: "Owner Email",
    value: data.ownerEmail,
  },
  {
    id: "phone",
    icon: Phone,
    label: "Contact Number",
    value: data.ownerPhone,
  },
  {
    id: "website",
    icon: Globe,
    label: "Website",
    value: data.businessWebsite || "Not provided",
    isLink: !!data.businessWebsite,
  },
  {
    id: "gst",
    icon: FileText,
    label: "GSTIN",
    value: data.gst || "Not provided",
  },
];

export default function BusinessPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedData, setSavedData] = useState<BusinessProfileValues | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<BusinessProfileValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessLogo: undefined,
      businessName: "",
      teamSize: 1,
      businessAddress: "",
      businessIndustry: "",
      ownerEmail: "",
      businessWebsite: "",
      ownerPhone: "",
      gst: "",
    },
  });

  // Memoize business details to avoid recalculation
  const businessDetails = useMemo(
    () => (savedData ? getBusinessDetails(savedData) : []),
    [savedData],
  );

  // Handle logo preview
  const handleLogoPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.onerror = () => {
      console.error("Failed to read file");
      // Optional: toast.error("Failed to read logo file");
    };
    reader.readAsDataURL(file);
  }, []);

  const onSubmit = useCallback(
    (values: BusinessProfileValues) => {
      startTransition(() => {
        // Simulate async operation (replace with actual API call)
        setTimeout(() => {
          console.log("Form Submitted:", values);
          setSavedData(values);
          setIsDialogOpen(false);

          if (values.businessLogo && values.businessLogo.length > 0) {
            handleLogoPreview(values.businessLogo[0]);
          }

          // Optional: toast.success("Business profile saved successfully!");
        }, 500);
      });
    },
    [handleLogoPreview],
  );

  const handleEdit = useCallback(() => {
    if (savedData) {
      form.reset(savedData);
    }
    setIsDialogOpen(true);
  }, [savedData, form]);

  const handleDialogClose = useCallback(
    (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
        form.clearErrors();
      }
    },
    [form],
  );

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 flex flex-col items-center transition-colors duration-300">
      {/* Page Header */}
      <header className="mb-10 text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Our Business
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your organization profile and settings.
        </p>
      </header>

      {/* Empty State */}
      {!savedData ? (
        <EmptyState onCreateClick={() => setIsDialogOpen(true)} />
      ) : (
        <ProfileCard
          savedData={savedData}
          logoPreview={logoPreview}
          businessDetails={businessDetails}
          onEdit={handleEdit}
        />
      )}

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl dark:text-zinc-100">
              {savedData ? "Edit Business Profile" : "Create Business Profile"}
            </DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              {savedData
                ? "Update your organization details below."
                : "Fill in the details to register your organization."}
            </DialogDescription>
          </DialogHeader>

          <BusinessProfileForm
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            isEditing={!!savedData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extracted Components for better organization

interface EmptyStateProps {
  onCreateClick: () => void;
}

function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl w-full max-w-3xl bg-white dark:bg-zinc-900/50">
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
        <Building2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        No Business Profile Found
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center max-w-sm">
        Create your business identity to access all features.
      </p>
      <Button onClick={onCreateClick} size="lg" className="gap-2">
        <Plus className="w-4 h-4" /> Create Profile
      </Button>
    </section>
  );
}

interface ProfileCardProps {
  savedData: BusinessProfileValues;
  logoPreview: string | null;
  businessDetails: ReturnType<typeof getBusinessDetails>;
  onEdit: () => void;
}

function ProfileCard({
  savedData,
  logoPreview,
  businessDetails,
  onEdit,
}: ProfileCardProps) {
  return (
    <Card className="w-full max-w-5xl shadow-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border dark:border-zinc-700">
            {logoPreview ? (
              <Image
                src={logoPreview}
                width={60}
                height={60}
                alt={`${savedData.businessName} logo`}
                className="object-contain"
              />
            ) : (
              <Building2 className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {savedData.businessName}
            </CardTitle>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
              <Briefcase className="w-3 h-3" aria-hidden="true" />{" "}
              {savedData.businessIndustry}
              <span
                className="text-zinc-300 dark:text-zinc-700"
                aria-hidden="true"
              >
                |
              </span>
              <Users className="w-3 h-3" aria-hidden="true" />{" "}
              {savedData.teamSize.toLocaleString()} Employee
              {savedData.teamSize !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onEdit}
          className="gap-2 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Pencil className="w-4 h-4" /> Edit Details
        </Button>
      </CardHeader>

      <CardContent className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessDetails.map((detail) => (
            <DetailBox key={detail.id} {...detail} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface BusinessProfileFormProps {
  form: ReturnType<typeof useForm<BusinessProfileValues>>;
  onSubmit: (values: BusinessProfileValues) => void;
  isPending: boolean;
  isEditing: boolean;
}

function BusinessProfileForm({
  form,
  onSubmit,
  isPending,
  isEditing,
}: BusinessProfileFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 py-4"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Logo */}
          <FormField
            control={form.control}
            name="businessLogo"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  Business Logo
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={(e) => onChange(e.target.files)}
                    {...fieldProps}
                    className="dark:bg-zinc-950 dark:border-zinc-800 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business Name */}
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  Business Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Your Business Name"
                    {...field}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
                    disabled={isPending}
                    autoComplete="organization"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Team Size */}
          <FormField
            control={form.control}
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  Team Size <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 10"
                    min="1"
                    {...field}
                    value={field.value?.toString() || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Industry */}
          <FormField
            control={form.control}
            name="businessIndustry"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  Industry <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Fintech, Manufacturing"
                    {...field}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GST */}
          <FormField
            control={form.control}
            name="gst"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  GST (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="15-digit GST Number"
                    maxLength={15}
                    {...field}
                    className="dark:bg-zinc-950 dark:border-zinc-800 uppercase"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="ownerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  Business Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="owner@company.com"
                    {...field}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
                    disabled={isPending}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="ownerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  Business Phone <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+91 9876543210"
                    {...field}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
                    disabled={isPending}
                    autoComplete="tel"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="businessAddress"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="dark:text-zinc-300">
                  Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Main St, City, State, ZIP"
                    {...field}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
                    disabled={isPending}
                    autoComplete="street-address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name="businessWebsite"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="dark:text-zinc-300">
                  Website (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.example.com"
                    {...field}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
                    disabled={isPending}
                    autoComplete="url"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            className="w-full sm:w-auto gap-2"
            disabled={isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending
              ? "Saving..."
              : isEditing
                ? "Save Changes"
                : "Create Profile"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Helper Component - React 19 compatible
interface DetailBoxProps {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  isLink?: boolean;
}

function DetailBox({
  icon: Icon,
  label,
  value,
  isLink = false,
}: DetailBoxProps) {
  return (
    <div className="flex flex-col p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        {label}
      </div>
      {isLink && value !== "Not provided" ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
        >
          {value}
        </a>
      ) : (
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {value}
        </p>
      )}
    </div>
  );
}
