import { Controller, useForm } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface InviteFormData {
  email: string;
  role: "manager" | "admin" | "member";
}

interface InviteFormProps {
  onSubmit: (data: InviteFormData) => void;
}

export default function InviteForm({ onSubmit }: InviteFormProps) {
  const form = useForm<InviteFormData>({
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          {...form.register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email address",
            },
          })}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role">Role</Label>

        <Controller
          control={form.control}
          name="role"
          rules={{ required: "Role is required" }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />

        {form.formState.errors.role && (
          <p className="text-sm text-red-500">
            {form.formState.errors.role.message}
          </p>
        )}
      </div>
      <Button type="submit">Send Invite</Button>
    </form>
  );
}
