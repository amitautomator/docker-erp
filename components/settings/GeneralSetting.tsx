import Image from "next/image";
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

const DEFAULT_VALUES: GeneralForm = {
  logo: "",
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
};

export default function GeneralSetting() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register: regGeneral,
    handleSubmit: handleGeneral,
    control: controlGeneral,
    reset: resetGeneral,
    setValue,
    formState: { errors: generalErrors },
  } = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchOrgData();
        if (data?.id) {
          if (data.logo) {
            setLogoPreview(data.logo);
          }
          resetGeneral({
            logo: data.logo || "",
            billName: data.name || "",
            gst: data.gst || "",
            address: data.business_address || "",
            city: "",
            postal: "",
            country: "in",
            currency: "inr",
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
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setValue("logo", result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setValue("logo", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    resetGeneral(DEFAULT_VALUES);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onGeneralSubmit: SubmitHandler<GeneralForm> = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Replace with your actual API call, e.g.:
      // await updateOrgData(data);
      console.log("General settings submitted:", data);
      toast.success("General settings saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-50">
            General Billing Settings
          </CardTitle>
          <CardDescription className="text-neutral-500 dark:text-neutral-400">
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
                <Label
                  htmlFor="logo"
                  className="text-neutral-700 dark:text-neutral-300"
                >
                  Company Logo
                </Label>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "relative h-16 w-16 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                        : "border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 bg-neutral-50 dark:bg-neutral-800/50",
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
                        <Image
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
                            handleRemoveLogo();
                          }}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-500">
                        <IconUpload className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <Input
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
                      className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-left transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="billName"
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    Company Name
                  </Label>
                  <Input
                    id="billName"
                    placeholder="Enter company name"
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    {...regGeneral("billName")}
                  />
                  {generalErrors.billName && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {generalErrors.billName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="gst"
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    Tax ID / GST Number
                  </Label>
                  <Input
                    id="gst"
                    placeholder="Enter tax ID"
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    {...regGeneral("gst")}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="address"
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    {...regGeneral("address")}
                  />
                  {generalErrors.address && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {generalErrors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="City"
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    {...regGeneral("city")}
                  />
                  {generalErrors.city && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {generalErrors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="postal"
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    Postal Code
                  </Label>
                  <Input
                    id="postal"
                    placeholder="Postal code"
                    className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    {...regGeneral("postal")}
                  />
                  {generalErrors.postal && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {generalErrors.postal.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-700 dark:text-neutral-300">
                    Country
                  </Label>
                  <Controller
                    name="country"
                    control={controlGeneral}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                          <SelectItem
                            value="in"
                            className="text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-700"
                          >
                            India
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-neutral-700 dark:text-neutral-300">
                    Default Currency
                  </Label>
                  <Controller
                    name="currency"
                    control={controlGeneral}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                          <SelectItem
                            value="inr"
                            className="text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-700"
                          >
                            INR (₹)
                          </SelectItem>
                          <SelectItem
                            value="usd"
                            className="text-neutral-900 dark:text-neutral-100 focus:bg-neutral-100 dark:focus:bg-neutral-700"
                          >
                            USD ($)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100"
                onClick={handleReset}
              >
                Reset to Default
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
