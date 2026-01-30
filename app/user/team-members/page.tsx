"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
import axios from "axios";
import { authClient } from "@/lib/auth-client";
import DetailBox from "@/components/DetailBox";
import BusinessProfileForm from "@/components/businessProfile";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

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

type BusinessProfileValues = z.infer<typeof formSchema>;

// Type for the API response
interface ApiOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logo: string;
  team_size: string | number;
  business_phone: string;
  business_email: string;
  business_type: string;
  business_address: string;
  business_website: string;
  gst: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  metadata: any;
}

const transformApiDataToFormValues = (
  apiData: ApiOrganizationResponse,
): BusinessProfileValues => {
  return {
    name: apiData.name,
    team_size:
      typeof apiData.team_size === "string"
        ? parseInt(apiData.team_size, 10)
        : apiData.team_size,
    business_address: apiData.business_address,
    business_type: apiData.business_type,
    business_email: apiData.business_email,
    business_website: apiData.business_website || "",
    business_phone: apiData.business_phone,
    gst: apiData.gst || "",
    logo: apiData.logo,
    businessLogo: undefined,
  };
};

const getBusinessDetails = (data: BusinessProfileValues) => [
  {
    id: "address",
    icon: MapPin,
    label: "Business Address",
    value: data.business_address,
  },
  {
    id: "email",
    icon: Mail,
    label: "Owner Email",
    value: data.business_email,
  },
  {
    id: "phone",
    icon: Phone,
    label: "Contact Number",
    value: data.business_phone,
  },
  {
    id: "website",
    icon: Globe,
    label: "Website",
    value: data.business_website || "Not provided",
    isLink: !!data.business_website,
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
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrgData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/auth/organization/list", {
        withCredentials: true,
      });

      if (response.data && response.data.length > 0) {
        const fullOrgResponse = await axios.post(
          "/api/getFullOrg",
          {
            id: response.data[0]?.id,
          },
          {
            withCredentials: true,
          },
        );

        console.log("Full Organization Response:", fullOrgResponse.data);

        // Transform the API response to match form structure
        const transformedData = transformApiDataToFormValues(
          fullOrgResponse.data,
        );
        setSavedData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const form = useForm<BusinessProfileValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessLogo: undefined,
      name: "",
      team_size: 1,
      business_address: "",
      business_type: "",
      business_email: "",
      business_website: "",
      business_phone: "",
      gst: "",
      logo: "",
    },
  });

  const businessDetails = useMemo(
    () => (savedData ? getBusinessDetails(savedData) : []),
    [savedData],
  );

  const onSubmit = async (values: BusinessProfileValues) => {
    setIsUploading(true);
    try {
      let uploadedLogo = savedData?.logo || null;

      if (values.businessLogo?.length) {
        const file = values.businessLogo[0];

        const presignResData = await axios.post("/api/s3/presignedURL", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        const presignResOBJ = presignResData.data;

        if (!presignResOBJ || !presignResOBJ.uploadUrl) {
          throw new Error("Failed to get upload URL from server");
        }

        try {
          await axios.put(presignResOBJ.uploadUrl, file, {
            headers: {
              "Content-Type": file.type,
            },
          });
        } catch (s3Error) {
          console.error("S3 upload error:", s3Error);
          throw new Error("Failed to upload file to S3. Please try again.");
        }
        uploadedLogo = `https://${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${presignResOBJ.newFileName}`;
      }

      const formData = {
        ...values,
        slug: values.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        logo: uploadedLogo,
      };

      console.log("📥 Submitting Form Data:", formData);

      if (!savedData) {
        // Create new organization
        const { data, error } = await authClient.organization.create({
          name: values.name,
          slug: formData.slug,
          logo: uploadedLogo || undefined,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (!data) {
          throw new Error("Organization creation failed");
        }

        console.log("✅ Auth Client Organization Created:", data);

        const response = await axios.post("/api/createOrg", {
          ...data,
          business_website: values.business_website,
          business_type: values.business_type,
          business_address: values.business_address,
          business_phone: values.business_phone,
          business_email: values.business_email,
          team_size: values.team_size,
          gst: values.gst,
        });

        if (response.data.error) {
          throw new Error(`ERROR FROM API: ${response.data.error}`);
        }
        const transformedData = transformApiDataToFormValues(response.data);
        setSavedData(transformedData);
        await fetchOrgData();
        setIsDialogOpen(false);
      } else {
        // Update existing organization
        const response = await axios.put("/api/updateOrg", {
          business_website: values.business_website,
          business_type: values.business_type,
          business_address: values.business_address,
          business_phone: values.business_phone,
          business_email: values.business_email,
          team_size: values.team_size,
          gst: values.gst,
          name: values.name,
          logo: uploadedLogo,
        });

        if (response.data.error) {
          throw new Error(`ERROR FROM API: ${response.data.error}`);
        }

        const transformedData = transformApiDataToFormValues(response.data);
        setSavedData(transformedData);
        await fetchOrgData();
        setIsDialogOpen(false);
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = () => {
    if (savedData) {
      form.reset(savedData);
    }
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      form.clearErrors();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Page Header */}
        <header className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Organization
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage your business profile and team members
          </p>
        </header>

        {/* Empty State */}
        {!savedData ? (
          <EmptyState onCreateClick={() => setIsDialogOpen(true)} />
        ) : (
          <>
            {/* Business Profile Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Business Profile
                </h2>
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  size="sm"
                  className="gap-2 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </Button>
              </div>
              <ProfileCard
                savedData={savedData}
                logoPreview={savedData?.logo || null}
                businessDetails={businessDetails}
              />
            </section>

            {/* Team Members Section - Placeholder */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    Team Members
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage your organization members and their roles
                  </p>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Add Member
                </Button>
              </div>

              {/* This is where you'll add your member list component */}
              <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full">
                      <Users className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        No team members yet
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Add your first team member to get started
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>

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
            isPending={isUploading}
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
    <section className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50">
      <div className="bg-zinc-100 dark:bg-zinc-800 p-5 rounded-full mb-5">
        <Building2 className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        No Business Profile Found
      </h2>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-center max-w-md">
        Create your business profile to start managing your organization and
        team members
      </p>
      <Button onClick={onCreateClick} size="lg" className="gap-2">
        <Plus className="w-4 h-4" /> Create Business Profile
      </Button>
    </section>
  );
}

interface ProfileCardProps {
  savedData: BusinessProfileValues;
  logoPreview: string | null | undefined;
  businessDetails: ReturnType<typeof getBusinessDetails>;
}

function ProfileCard({
  savedData,
  logoPreview,
  businessDetails,
}: ProfileCardProps) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header with Logo and Basic Info */}
      <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-linear-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-900/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-24 w-24 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 shadow-sm">
            {logoPreview ? (
              <Image
                src={logoPreview}
                width={96}
                height={96}
                alt={`${savedData.name} logo`}
                className="object-cover w-full h-full"
              />
            ) : (
              <Building2 className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              {savedData.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                <span>{savedData.business_type}</span>
              </div>
              <span
                className="text-zinc-300 dark:text-zinc-700"
                aria-hidden="true"
              >
                •
              </span>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>
                  {savedData.team_size} Employee
                  {savedData.team_size !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Business Details Grid */}
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessDetails.map((detail) => (
            <DetailBox key={detail.id} {...detail} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
