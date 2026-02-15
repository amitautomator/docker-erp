import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { z } from "zod";
import { formSchema, ACCEPTED_IMAGE_TYPES } from "@/schema/form.Schema";

type BusinessProfileValues = z.infer<typeof formSchema>;

interface BusinessProfileFormProps {
  businessForm: UseFormReturn<BusinessProfileValues>;
  onSubmit: (values: BusinessProfileValues) => void;
  isPending: boolean;
  isEditing: boolean;
}

export default function BusinessProfileForm({
  businessForm,
  onSubmit,
  isPending,
  isEditing,
}: BusinessProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = businessForm;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 py-4"
      noValidate
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Logo */}

        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">Business Logo</Label>
          <Input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            {...register("businessLogo")}
            disabled={isPending}
          />
          {errors.businessLogo && (
            <p className="text-sm text-red-500">
              {errors.businessLogo.message}
            </p>
          )}
        </div>

        {/* Business Name */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">
            Business Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Enter Your Business Name"
            autoComplete="organization"
            disabled={isPending}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Team Size */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">
            Team Size <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min={1}
            disabled={isPending}
            {...register("team_size", { valueAsNumber: true })}
          />
          {errors.team_size && (
            <p className="text-sm text-red-500">{errors.team_size.message}</p>
          )}
        </div>

        {/* Industry */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">
            Industry <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g. Fintech"
            disabled={isPending}
            {...register("business_type")}
          />
          {errors.business_type && (
            <p className="text-sm text-red-500">
              {errors.business_type.message}
            </p>
          )}
        </div>

        {/* GST */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">GST (Optional)</Label>
          <Input
            maxLength={15}
            className="uppercase"
            disabled={isPending}
            {...register("gst")}
          />
          {errors.gst && (
            <p className="text-sm text-red-500">{errors.gst.message}</p>
          )}
        </div>

        {/* Business Email */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">
            Business Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            autoComplete="email"
            disabled={isPending}
            {...register("business_email")}
          />
          {errors.business_email && (
            <p className="text-sm text-red-500">
              {errors.business_email.message}
            </p>
          )}
        </div>

        {/* Business Phone */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">
            Business Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            type="tel"
            autoComplete="tel"
            disabled={isPending}
            {...register("business_phone")}
          />
          {errors.business_phone && (
            <p className="text-sm text-red-500">
              {errors.business_phone.message}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            autoComplete="street-address"
            disabled={isPending}
            {...register("business_address")}
          />
          {errors.business_address && (
            <p className="text-sm text-red-500">
              {errors.business_address.message}
            </p>
          )}
        </div>

        {/* Website */}
        <div className="grid gap-2">
          <Label className="dark:text-zinc-300">Website (Optional)</Label>
          <Input
            type="url"
            autoComplete="url"
            disabled={isPending}
            {...register("business_website")}
          />
          {errors.business_website && (
            <p className="text-sm text-red-500">
              {errors.business_website.message}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {isPending
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Profile"}
        </Button>
      </DialogFooter>
    </form>
  );
}
