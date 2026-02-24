import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useRef, useEffect } from "react";
import { Controller, useForm, SubmitHandler } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "motion/react";
import { formSchema } from "@/schema/form.Schema";
import { fetchOrgData } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { IconUpload, IconX } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const generalSchema = z.object({
  logo: z.string().optional(),
  billName: z.string().min(1, "Company name is required"),
  gst: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  invoicePrefix: z.string().min(1, "Invoice prefix is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  dueDays: z.string().min(1, "Due days is required"),
});

type GeneralForm = z.infer<typeof generalSchema>;
type BusinessProfileValues = z.infer<typeof formSchema>;

export default function GeneralSetting() {
  //
  const [orgData, setOrgData] = useState<BusinessProfileValues | undefined>();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register: regGeneral,
    handleSubmit: handleGeneral,
    control: controlGeneral,
    reset: resetGeneral,
    formState: { errors: generalErrors },
  } = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      billName: "",
      gst: "",
      address: "",
      city: "",
      postal: "",
      country: "in",
      currency: "inr",
      invoicePrefix: "INV-",
      invoiceNumber: "1001",
      dueDays: "30",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchOrgData();
        if (data?.id) {
          setOrgData(data);
          if (data.logo) {
            setLogoPreview(data.logo);
          }
          resetGeneral({
            billName: data.name || "",
            gst: data.gst || "",
            address: data.business_address || "",
            city: "",
            postal: "",
            country: "in",
            currency: "inr",
            invoicePrefix: "INV-",
            invoiceNumber: "1001",
            dueDays: "30",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load organization data");
      }
    };
    loadData();
  }, [resetGeneral]);

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onGeneralSubmit: SubmitHandler<GeneralForm> = (data) => {
    console.log("General:", data);
    toast.success("General settings saved!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle>General Billing Settings</CardTitle>
          <CardDescription>
            Configure basic billing information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGeneral(onGeneralSubmit)} className="space-y-6">
            {/* ── Company Information ── */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Company Information
              </h3>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "relative h-16 w-16 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400",
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleLogoFile(file);
                    }}
                  >
                    {logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          width={128}
                          height={128}
                          alt="Logo preview"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoPreview(null);
                          }}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400">
                        <IconUpload className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoFile(file);
                    }}
                  />

                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="hover:text-neutral-700 dark:hover:text-neutral-600"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => setLogoPreview(null)}
                        className="text-xs text-red-500 hover:text-red-600 text-left"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-neutral-400">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billName">Company Name</Label>
                  <Input
                    id="billName"
                    placeholder="Enter company name"
                    {...regGeneral("billName")}
                  />
                  {generalErrors.billName && (
                    <p className="text-xs text-red-500">
                      {generalErrors.billName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst">Tax ID / GST Number</Label>
                  <Input
                    id="gst"
                    placeholder="Enter tax ID"
                    {...regGeneral("gst")}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    {...regGeneral("address")}
                  />
                  {generalErrors.address && (
                    <p className="text-xs text-red-500">
                      {generalErrors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" {...regGeneral("city")} />
                  {generalErrors.city && (
                    <p className="text-xs text-red-500">
                      {generalErrors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    placeholder="Postal code"
                    {...regGeneral("postal")}
                  />
                  {generalErrors.postal && (
                    <p className="text-xs text-red-500">
                      {generalErrors.postal.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Controller
                    name="country"
                    control={controlGeneral}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">India</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Controller
                    name="currency"
                    control={controlGeneral}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inr">INR (₹)</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* ── Invoice Defaults ── */}
            <div className="space-y-4 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Invoice Defaults
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    placeholder="e.g., INV-"
                    {...regGeneral("invoicePrefix")}
                  />
                  {generalErrors.invoicePrefix && (
                    <p className="text-xs text-red-500">
                      {generalErrors.invoicePrefix.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Next Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    type="number"
                    placeholder="1001"
                    {...regGeneral("invoiceNumber")}
                  />
                  {generalErrors.invoiceNumber && (
                    <p className="text-xs text-red-500">
                      {generalErrors.invoiceNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDays">Default Due Days</Label>
                  <Input
                    id="dueDays"
                    type="number"
                    placeholder="30"
                    {...regGeneral("dueDays")}
                  />
                  {generalErrors.dueDays && (
                    <p className="text-xs text-red-500">
                      {generalErrors.dueDays.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => resetGeneral()}
              >
                Reset to Default
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
