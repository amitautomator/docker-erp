"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  LogOut,
  Mail,
  Phone,
  Loader2,
  Edit2,
  Save,
  X,
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Crown,
  Monitor,
  MapPin,
  LucideIcon,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { authClient } from "@/lib/auth-client";
import { useGoogleSignIn } from "@/lib/google-auth";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

// --- Types ---
type UserType = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  isActive: boolean;
  role: string;
  subscriptionType?: string;
  phone?: string | null;
  dob?: Date | null;
  doj?: Date | null;
  organizationId: string;
  providers?: string[];
  subscriptionStatus?: string;
  subscriptionStartedAt?: Date;
  subscriptionExpiresAt?: Date | null;
};

type SessionType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
};

type FullSessionType = {
  user: UserType;
  session: SessionType;
};

// --- Schemas ---
const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one symbol"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one symbol"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const cleaned = val.replace(/\s+/g, "");
        return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
      },
      {
        message:
          "Invalid phone number. Use format: 91 9999999999 or 9999999999",
      },
    ),
  dob: z.string().optional(),
  doj: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// --- Animation variants ---
const tabContentVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: "blur(4px)",
    transition: {
      duration: 0.18,
      ease: "easeIn" as "easeIn",
    },
  },
};

// --- Sub-Components ---

interface ProfileAvatarProps {
  session: FullSessionType;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
}

