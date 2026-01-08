import { getServerSession } from "@/lib/getServerSession";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { User } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession();

  return (
    <div className="flex flex-1 ">
      <div className="flex h-full w-full flex-1 flex-col gap-8 rounded-2xl border  p-8 md:p-12">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                className="h-full w-full object-cover transition-transform hover:scale-110"
                height={96}
                width={96}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center ">
                <User className="" height={40} width={40} />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {session?.user?.name}
            </h1>
            <p className="text-lg">{session?.user?.email}</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="group rounded-xl border border-neutral-200/50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-800/50">
            <h2 className="mb-5 text-xl font-semibold">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Name
                </label>
                <p className="mt-1 text-lg font-medium">
                  {session?.user?.name}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Email
                </label>
                <p className="mt-1 text-lg font-medium">
                  {session?.user?.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Phone Number
                </label>
                <p className="mt-1 text-lg font-medium">
                  {session?.user?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Role
                </label>
                <p className="mt-1 text-lg font-medium">
                  {/* {session?.user?.phone || "Not provided"} */}
                  Do it Later
                  {/* For this Do it Later */}
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-neutral-200/50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-800/50">
            <h2 className="mb-5 text-xl font-semibold">Account Settings</h2>
            <div className="space-y-3">
              <Button className="w-full rounded-lg">Change Password</Button>
              <Button className="w-full rounded-lg ">
                Notification Settings
              </Button>
              <Button className="w-full rounded-lg ">Privacy Settings</Button>
            </div>
          </div>

          <div className="group rounded-xl border border-neutral-200/50 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-800/50">
            <h2 className="mb-5 text-xl font-semibold">Activity</h2>
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
          </div>

          <div className="group rounded-xl border border-neutral-200/50 p-6 shadow-sm transition-all hover:shadow-md">
            <h2 className="mb-5 text-xl font-semibold">Connected Accounts</h2>
            <div className="space-y-3">
              <Button className="flex w-full items-center gap-3 rounded-lg  px-6 py-4 text-left transition-all">
                <div className="flex h-8 w-8 items-center justify-center rounded-full ">
                  <Image
                    src={"/google.svg"}
                    alt="Google Logo"
                    height={50}
                    width={50}
                  />
                </div>
                <span className="font-medium">Google</span>
                <span className="ml-auto rounded-full  px-3 py-1 text-sm font-medium ">
                  Connect
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
