"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import {
  User,
  ShieldCheck,
  Activity,
  LogOut,
  Mail,
  Phone,
  Briefcase,
  Loader2,
  Edit2,
  Save,
  X,
  Camera,
  MapPin,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useGoogleSignIn } from "@/lib/google-auth";
import { useState, useRef } from "react";

// --- Schemas ---

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
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
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

// --- Sub-Components ---

const ProfileAvatar = ({
  session,
  onImageUpload,
  isUploading,
}: {
  session: any;
  onImageUpload: (file: File) => void;
  isUploading: boolean;
}) => {
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

        {/* Upload Overlay */}
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

const DetailItem = ({ label, value, icon: Icon }: any) => (
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

export default function ProfilePage() {
  const router = useRouter();

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const { handleGoogleSignIn, isLoading: isGoogleLoading } = useGoogleSignIn();

  const { data: session, isPending } = authClient.useSession();

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: session?.user?.phone || "",
      bio: session?.user?.bio || "",
      location: session?.user?.location || "",
      website: session?.user?.website || "",
    },
  });

  // Update form when session loads
  useState(() => {
    if (session?.user) {
      profileForm.reset({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        bio: session.user.bio || "",
        location: session.user.location || "",
        website: session.user.website || "",
      });
    }
  });

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
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

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    setIsSavingProfile(true);
    try {
      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profile updated successfully");
      setIsEditMode(false);

      // TODO: Refresh session data
      // await authClient.refetchSession();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleImageUpload(file: File) {
    setIsImageUploading(true);
    try {
      // TODO: Replace with your actual image upload logic
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/user/avatar', {
      //   method: 'POST',
      //   body: formData,
      // });

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Profile picture updated successfully");

      // TODO: Refresh session
      // await authClient.refetchSession();
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsImageUploading(false);
    }
  }

  const logOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error("Error signing out");
    }
  };

  const handleCancelEdit = () => {
    profileForm.reset({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: session?.user?.phone || "",
      bio: session?.user?.bio || "",
      location: session?.user?.location || "",
      website: session?.user?.website || "",
    });
    setIsEditMode(false);
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
              session={session}
              onImageUpload={handleImageUpload}
              isUploading={isImageUploading}
            />
            <div className="space-y-2 text-center md:pb-2 md:text-left">
              <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {session.user.name}
                </h1>
                <Badge variant="secondary" className="w-fit">
                  {session.user.role || "Member"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {session.user.email}
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

        <Tabs defaultValue="general" className="mt-8">
          {/* Responsive Tabs List */}
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="flex h-11 w-full justify-start rounded-none border-b bg-transparent p-0 md:justify-center">
              <TabsTrigger
                value="general"
                className="flex-1 border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:flex-none"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex-1 border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:flex-none"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex-1 border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:flex-none"
              >
                Activity
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="mt-6 space-y-6">
            {/* Edit Profile Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                <div>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and bio
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
                  <Form {...profileForm}>
                    <form className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="dark:border dark:border-neutral-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  className="dark:border dark:border-neutral-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="+1 (555) 000-0000"
                                  className="dark:border dark:border-neutral-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="City, Country"
                                  className="dark:border dark:border-neutral-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="url"
                                placeholder="https://example.com"
                                className="dark:border dark:border-neutral-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell us about yourself..."
                                className="min-h-[100px] dark:border dark:border-neutral-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
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
                        label="Location"
                        value={session.user.location || "Not set"}
                        icon={MapPin}
                      />
                    </div>

                    {session.user.website && (
                      <DetailItem
                        label="Website"
                        value={session.user.website}
                        icon={Globe}
                      />
                    )}

                    {session.user.bio && (
                      <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Bio
                        </p>
                        <p className="text-sm text-foreground">
                          {session.user.bio}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg">Social Connections</CardTitle>
                <CardDescription>
                  Link your third-party accounts.
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
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-semibold">Update Password</p>
                    <p className="text-xs text-muted-foreground">
                      Last changed 3 months ago
                    </p>
                  </div>
                  <Dialog
                    open={isPasswordDialogOpen}
                    onOpenChange={setIsPasswordDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="dark:hover:bg-white">
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Password must be at least 8 characters and include
                          uppercase, lowercase, numbers, and symbols.
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...passwordForm}>
                        <form
                          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="dark:border dark:border-neutral-400"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    className="dark:border dark:border-neutral-400"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="dark:border dark:border-neutral-400"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full">
                              Update Password
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Separator />
                <div className="flex flex-col justify-between gap-4 opacity-50 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-semibold">Two-Factor Auth</p>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