const ProfileAvatar = ({
  session,
  onImageUpload,
  isUploading,
}: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      onImageUpload(file);
    }
  };

  return (
    <div className="relative group mx-auto md:mx-0">
      <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-primary to-blue-600 opacity-20 blur" />
      <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted shadow-lg">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name}
            className="h-full w-full object-cover"
            height={128}
            width={128}
          />
        ) : (
          <User size={40} className="text-muted-foreground" />
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

const DetailItem = ({ label, value, icon: Icon }: DetailItemProps) => (
  <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge
    variant={isActive ? "default" : "destructive"}
    className="flex w-fit items-center gap-1.5"
  >
    {isActive ? (
      <>
        <CheckCircle2 className="h-3 w-3" />
        Active
      </>
    ) : (
      <>
        <XCircle className="h-3 w-3" />
        Inactive
      </>
    )}
  </Badge>
);

// Animated wrapper for tab content
const AnimatedTabContent = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={tabContentVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    {children}
  </motion.div>
);

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const lastMethod = authClient.getLastUsedLoginMethod();

  const { handleGoogleSignIn, isLoading: isGoogleLoading } = useGoogleSignIn();

  const { data: session, isPending } = authClient.useSession() as {
    data: FullSessionType | null;
    isPending: boolean;
  };

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      doj: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        dob: session.user.dob
          ? new Date(session.user.dob).toISOString().split("T")[0]
          : "",
        doj: session.user.doj
          ? new Date(session.user.doj).toISOString().split("T")[0]
          : "",
      });
    }
  }, [session, profileForm]);

  async function onPasswordSubmit(values: PasswordFormValues) {
    const { data, error } = await authClient.changePassword({
      newPassword: values.newPassword,
      currentPassword: values.currentPassword,
      revokeOtherSessions: true,
    });
    if (error) {
      toast.error("Error changing password");
    } else if (data) {
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    }
  }

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsSavingProfile(true);
    try {
      const { data } = await axios.post("/api/updateUser", values);
      toast.success("Profile updated successfully");
      setIsEditMode(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to update profile",
        );
      } else {
        toast.error("Unexpected error occurred");
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsImageUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsImageUploading(false);
    }
  };

  const logOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: unknown) {
      toast.error("Error signing out");
    }
  };

  const handleCancelEdit = () => {
    profileForm.reset({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: session?.user?.phone || "",
      dob: session?.user?.dob
        ? new Date(session.user.dob).toISOString().split("T")[0]
        : "",
      doj: session?.user?.doj
        ? new Date(session.user.doj).toISOString().split("T")[0]
        : "",
    });
    setIsEditMode(false);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-950">
      {/* Top Background Accent */}
      <div className="h-32 w-screen bg-primary/5 md:h-48" />
      <div className="mx-auto max-w-4xl px-4 pb-12">
        {/* Profile Header Card */}
        <div className="-mt-12 flex flex-col items-center gap-6 rounded-2xl border bg-card p-6 shadow-sm md:-mt-16 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end">
            <ProfileAvatar
              session={session as unknown as FullSessionType}
              onImageUpload={handleImageUpload}
              isUploading={isImageUploading}
            />
            <div className="space-y-2 text-center md:pb-2 md:text-left">
              <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {session.user.name}
                </h1>
                <div className="flex gap-2">
                  <StatusBadge isActive={session.user.isActive} />
                  {session.user.emailVerified && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(session.user.createdAt)}
              </p>
            </div>
          </div>
          <Button
            onClick={logOut}
            variant="outline"
            className="w-full md:w-auto dark:hover:bg-white"
          >
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>

        {/* 
          Key change: We manage `activeTab` ourselves so we can feed it to
          AnimatePresence as the `key`. The Tabs component stays fully
          controlled via `value` + `onValueChange`.
        */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          {/* Responsive Tabs List */}
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="flex h-11 w-full justify-start rounded-none border-b bg-transparent p-0 md:justify-center">
              {["general", "security", "activity", "subscription"].map(
                (tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="flex-1 capitalize border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:flex-none"
                  >
                    {tab}
                  </TabsTrigger>
                ),
              )}
            </TabsList>
          </div>

          {/* AnimatePresence wraps all tab panels; key change triggers exit+enter */}
          <AnimatePresence mode="wait">
            {activeTab === "general" && (
              <TabsContent
                key="general"
                value="general"
                forceMount
                className="mt-6 space-y-6"
              >
                <AnimatedTabContent>
                  {/* Edit Profile Section */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                      <div>
                        <CardTitle className="text-lg">
                          Profile Information
                        </CardTitle>
                        <CardDescription>
                          Update your personal details
                        </CardDescription>
                      </div>
                      {!isEditMode ? (
                        <Button
                          onClick={() => setIsEditMode(true)}
                          variant="outline"
                          size="sm"
                          className="dark:hover:bg-white"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            disabled={isSavingProfile}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            onClick={profileForm.handleSubmit(onProfileSubmit)}
                            size="sm"
                            disabled={isSavingProfile}
                          >
                            {isSavingProfile ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            Save
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                      {isEditMode ? (
                        <form
                          className="space-y-4"
                          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                        >
                          <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Controller
                              control={profileForm.control}
                              name="name"
                              render={({ field, fieldState: { error } }) => (
                                <div>
                                  <Input
                                    {...field}
                                    id="name"
                                    className="dark:border dark:border-neutral-400"
                                  />
                                  {error && (
                                    <p
                                      role="alert"
                                      className="text-red-500 text-sm mt-1"
                                    >
                                      {error.message}
                                    </p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Controller
                              control={profileForm.control}
                              name="phone"
                              render={({ field, fieldState: { error } }) => (
                                <div>
                                  <Input
                                    placeholder="91 9999999999"
                                    type="tel"
                                    {...field}
                                    id="phone"
                                    className="dark:border dark:border-neutral-400"
                                  />
                                  {error && (
                                    <p
                                      role="alert"
                                      className="text-red-500 text-sm mt-1"
                                    >
                                      {error.message}
                                    </p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Controller
                              control={profileForm.control}
                              name="dob"
                              render={({ field, fieldState: { error } }) => (
                                <div>
                                  <Input
                                    type="date"
                                    {...field}
                                    value={field.value || ""}
                                    id="dob"
                                    className="dark:border dark:border-neutral-400"
                                  />
                                  {error && (
                                    <p
                                      role="alert"
                                      className="text-red-500 text-sm mt-1"
                                    >
                                      {error.message}
                                    </p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                          <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
                            <Label htmlFor="doj">Date of Joining</Label>
                            <Controller
                              control={profileForm.control}
                              name="doj"
                              render={({ field, fieldState: { error } }) => (
                                <div>
                                  <Input
                                    type="date"
                                    {...field}
                                    value={field.value || ""}
                                    id="doj"
                                    className="dark:border dark:border-neutral-400"
                                  />
                                  {error && (
                                    <p
                                      role="alert"
                                      className="text-red-500 text-sm mt-1"
                                    >
                                      {error.message}
                                    </p>
                                  )}
                                </div>
                              )}
                            />
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid gap-2 sm:gap-4 sm:grid-cols-2">
                            <DetailItem
                              label="Full Name"
                              value={session.user.name}
                              icon={User}
                            />
                            <DetailItem
                              label="Email Address"
                              value={session.user.email}
                              icon={Mail}
                            />
                            <DetailItem
                              label="Phone Number"
                              value={session.user.phone || "Not set"}
                              icon={Phone}
                            />
                            <DetailItem
                              label="Date of Birth"
                              value={
                                session.user.dob
                                  ? formatDate(session.user.dob)
                                  : "Not set"
                              }
                              icon={Calendar}
                            />
                            <DetailItem
                              label="Date of Joining"
                              value={
                                session.user.doj
                                  ? formatDate(session.user.doj)
                                  : "Not set"
                              }
                              icon={Calendar}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Account Information */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg">
                        Account Information
                      </CardTitle>
                      <CardDescription>
                        Your account details and timestamps
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem
                          label="Account Status"
                          value={session.user.isActive ? "Active" : "Inactive"}
                          icon={session.user.isActive ? CheckCircle2 : XCircle}
                        />
                        <DetailItem
                          label="Email Verified"
                          value={session.user.emailVerified ? "Yes" : "No"}
                          icon={
                            session.user.emailVerified ? CheckCircle2 : XCircle
                          }
                        />
                        <DetailItem
                          label="Created At"
                          value={formatDate(session.user.createdAt)}
                          icon={Calendar}
                        />
                        <DetailItem
                          label="Last Updated"
                          value={formatDate(session.user.updatedAt)}
                          icon={Clock}
                        />
                        <DetailItem
                          label="Last Login"
                          value={lastMethod || "N/A"}
                          icon={Clock}
                        />
                        {session.user.doj && (
                          <DetailItem
                            label="Date of Joining"
                            value={formatDate(session.user.doj)}
                            icon={Calendar}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Connections */}
                  <Card>
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="text-lg">
                        Social Connections
                      </CardTitle>
                      <CardDescription>
                        Link your third-party accounts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border p-4 sm:flex-row">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full border bg-white p-2">
                            <Image
                              src="/google.svg"
                              alt="Google"
                              height={24}
                              width={24}
                            />
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-sm font-bold">Google Account</p>
                            <p className="text-xs text-muted-foreground">
                              Quick login enabled
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={
                            session.user?.providers?.includes("google")
                              ? "secondary"
                              : "default"
                          }
                          onClick={handleGoogleSignIn}
                          disabled={isGoogleLoading}
                          className="w-full sm:w-auto"
                        >
                          {session.user?.providers?.includes("google")
                            ? "Linked"
                            : "Connect"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedTabContent>
              </TabsContent>
            )}

            {activeTab === "security" && (
              <TabsContent
                key="security"
                value="security"
                forceMount
                className="mt-6 space-y-6"
              >
                <AnimatedTabContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-semibold">
                            Update Password
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Keep your account secure
                          </p>
                        </div>
                        <Dialog
                          open={isPasswordDialogOpen}
                          onOpenChange={setIsPasswordDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="dark:hover:bg-white"
                            >
                              Change Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Change Password</DialogTitle>
                              <DialogDescription>
                                Password must be at least 8 characters and
                                include uppercase, lowercase, numbers, and
                                symbols.
                              </DialogDescription>
                            </DialogHeader>
                            <form
                              onSubmit={passwordForm.handleSubmit(
                                onPasswordSubmit,
                              )}
                              className="space-y-4"
                            >
                              <div className="space-y-4">
                                <div className="gap-2 grid">
                                  <Label htmlFor="currentPassword">
                                    Current Password
                                  </Label>
                                  <Controller
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <div>
                                        <Input
                                          type="password"
                                          {...field}
                                          id="currentPassword"
                                          className="dark:border dark:border-neutral-400"
                                        />
                                        {error && (
                                          <p
                                            role="alert"
                                            className="text-red-500 text-sm mt-1"
                                          >
                                            {error.message}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  />
                                </div>
                                <div className="gap-2 grid">
                                  <Label htmlFor="newPassword">
                                    New Password
                                  </Label>
                                  <Controller
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <div>
                                        <Input
                                          type="password"
                                          {...field}
                                          id="newPassword"
                                          className="dark:border dark:border-neutral-400"
                                        />
                                        {error && (
                                          <p
                                            role="alert"
                                            className="text-red-500 text-sm mt-1"
                                          >
                                            {error.message}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  />
                                </div>
                                <div className="gap-2 grid">
                                  <Label htmlFor="confirmPassword">
                                    Confirm New Password
                                  </Label>
                                  <Controller
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <div>
                                        <Input
                                          type="password"
                                          {...field}
                                          id="confirmPassword"
                                          className="dark:border dark:border-neutral-400"
                                        />
                                        {error && (
                                          <p
                                            role="alert"
                                            className="text-red-500 text-sm mt-1"
                                          >
                                            {error.message}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  />
                                </div>
                              </div>
                              <DialogFooter className="pt-4">
                                <Button type="submit" className="w-full">
                                  Update Password
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Separator />
                      <div className="flex flex-col justify-between gap-4 opacity-50 sm:flex-row sm:items-center">
                        <div>
                          <p className="text-sm font-semibold">
                            Two-Factor Auth
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Secure your account with 2FA
                          </p>
                        </div>
                        <Badge variant="outline" className="w-fit">
                          Coming Soon
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedTabContent>
              </TabsContent>
            )}

            {activeTab === "activity" && (
              <TabsContent
                key="activity"
                value="activity"
                forceMount
                className="mt-6 space-y-6"
              >
                <AnimatedTabContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Activity</CardTitle>
                      <CardDescription>
                        Your current session details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem
                          label="IP Address"
                          value={session.session.ipAddress}
                          icon={MapPin}
                        />
                        <DetailItem
                          label="Session Created"
                          value={formatDateTime(session.session.createdAt)}
                          icon={Calendar}
                        />
                        <DetailItem
                          label="Last Activity"
                          value={formatDateTime(session.session.updatedAt)}
                          icon={Clock}
                        />
                        <DetailItem
                          label="Session Expires"
                          value={formatDateTime(session.session.expiresAt)}
                          icon={Clock}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedTabContent>
              </TabsContent>
            )}

            {activeTab === "subscription" && (
              <TabsContent
                key="subscription"
                value="subscription"
                forceMount
                className="mt-6 space-y-6"
              >
                <AnimatedTabContent>
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscription Details</CardTitle>
                      <CardDescription>
                        Manage your subscription and billing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {session.user.subscriptionType ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <DetailItem
                            label="Subscription Type"
                            value={session.user.subscriptionType}
                            icon={Crown}
                          />
                          <DetailItem
                            label="Status"
                            value={session.user.subscriptionStatus || "N/A"}
                            icon={
                              session.user.subscriptionStatus === "active"
                                ? CheckCircle2
                                : XCircle
                            }
                          />
                          {session.user.subscriptionStartedAt && (
                            <DetailItem
                              label="Started On"
                              value={formatDate(
                                session.user.subscriptionStartedAt,
                              )}
                              icon={Calendar}
                            />
                          )}
                          {session.user.subscriptionExpiresAt && (
                            <DetailItem
                              label="Expires On"
                              value={formatDate(
                                session.user.subscriptionExpiresAt,
                              )}
                              icon={Calendar}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Crown className="mb-4 h-12 w-12 text-muted-foreground" />
                          <h3 className="mb-2 text-lg font-semibold">
                            No Active Subscription
                          </h3>
                          <p className="mb-6 text-sm text-muted-foreground">
                            Upgrade to premium to unlock exclusive features
                          </p>
                          <Button>Explore Plans</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedTabContent>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
