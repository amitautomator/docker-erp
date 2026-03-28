"use client";

import { UseFormReturn, Controller } from "react-hook-form";
import { Loader2, Building2, MapPin, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { formSchema, ACCEPTED_IMAGE_TYPES } from "@/schema/form.Schema";
import { useMemo, useEffect } from "react";
import { State, City } from "country-state-city";

type BusinessProfileValues = z.infer<typeof formSchema>;

interface BusinessProfileFormProps {
  businessForm: UseFormReturn<BusinessProfileValues>;
  onSubmit: (values: BusinessProfileValues) => void;
  isPending: boolean;
  isEditing: boolean;
}

const INDIA_ISO = "IN";
const toOption = (label: string, value: string) => ({ label, value });

// ── Reusable field wrapper ───────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Section header — always spans both columns ───────────────────────────────
function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ElementType;
}) {
  return (
    <div className="col-span-1 sm:col-span-2 flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-700">
      <Icon className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
      <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function BusinessProfileForm({
  businessForm,
  onSubmit,
  isPending,
  isEditing,
}: BusinessProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = businessForm;

  const selectedState = watch("business_state");

  const stateOptions = useMemo(
    () =>
      State.getStatesOfCountry(INDIA_ISO).map((s) =>
        toOption(s.name, s.isoCode),
      ),
    [],
  );

  const cityOptions = useMemo(() => {
    if (!selectedState) return [];
    return City.getCitiesOfState(INDIA_ISO, selectedState).map((c) =>
      toOption(c.name, c.name),
    );
  }, [selectedState]);

  useEffect(() => {
    setValue("business_city", "");
  }, [selectedState, setValue]);

  useEffect(() => {
    setValue("business_country", INDIA_ISO);
  }, [setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) =>
        console.log("Validation errors:", errs),
      )}
      className="py-4 space-y-8"
      noValidate
    >
      {/* ── Business Identity ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <SectionHeader title="Business Identity" icon={Building2} />

        <Field
          label="Business Logo"
          error={errors.businessLogo?.message as string}
        >
          <Input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            {...register("businessLogo")}
            disabled={isPending}
            className="cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-700 dark:file:text-zinc-300"
          />
        </Field>

        <Field label="Business Name" required error={errors.name?.message}>
          <Input
            placeholder="e.g. Acme Pvt. Ltd."
            autoComplete="organization"
            disabled={isPending}
            {...register("name")}
          />
        </Field>

        <Field label="Industry" required error={errors.business_type?.message}>
          <Input
            placeholder="e.g. Fintech, E-commerce"
            disabled={isPending}
            {...register("business_type")}
          />
        </Field>

        <Field label="Team Size" required error={errors.team_size?.message}>
          <Input
            type="number"
            min={1}
            placeholder="e.g. 10"
            disabled={isPending}
            {...register("team_size", { valueAsNumber: true })}
          />
        </Field>

        <Field label="GST Number" error={errors.gst?.message}>
          <Input
            maxLength={15}
            placeholder="e.g. 22AAAAA0000A1Z5"
            className="uppercase tracking-wider"
            disabled={isPending}
            {...register("gst")}
          />
        </Field>
      </div>

      {/* ── Contact Details ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <SectionHeader title="Contact Details" icon={Phone} />

        <Field
          label="Business Email"
          required
          error={errors.business_email?.message}
        >
          <Input
            type="email"
            placeholder="hello@yourbusiness.com"
            autoComplete="email"
            disabled={isPending}
            {...register("business_email")}
          />
        </Field>

        <Field
          label="Business Phone"
          required
          error={errors.business_phone?.message}
        >
          <Input
            type="tel"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            disabled={isPending}
            {...register("business_phone")}
          />
        </Field>

        <Field
          label="Website"
          error={errors.business_website?.message}
          className="sm:col-span-2"
        >
          <Input
            type="url"
            placeholder="https://yourbusiness.com"
            autoComplete="url"
            disabled={isPending}
            {...register("business_website")}
          />
        </Field>
      </div>

      {/* ── Location ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <SectionHeader title="Location" icon={MapPin} />

        <Field label="Country" required>
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-none">
            <span>🇮🇳</span>
            <span>India</span>
          </div>
          <input
            type="hidden"
            value={INDIA_ISO}
            {...register("business_country")}
          />
        </Field>

        <Field label="State" required error={errors.business_state?.message}>
          <Controller
            name="business_state"
            control={control}
            render={({ field }) => (
              <Select
                disabled={isPending}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select state..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {stateOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.label}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* City */}
        <Field label="City" required error={errors.business_city?.message}>
          <Controller
            name="business_city"
            control={control}
            render={({ field }) => (
              <Select
                disabled={isPending || !selectedState}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedState ? "Select city..." : "Select state first"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {cityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.label}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {/* Pincode */}
        <Field label="Pincode" error={errors.business_pincode?.message}>
          <Input
            placeholder="e.g. 400001"
            maxLength={6}
            disabled={isPending}
            {...register("business_pincode")}
          />
        </Field>

        {/* Address — spans full width */}
        <Field
          label="Address"
          required
          error={errors.business_address?.message}
          className="sm:col-span-2"
        >
          <Input
            placeholder="Street address, building, area"
            autoComplete="street-address"
            disabled={isPending}
            {...register("business_address")}
          />
        </Field>
      </div>

      {/* ── Submit ─────────────────────────────────────────────────── */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto sm:min-w-40"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {isPending
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Profile"}
        </Button>
      </div>
    </form>
  );
}
