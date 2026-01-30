import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

type BusinessProfileValues = z.infer<typeof formSchema>;

const formSchema = z.object({
  businessLogo: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0]?.size <= MAX_FILE_SIZE,
      { message: "Logo must be less than 10M" },
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      { message: "Only .jpg, .jpeg, .png and .webp formats are supported" },
    ),
  name: z
    .string()
    .min(2, { message: "Business name must be at least 2 characters" })
    .max(100, { message: "Business name must be less than 100 characters" })
    .trim(),
  team_size: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseInt(val, 10) : val))
    .pipe(
      z
        .number({ message: "Team size must be a whole number" })
        .int()
        .min(1, { message: "Team size must be at least 1" })
        .max(100000, { message: "Team size seems unrealistic" }),
    ),
  business_address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be less than 200 characters" })
    .trim(),
  business_type: z
    .string()
    .min(2, { message: "Industry is required" })
    .max(50, { message: "Industry must be less than 50 characters" })
    .trim(),
  business_email: z
    .string()
    .email({ message: "Invalid email address" })
    .toLowerCase()
    .trim(),
  business_website: z
    .string()
    .trim()
    .optional()
    .transform((val) => val || ""),
  business_phone: z
    .string()
    .regex(/^[0-9\s+()-]+$/, { message: "Invalid phone number format" })
    .min(10, { message: "Phone number must be at least 10 digits" })
    .trim(),
  gst: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || (val.length === 15 && /^[0-9A-Z]+$/.test(val)),
      { message: "GST must be exactly 15 alphanumeric characters" },
    )
    .optional()
    .transform((val) => val || ""),
  logo: z.string().optional(),
});

interface BusinessProfileFormProps {
  form: UseFormReturn<BusinessProfileValues>;
  onSubmit: (values: BusinessProfileValues) => void;
  isPending: boolean;
  isEditing: boolean;
}

export default function BusinessProfileForm({
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
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <FormLabel className="dark:text-zinc-300">
                  Business Logo
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={(e) => field.onChange(e.target.files)}
                    className="dark:bg-zinc-950 dark:border-zinc-800"
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
            name="name"
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
            name="team_size"
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
                    step="1"
                    {...field}
                    value={field.value || ""}
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
            name="business_type"
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
            name="business_email"
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
            name="business_phone"
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
            name="business_address"
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
            name="business_website"
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
