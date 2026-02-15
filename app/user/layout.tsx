"use client";

import React, { useState } from "react";

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarProvider,
} from "@/components/ui/sidebar";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconChecklist,
  IconGridDots,
  IconLink,
  IconSettings,
  IconUserBolt,
  IconUsersGroup,
} from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";

interface SessionType {
  session?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null | undefined | undefined;
    userAgent?: string | null | undefined | undefined;
    activeOrganizationId?: string | null | undefined;
    impersonatedBy?: string | null | undefined;
  };
  user?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined | undefined;
    role?: string | null | undefined;
    isActive?: boolean | null | undefined;
    organizationId?: string | null | undefined;
    phone?: string | null | undefined;
    dob?: string | null | undefined;
    doj?: string | null | undefined;
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "My Applications",
      href: "/user/applications",
      icon: (
        <IconGridDots className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Dashboard",
      href: "/user/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },

    {
      label: "Links",
      href: "/user/links",
      icon: (
        <IconLink className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Team Members",
      href: "/user/team-members",
      icon: (
        <IconUsersGroup className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/user/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "/user/settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  const {
    data: session, // Renamed from userSession for clarity
    isPending,
    error,
  } = authClient.useSession();

  if (isPending) {
    return <div>Loading session...</div>;
  }

  return (
    <>
      <SidebarProvider>
        <div
          className={cn(
            "mx-auto flex w-full  flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
            "min-h-screen",
          )}
        >
          <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                {open ? <Logo /> : <LogoIcon />}
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) =>
                    link.label !== "Logout" ? (
                      <SidebarLink key={idx} link={link} />
                    ) : (
                      ""
                      // <SidebarLink key={idx} link={link} />
                    ),
                  )}
                </div>
              </div>
              <div className="flex flex-col  ">
                {/* You can add footer content here if needed */}

                <SidebarLink
                  link={{
                    label: session?.user?.name || "User",
                    href: "#",
                    icon: (
                      <Image
                        src={session?.user?.image || "/Logo.png"}
                        className="h-7 w-7 shrink-0 rounded-full border border-white object-cover "
                        width={50}
                        height={50}
                        alt="Avatar"
                      />
                    ),
                  }}
                />
              </div>
            </SidebarBody>
          </Sidebar>
          {children}
        </div>
      </SidebarProvider>
    </>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image src="/logo.png" alt="Logo" width={32} height={32} />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Automate Ideas
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image src="/logo.png" alt="Logo" width={32} height={32} />
    </Link>
  );
};
