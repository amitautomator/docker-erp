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
import { useState } from "react";

// --- Sub-Components ---

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

const ProfileAvatar = ({ session }: { session: any }) => (
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
    </div>
  </div>
);

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

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { handleGoogleSignIn, isLoading: isGoogleLoading } = useGoogleSignIn();
  const { data: session, isPending } = authClient.useSession();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    console.log("Form Submitted:", values);

    const { data, error } = await authClient.changePassword({
      newPassword: values.newPassword, // required
      currentPassword: values.currentPassword, // required
      revokeOtherSessions: true,
    });
    if (error) {
      toast.error("Error changing password", error);
    } else if (data) {
      toast.success("Password changed successfully");
      setIsDialogOpen(false);
      form.reset();
    }
  }

  const logOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error: any) {
      toast.error("Error signing out", error);
    }
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
            <ProfileAvatar session={session} />
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
            className=" w-full md:w-auto dark:hover:bg-white "
          >
            <LogOut size={16} className="mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="general" className="mt-8">
          {/* Responsive Tabs List - Scrolls horizontally on small screens */}
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
                label="User Role"
                value={session.user.role || "Standard"}
                icon={Briefcase}
              />
            </div>

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
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className=" dark:hover:bg-white"
                      >
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

                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
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
                            control={form.control}
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
                            control={form.control}
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
