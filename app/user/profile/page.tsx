"use client";

import { useState } from "react";
import Image from "next/image";

import { useForm, SubmitHandler } from "react-hook-form";

import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

import { useGoogleSignIn } from "@/lib/google-auth";
import { useRouter } from "next/navigation";

// Types
type PasswordFormInputs = {
  currentPassword: string;
  newPassword: string;
};

// Extracted Components

const ProfileAvatar = ({ session }: { session: any }) => (
  <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-neutral-200 dark:ring-neutral-700">
    {session?.user?.image ? (
      <Image
        src={session.user.image}
        alt={`${session.user.name}'s profile picture`}
        className="h-full w-full object-cover transition-transform hover:scale-110"
        height={96}
        width={96}
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
        <User className="text-neutral-500" height={40} width={40} />
      </div>
    )}
  </div>
);

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="group rounded-xl border border-neutral-200/50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-800/50">
    <h2 className="mb-5 text-xl font-semibold">{title}</h2>
    {children}
  </div>
);

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
      {label}
    </label>
    <p className="mt-1 text-lg font-medium">{value}</p>
  </div>
);

// Main Component
export default function ProfilePage() {
  const router = useRouter();
  const { handleGoogleSignIn, isLoading } = useGoogleSignIn();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session, isPending, error } = authClient.useSession();

  console.log("Session data:", session);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormInputs>({
    mode: "onChange",
  });

  async function logOut() {
    console.log("logOut");
    try {
      await authClient.signOut();
      router.push("/login");
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  const onSubmit: SubmitHandler<PasswordFormInputs> = async (data) => {
    try {
      console.log("Password change data:", data);

      const { data: changePassword, error } = await authClient.changePassword({
        newPassword: data.newPassword, // required
        currentPassword: data.currentPassword, // required
        revokeOtherSessions: true,
      });

      if (error) {
        throw error;
      }

      if (changePassword) {
        console.log("Password changed successfully:", changePassword);
        toast.success("Password changed successfully");
      }

      reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        (error as Error).message ||
          "Failed to change password. Please try again."
      );
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      reset();
    }
    setIsDialogOpen(open);
  };

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-lg">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">
          Error loading session
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-8 rounded-2xl border p-8 md:p-12">
        {/* Profile Header */}
        <div className="flex items-center gap-6">
          <ProfileAvatar session={session} />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {session.user.name}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {session.user.email}
            </p>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Personal Information */}
          <InfoCard title="Personal Information">
            <div className="space-y-4">
              <InfoField
                label="Name"
                value={session.user.name || "Not provided"}
              />
              <InfoField
                label="Email"
                value={session.user.email || "Not provided"}
              />
              <InfoField
                label="Phone Number"
                value={session.user.phone || "Not provided"}
              />
              <InfoField
                label="Role"
                value={session.user.role || "Not assigned"}
              />
            </div>
          </InfoCard>

          {/* Account Settings */}
          <InfoCard title="Account Settings">
            <div className="space-y-3">
              <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogTrigger asChild>
                  <Button type="button" className="w-full rounded-lg">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Password must be at least 8 characters with 1 uppercase,
                        1 lowercase, 1 number, and 1 symbol.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input
                          type="password"
                          id="current-password"
                          placeholder="Enter current password"
                          autoComplete="current-password"
                          {...register("currentPassword", {
                            required: "Current password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                          })}
                          aria-invalid={
                            errors.currentPassword ? "true" : "false"
                          }
                        />
                        {errors.currentPassword && (
                          <p
                            className="text-sm text-red-600 dark:text-red-400"
                            role="alert"
                          >
                            {errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          type="password"
                          id="new-password"
                          placeholder="Enter new password"
                          autoComplete="new-password"
                          {...register("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                            validate: {
                              hasUppercase: (value) =>
                                /[A-Z]/.test(value) ||
                                "Must contain at least 1 uppercase letter",
                              hasLowercase: (value) =>
                                /[a-z]/.test(value) ||
                                "Must contain at least 1 lowercase letter",
                              hasNumber: (value) =>
                                /\d/.test(value) ||
                                "Must contain at least 1 number",
                              hasSymbol: (value) =>
                                /[!@#$%^&*(),.?":{}|<>]/.test(value) ||
                                "Must contain at least 1 symbol (!@#$%^&* etc.)",
                            },
                          })}
                          aria-invalid={errors.newPassword ? "true" : "false"}
                        />
                        {errors.newPassword && (
                          <p
                            className="text-sm text-red-600 dark:text-red-400"
                            role="alert"
                          >
                            {errors.newPassword.message}
                          </p>
                        )}

                        {/* Password requirements hint */}
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          <p className="font-medium mb-1">Requirements:</p>
                          <ul className="space-y-0.5 list-disc list-inside">
                            <li>At least 8 characters</li>
                            <li>1 uppercase letter (A-Z)</li>
                            <li>1 lowercase letter (a-z)</li>
                            <li>1 number (0-9)</li>
                            <li>1 symbol (!@#$%^&* etc.)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button className="w-full rounded-lg" variant="outline">
                Notification Settings
              </Button>
              <Button className="w-full rounded-lg" variant="outline">
                Privacy Settings
              </Button>
            </div>
            <div className="py-3 ">
              <Button
                className="dark:bg-black dark:text-white"
                onClick={logOut}
              >
                Logout
              </Button>
            </div>
          </InfoCard>

          {/* Activity */}
          <InfoCard title="Activity">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
                <span className="font-medium">Last login</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Today, 2:30 PM
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800/50">
                <span className="font-medium">Account created</span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Jan 1, 2024
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Connected Accounts">
            <div className="space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="flex w-full items-center justify-start gap-3 rounded-lg px-6 py-6 text-left transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full">
                  <Image
                    src="/google.svg"
                    alt="Google logo"
                    height={32}
                    width={32}
                  />
                </div>
                <span className="font-medium">Google</span>
                <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {session.user?.providers?.includes("google")
                    ? "Connected"
                    : "Connect"}
                </span>
              </Button>
            </div>
          </InfoCard>
          {/* Connected Accounts */}
        </div>
      </div>
    </div>
  );
}
