import { z } from "zod";
import { id } from "zod/v4/locales";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const formSchema = z.object({
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
  id: z.string().optional(),
});
