"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconDownload,
  IconSend,
  IconEdit,
  IconTrash,
  IconEye,
  IconClock,
  IconCheck,
  IconX,
  IconUsers,
  IconCurrencyDollar,
  IconFileInvoice,
  IconCalendar,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { motion } from "motion/react";

// Types
type Invoice = {
  id: string;
  clientName: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  dueDate: string;
  issuedDate: string;
  items: number;
};

type Client = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

// Sample data
const invoices: Invoice[] = [
  {
    id: "INV-001",
    clientName: "Acme Corporation",
    amount: 2500.0,
    status: "paid",
    dueDate: "2026-02-10",
    issuedDate: "2026-01-15",
    items: 5,
  },
  {
    id: "INV-002",
    clientName: "Tech Solutions Inc",
    amount: 1800.0,
    status: "pending",
    dueDate: "2026-02-20",
    issuedDate: "2026-02-05",
    items: 3,
  },
  {
    id: "INV-003",
    clientName: "Global Industries",
    amount: 3200.0,
    status: "overdue",
    dueDate: "2026-01-30",
    issuedDate: "2026-01-10",
    items: 7,
  },
  {
    id: "INV-004",
    clientName: "Startup Hub",
    amount: 950.0,
    status: "draft",
    dueDate: "2026-03-01",
    issuedDate: "2026-02-14",
    items: 2,
  },
  {
    id: "INV-005",
    clientName: "Design Studio",
    amount: 1500.0,
    status: "paid",
    dueDate: "2026-02-15",
    issuedDate: "2026-01-20",
    items: 4,
  },
];

const clients: Client[] = [
  {
    id: 1,
    name: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1234567890",
  },
  {
    id: 2,
    name: "Tech Solutions Inc",
    email: "hello@techsolutions.com",
    phone: "+1234567891",
  },
  {
    id: 3,
    name: "Global Industries",
    email: "info@global.com",
    phone: "+1234567892",
  },
  {
    id: 4,
    name: "Startup Hub",
    email: "team@startuphub.com",
    phone: "+1234567893",
  },
  {
    id: 5,
    name: "Design Studio",
    email: "studio@design.com",
    phone: "+1234567894",
  },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "clients">(
    "invoices",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Calculate stats
  const totalRevenue = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        variant: "default" as const,
        className: "bg-green-500",
        icon: IconCheck,
      },
      pending: {
        variant: "secondary" as const,
        className: "bg-yellow-500",
        icon: IconClock,
      },
      overdue: {
        variant: "destructive" as const,
        className: "bg-red-500",
        icon: IconX,
      },
      draft: { variant: "outline" as const, className: "", icon: IconEdit },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // TanStack Table Columns
  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Invoice ID",
        cell: (info) => (
          <span className="font-medium text-neutral-800 dark:text-neutral-100">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "clientName",
        header: "Client",
        cell: (info) => (
          <span className="text-neutral-700 dark:text-neutral-200">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => (
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
            ${(info.getValue() as number).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => getStatusBadge(info.getValue() as string),
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: (info) => (
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
            <IconCalendar className="h-4 w-4 text-neutral-400" />
            {new Date(info.getValue() as string).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: () => (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm">
              <IconEye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <IconDownload className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <IconSend className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  // Filter data based on search and status
  const filteredData = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-white dark:bg-neutral-900">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-neutral-800 dark:text-neutral-100">
              Billing Management
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Manage invoices, clients, and payments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="border-neutral-200 dark:border-neutral-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Total Revenue
                      </p>
                      <p className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        ${totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-green-500/10 p-3">
                      <IconCurrencyDollar className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-neutral-200 dark:border-neutral-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Pending
                      </p>
                      <p className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        ${pendingAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-yellow-500/10 p-3">
                      <IconClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-neutral-200 dark:border-neutral-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Overdue
                      </p>
                      <p className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        ${overdueAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 p-3">
                      <IconX className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-neutral-200 dark:border-neutral-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Total Clients
                      </p>
                      <p className="mt-2 text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                        {clients.length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 p-3">
                      <IconUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "invoices"
                  ? "border-b-2 border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              <IconFileInvoice className="mr-2 inline-block h-4 w-4" />
              Invoices
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "clients"
                  ? "border-b-2 border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              <IconUsers className="mr-2 inline-block h-4 w-4" />
              Clients
            </button>
          </div>

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <Card className="border-neutral-200 dark:border-neutral-700">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-neutral-800 dark:text-neutral-100">
                      Invoices
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                      Manage and track all your invoices
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isCreateInvoiceOpen}
                    onOpenChange={setIsCreateInvoiceOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Create Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create New Invoice</DialogTitle>
                        <DialogDescription>
                          Fill in the details to create a new invoice
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="client">Client</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem
                                  key={client.id}
                                  value={client.id.toString()}
                                >
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <Input id="amount" type="number" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input id="dueDate" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            placeholder="Invoice description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateInvoiceOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setIsCreateInvoiceOpen(false)}>
                          Create Invoice
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* TanStack Table */}
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-50 dark:bg-neutral-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300"
                              >
                                {header.isPlaceholder ? null : (
                                  <div
                                    className={
                                      header.column.getCanSort()
                                        ? "flex cursor-pointer select-none items-center gap-2"
                                        : ""
                                    }
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                                    {{
                                      asc: <IconArrowUp className="h-4 w-4" />,
                                      desc: (
                                        <IconArrowDown className="h-4 w-4" />
                                      ),
                                    }[header.column.getIsSorted() as string] ??
                                      null}
                                  </div>
                                )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-neutral-700">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Showing{" "}
                      {table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                          table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length,
                      )}{" "}
                      of {table.getFilteredRowModel().rows.length} results
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <IconChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <IconChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <Card className="border-neutral-200 dark:border-neutral-700">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-neutral-800 dark:text-neutral-100">
                      Clients
                    </CardTitle>
                    <CardDescription className="text-neutral-600 dark:text-neutral-400">
                      Manage your client database
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isCreateClientOpen}
                    onOpenChange={setIsCreateClientOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <IconPlus className="mr-2 h-4 w-4" />
                        Add Client
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                          Enter client details to add them to your database
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientName">Client Name</Label>
                          <Input id="clientName" placeholder="Company name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" placeholder="+1 234 567 890" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" placeholder="Client address" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateClientOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setIsCreateClientOpen(false)}>
                          Add Client
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {clients.map((client, idx) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="border-neutral-200 dark:border-neutral-700">
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <div className="rounded-lg bg-blue-500/10 p-2">
                              <IconUsers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <IconTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">
                            {client.name}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            {client.email}
                          </p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {client.phone}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
