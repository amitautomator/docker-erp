"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconChecklist,
  IconCreditCard,
  IconUsers,
  IconChartBar,
  IconCalendar,
  IconFileText,
  IconSettings,
  IconMessage,
  IconArrowUpRight,
  IconCheck,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import Link from "next/link";

const modules = [
  {
    id: 2,
    name: "Billing",
    description: "Manage invoices, payments and subscriptions",
    icon: IconCreditCard,
    status: "active",
    href: "/user/billing",
    color:
      "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
  },
  {
    id: 7,
    name: "Settings",
    description: "Configure your workspace preferences",
    icon: IconSettings,
    status: "active",
    href: "/user/settings",
    color:
      "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
  },
  {
    id: 1,
    name: "Task Delegation",
    description: "Assign and track tasks across your team",
    icon: IconChecklist,
    status: "applied",
    href: "/user/task-delegation",
    color:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  },
  {
    id: 3,
    name: "HRMS",
    description: "Human resource management system",
    icon: IconUsers,
    status: "coming soon",
    href: "/user/hrms",
    color:
      "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  },
  {
    id: 4,
    name: "Analytics",
    description: "Track metrics and generate insights",
    icon: IconChartBar,
    status: "coming soon",
    href: "/user/analytics",
    color:
      "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
  },
  {
    id: 5,
    name: "Calendar",
    description: "Schedule meetings and manage events",
    icon: IconCalendar,
    status: "applied",
    href: "/user/calendar",
    color:
      "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
  },
  {
    id: 6,
    name: "Documents",
    description: "Store and share files securely",
    icon: IconFileText,
    status: "coming soon",
    href: "/user/documents",
    color:
      "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  },
  {
    id: 8,
    name: "Communication",
    description: "Team chat and collaboration tools",
    icon: IconMessage,
    status: "coming soon",
    href: "/user/communication",
    color:
      "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
  },
];

export default function ApplicationManagerPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-white dark:bg-neutral-900">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-neutral-800 dark:text-neutral-100">
              My Applications
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Manage your SaaS modules and integrations
            </p>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((module, idx) => {
              const Icon = module.icon;
              const isActive = module.status === "active";
              const isApplied = module.status === "applied";

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="group relative overflow-hidden border border-neutral-200 bg-white transition-all hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800 h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`rounded-lg p-2.5 ${module.color}`}>
                          <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                      </div>
                      <CardTitle className="mt-4 text-base font-semibold text-neutral-800 dark:text-neutral-100">
                        {module.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-neutral-600 dark:text-neutral-400">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 mt-auto">
                      {isActive ? (
                        <Link href={module.href} className="block">
                          <Button
                            variant="outline"
                            className="w-full group/btn hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            size="sm"
                          >
                            <span className="text-neutral-700 dark:text-neutral-200">
                              Open app
                            </span>
                            <IconArrowUpRight className="ml-2 h-4 w-4 text-neutral-700 dark:text-neutral-200 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                          </Button>
                        </Link>
                      ) : isApplied ? (
                        <Button
                          variant="secondary"
                          className="w-full cursor-default"
                          size="sm"
                          disabled
                        >
                          <IconCheck className="mr-2 h-4 w-4" />
                          Applied
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          className="w-full cursor-not-allowed opacity-50"
                          size="sm"
                          disabled
                        >
                          Coming soon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
