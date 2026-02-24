"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useForm, UseFormReturn } from "react-hook-form";
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
  DialogTrigger,
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
import { toast } from "sonner";
import axios from "axios";
import { authClient } from "@/lib/auth-client";
import DetailBox from "@/components/DetailBox";
import BusinessProfileForm from "@/components/BusinessProfileForm";
import { formSchema } from "@/schema/form.Schema";
import { transformApiDataToFormValues } from "@/lib/utils";
import InviteForm from "@/components/InviteForm";
import { fetchOrgData, fetchMembersData } from "@/lib/utils";

import MembersTable, { Member } from "@/components/MemberTable";

type BusinessProfileValues = z.infer<typeof formSchema>;

const getKeyFromUrl = (url: string) => {
  const { pathname } = new URL(url);
  return pathname.replace(/^\/+/, "");
};

export default function TeamMemberPage() {
  //
  //
  //
  //
  const [isLoading, setIsLoading] = useState(true);
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedData, setSavedData] = useState<BusinessProfileValues | null>(
    null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const orgData = await fetchOrgData();
        if (orgData && orgData.id) {
          setSavedData(orgData);
          const membersResponse = await fetchMembersData(orgData.id);
          if (membersResponse) {
            // console.log("Fetched members data:", membersResponse.data);
            setMembersData(membersResponse.data);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load organization data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const businessForm = useForm({
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
      logo: undefined,
    },
  }) as UseFormReturn<BusinessProfileValues>;

  const businessDetails = useMemo(
    () => (savedData ? getBusinessDetails(savedData) : []),
    [savedData],
  );

  // handle form submission
  const onSubmitBusiness = async (values: BusinessProfileValues) => {
    setIsUploading(true);
    try {
      // -----------------------------
      // STEP 1: Handle Logo Upload
      // -----------------------------
      let oldLogoKey: string | null = null;

      let uploadedLogo = savedData?.logo || undefined;

      if (values.businessLogo && values.businessLogo[0]) {
        const file = values.businessLogo[0];
        const presignRes = await axios.post("/api/s3/presignResOBJ", {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });

        const { uploadUrl, newFileName } = presignRes.data;

        if (!uploadUrl) {
          throw new Error("Failed to get upload URL");
        }

        await axios.put(uploadUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
        });

        uploadedLogo = `https://${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}/${newFileName}`;
      }

      // -----------------------------
      // STEP 2: Generate Slug
      // -----------------------------
      const slug = values.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // -----------------------------
      // STEP 3: CREATE FLOW
      // -----------------------------
      if (!savedData) {
        const { data, error } = await authClient.organization.create({
          name: values.name,
          slug,
          logo: uploadedLogo,
        });

        if (error) throw new Error(error.message);
        if (!data) throw new Error("Organization creation failed");

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
          await authClient.organization.delete({ organizationId: data.id });
          throw new Error(response.data.error);
        }

        const transformedData = transformApiDataToFormValues(response.data);
        setSavedData(transformedData);

        businessForm.reset({
          ...transformedData,
          businessLogo: undefined,
        });

        toast.success("Business profile created successfully!");
        setIsDialogOpen(false);
        return;
      }

      if (savedData?.logo) {
        oldLogoKey = getKeyFromUrl(savedData.logo);
      }

      // -----------------------------
      // STEP 4: UPDATE FLOW
      // -----------------------------

      const response = await axios.put("/api/updateOrg", {
        name: values.name,
        logo: uploadedLogo, // keeps old if not changed
        business_website: values.business_website,
        business_type: values.business_type,
        business_address: values.business_address,
        business_phone: values.business_phone,
        business_email: values.business_email,
        team_size: values.team_size,
        gst: values.gst,
      });

      if (oldLogoKey) {
        try {
          await axios.post("/api/s3/deleteObject", {
            key: oldLogoKey,
          });
        } catch (err) {
          console.error("Old logo cleanup failed:", err);
          // Don't throw — update already succeeded
        }
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const transformedData = transformApiDataToFormValues(response.data);
      setSavedData(transformedData);

      businessForm.reset({
        ...transformedData,
        businessLogo: undefined,
      });

      toast.success("Business profile updated successfully!");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // handle edit button click
  const handleEdit = () => {
    if (savedData) {
      businessForm.reset(savedData);
    }
    setIsDialogOpen(true);
  };

  // handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      businessForm.clearErrors();
    }
  };

  // this will help to send invites
  const sendInvites = async (email: string, role: string, orgID: string) => {
    if (!email || !role || !orgID) {
      throw new Error("Email, role, and orgID are required");
    }
    try {
      const response = await axios.post("/api/sendInvites", {
        email,
        role,
        organizationId: orgID,
      });

      toast.success("Invite sent successfully!");
      setMemberDialogOpen(false);

      // Refresh members data
      if (savedData?.id) {
        const membersResponse = await fetchMembersData(savedData.id);
        if (membersResponse) {
          setMembersData(membersResponse.data);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Failed to send invite");
      throw error;
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
              <BusinessProfileCard
                savedData={savedData}
                logoPreview={savedData?.logo || null}
                businessDetails={businessDetails}
              />
            </section>

            {/* Team Members Section */}
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
                <Dialog
                  open={memberDialogOpen}
                  onOpenChange={setMemberDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" /> Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Invite Member</DialogTitle>
                      <DialogDescription>
                        Invite a new member to your organization.
                      </DialogDescription>
                    </DialogHeader>
                    <InviteForm
                      onSubmit={async (data) => {
                        if (savedData?.id) {
                          await sendInvites(
                            data.email,
                            data.role,
                            savedData.id,
                          );
                        }
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Members Table or Empty State */}
              {membersData.length === 0 ? (
                <BlankMember />
              ) : (
                <MembersTable data={membersData} />
              )}
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
            businessForm={businessForm}
            onSubmit={onSubmitBusiness}
            isPending={isUploading}
            isEditing={!!savedData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extracted Components for better organization

// The EmptyState component is responsible for displaying a user-friendly message and call-to-action when there is no business profile found. It encourages users to create a new business profile by clicking the provided button, which triggers the onCreateClick function passed as a prop.
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

// This component is responsible for displaying the business profile information in a card format. It shows the business logo, name, type, team size, and other details in a visually appealing layout. The details are displayed using the DetailBox component, which takes care of rendering each piece of information with its corresponding icon and label.

function BusinessProfileCard({
  savedData,
  logoPreview,
  businessDetails,
}: ProfileCardProps) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
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

const getBusinessDetails = (data: BusinessProfileValues) => [
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
    id: "address",
    icon: MapPin,
    label: "Business Address",
    value: data.business_address,
  },
  {
    id: "gst",
    icon: FileText,
    label: "GSTIN",
    value: data.gst || "Not provided",
  },
];

function BlankMember() {
  return (
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
  );
}
