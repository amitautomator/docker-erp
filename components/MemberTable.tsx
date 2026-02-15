"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

import {
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Filter,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Mail,
  Phone as PhoneIcon,
  Calendar,
  UserCircle,
} from "lucide-react";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  SortingState,
  ColumnFiltersState,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string; // or Date if you're parsing it
  user?: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    banned: boolean;
    banReason: string | null;
    banExpires: string | null;
    phone: string | null;
    dob: string | null;
    doj: string | null;
    isActive: boolean;
    status: string | null;
    transferDate: string | null;
    transferReason: string | null;
    subscriptionType: string | null;
    subscriptionStartedAt: string | null;
    subscriptionExpiresAt: string | null;
    subscriptionStatus: string | null;
    lastLoginMethod: string | null;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    team_size: number | null;
    business_phone: string | null;
    business_email: string | null;
    business_type: string | null;
    business_address: string | null;
    business_website: string | null;
    gst: string | null;
    isActive: boolean;
    updatedAt: string;
    createdAt: string;
    metadata: any | null;
  };
}

interface Props {
  data: Member[];
}

export default function MembersTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isMobileView, setIsMobileView] = useState(false);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(data.map((member) => member.role));
    return Array.from(roles);
  }, [data]);

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "user.name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.user?.image ? (
            <Image
              src={row.original.user.image}
              width={40}
              height={40}
              alt="avatar"
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {row.original.user?.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {row.original.user?.name}
            </span>
            {row.original.user?.emailVerified && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      ),
      enableSorting: true,
      enableHiding: false, // Always show name
    },
    {
      accessorKey: "user.email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-zinc-400" />
          <span className="text-sm">{row.original.user?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ getValue }) => {
        const role = getValue() as string;
        const roleColors: Record<string, string> = {
          Admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          Manager:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          Member:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          User: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[role] || roleColors.User}`}
          >
            {role}
          </span>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "user.phone",
      header: "Phone",
      cell: ({ getValue }) => {
        const phone = getValue() as string | undefined;
        return phone ? (
          <div className="flex items-center gap-2">
            <PhoneIcon className="h-4 w-4 text-zinc-400" />
            <span className="text-sm">{phone}</span>
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        );
      },
    },
    {
      accessorKey: "user.dob",
      header: "Date of Birth",
      cell: ({ getValue }) => {
        const dob = getValue() as string | undefined;
        return dob ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span className="text-sm">{dob}</span>
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        );
      },
    },
    {
      accessorKey: "user.doj",
      header: "Date of Joining",
      cell: ({ getValue }) => {
        const doj = getValue() as string | undefined;
        return doj ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span className="text-sm">{doj}</span>
          </div>
        ) : (
          <span className="text-zinc-400">—</span>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      globalFilter,
      columnVisibility,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Export to CSV

  // Mobile Card View
  const MobileCard = ({ member }: { member: Member }) => (
    <Card className="p-4 mb-3">
      <div className="flex items-start gap-3 mb-3">
        {member.user?.image ? (
          <Image
            src={member.user.image}
            width={48}
            height={48}
            alt="avatar"
            className="rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
            {member.user?.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            {member.user?.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {member.user?.email}
          </p>
          {member.user?.emailVerified && (
            <span className="text-xs text-green-600 dark:text-green-400">
              ✓ Verified
            </span>
          )}
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            member.role === "Admin"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              : member.role === "Manager"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
          }`}
        >
          {member.role}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {member.user?.phone && (
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <PhoneIcon className="h-4 w-4" />
            <span>{member.user.phone}</span>
          </div>
        )}
        {member.user?.dob && (
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <Calendar className="h-4 w-4" />
            <span>DOB: {member.user.dob}</span>
          </div>
        )}
        {member.user?.doj && (
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <Calendar className="h-4 w-4" />
            <span>Joined: {member.user.doj}</span>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search members..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Role Filter */}
          <Select
            value={
              (table.getColumn("role")?.getFilterValue() as string[])?.join(
                ",",
              ) || "all"
            }
            onValueChange={(value) => {
              table
                .getColumn("role")
                ?.setFilterValue(value === "all" ? undefined : [value]);
            }}
          >
            <SelectTrigger className="w-fit">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.columnDef.header as string}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileView(!isMobileView)}
            className="sm:hidden"
          >
            {isMobileView ? <Eye /> : <UserCircle />}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span>
          {table.getFilteredRowModel().rows.length} of {data.length} members
        </span>
        {globalFilter && (
          <span className="text-blue-600 dark:text-blue-400">
            (filtered by "{globalFilter}")
          </span>
        )}
      </div>

      {/* Mobile View */}
      {isMobileView ? (
        <div className="sm:hidden">
          {table.getRowModel().rows.map((row) => (
            <MobileCard key={row.id} member={row.original} />
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-1 ${
                              header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : ""
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {header.column.getCanSort() && (
                              <div className="ml-1">
                                {{
                                  asc: (
                                    <ChevronUp className="h-4 w-4 text-blue-600" />
                                  ),
                                  desc: (
                                    <ChevronDown className="h-4 w-4 text-blue-600" />
                                  ),
                                }[header.column.getIsSorted() as string] ?? (
                                  <ChevronDown className="h-4 w-4 text-zinc-300" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-zinc-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-zinc-300" />
                        <p>No members found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-4 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Rows per page
            </span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Info */}
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
