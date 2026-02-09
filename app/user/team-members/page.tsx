"use client";

import { useState, useMemo, useEffect, useLayoutEffect } from "react";
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
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";
import axios from "axios";

import { authClient } from "@/lib/auth-client";
import DetailBox from "@/components/DetailBox";
import BusinessProfileForm from "@/components/businessProfile";
import { formSchema } from "@/schema/form.Schema";
import { transformApiDataToFormValues } from "@/lib/utils";
import InviteForm from "@/components/InviteForm";
import { fetchOrgData, fetchMembersData } from "@/lib/utils";

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  flexRender,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
  SortingState,
} from "@tanstack/react-table";

import type { ColumnDef } from "@tanstack/react-table";

// Define your member type
interface Member {
  name: string;
  email: string;
  role: string;
  status: string;
  users: {
    image: string;
    name: string;
    email: string;
    phone: string;
    dob: string;
    doj: string;
    emailVerified: boolean;
  };
}

// Then define columns with proper typing
const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.users.image ? (
          <Image
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
            src={row.original.users.image}
            width={40}
            height={40}
            alt="user Images"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
            {row.original.users.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <span>{row.original.users.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-zinc-600 dark:text-zinc-300">
        {row.original.users.email}
      </span>
    ),
  },
  {
    accessorKey: "emailVerified",
    header: "Email Verified",
    cell: ({ row }) => (
      <span className="text-zinc-600 dark:text-zinc-300">
        {String(row.original.users.emailVerified).toUpperCase()}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">
        {row.original.role.toUpperCase()}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">
        {row.original.users.phone || "Not Available"}
      </span>
    ),
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">
        {row.original.users.dob || "Not Available"}
      </span>
    ),
  },
  {
    accessorKey: "doj",
    header: "Date of Joining",
    cell: ({ row }) => (
      <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs">
        {row.original.users.doj || "Not Available"}
      </span>
    ),
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

type BusinessProfileValues = z.infer<typeof formSchema>;

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

export default function TeamMemberPage() {
  //

  const [isLoading, setIsLoading] = useState(true);

  const [membersData, setMembersData] = useState<any[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedData, setSavedData] = useState<BusinessProfileValues | null>(
    null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  useLayoutEffect(() => {
    const loadData = async () => {
      try {
        const orgData = await fetchOrgData();
        console.log("Fetched Org Data:", orgData);
        if (orgData && orgData.id) {
          setSavedData(orgData);
          const membersData = await fetchMembersData(orgData.id);
          // console.log("Fetched Members Data:", membersData);
          if (membersData) {
            setMembersData(membersData.data);
            console.log("Members Data Set:", membersData.data);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
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

  // handle form submission
  const onSubmitBusiness = async (values: BusinessProfileValues) => {
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

      // console.log("📥 Submitting Form Data:", formData);

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

        // console.log("✅ Auth Client Organization Created:", data);

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

  // handle edit button click

  const handleEdit = () => {
    if (savedData) {
      form.reset(savedData);
    }
    setIsDialogOpen(true);
  };

  // handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      form.clearErrors();
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
      setIsDialogOpen(false);

      return response.data;
    } catch (error) {
      console.error("Error sending invite:", error);
      throw error;
    }
  };

  const [sorting, setSorting] = useState<SortingState>([]); // can set initial sorting state here

  const table = useReactTable({
    columns,
    data: membersData,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

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
                        console.log("Invite Form Data:", data);
                        if (savedData.id) {
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
              {/* This is where you'll add your member list component */}
              {membersData.length === 0 ? (
                <BlankMember />
              ) : (
                // <MembersList members={membersData} />
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider"
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                        {table.getRowModel().rows.map((row) => (
                          <>
                            <tr
                              key={row.id}
                              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td
                                  key={cell.id}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100"
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </td>
                              ))}
                            </tr>
                            {row.getIsExpanded() && (
                              <tr>
                                <td
                                  colSpan={row.getVisibleCells().length}
                                  className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/30"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                                        Phone
                                      </p>
                                      <p className="text-zinc-900 dark:text-zinc-100">
                                        {row.original.users.phone ||
                                          "Not Available"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                                        Date of Birth
                                      </p>
                                      <p className="text-zinc-900 dark:text-zinc-100">
                                        {row.original.users.dob ||
                                          "Not Available"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">
                                        Date of Joining
                                      </p>
                                      <p className="text-zinc-900 dark:text-zinc-100">
                                        {row.original.users.doj ||
                                          "Not Available"}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="text-sm text-zinc-500">
                      Showing {table.getRowModel().rows.length} of{" "}
                      {membersData.length} members
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </Card>
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
            businessForm={form}
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
