"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Check, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  passwordChecks,
  SignupFormData,
  signupSchema,
} from "@/schema/auth.schema";
import { authClient } from "@/lib/auth-client";

const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
  <div
    className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
      met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
    }`}
  >
    {met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
    <span>{text}</span>
  </div>
);

const countries = [
  { code: "91", name: "IN", flag: "🇮🇳" },
  { code: "1", name: "US", flag: "🇺🇸" },
  { code: "44", name: "UK", flag: "🇬🇧" },
  { code: "61", name: "AU", flag: "🇦🇺" },
];

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
      cCode: "91",
      phone: "",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;

  const password = useWatch({ control, name: "password" }) || "";
  const cCode = useWatch({ control, name: "cCode" }) || "91";

  const passwordStrength = {
    hasMinLength: passwordChecks.minLength.safeParse(password).success,
    hasUpperCase: passwordChecks.hasUpperCase.safeParse(password).success,
    hasLowerCase: passwordChecks.hasLowerCase.safeParse(password).success,
    hasNumber: passwordChecks.hasNumber.safeParse(password).success,
    hasSpecialChar: passwordChecks.hasSpecialChar.safeParse(password).success,
  };

  const allRequirementsMet = Object.values(passwordStrength).every(Boolean);
  const selectedCountry =
    countries.find((c) => c.code === cCode) || countries[0];

  const onSubmit = async (formData: SignupFormData) => {
    try {
      await authClient.signUp.email(
        {
          name: formData.firstName,
          email: formData.email,
          password: formData.password,
          // phone: `${formData.cCode}${formData.phone}`,
        },
        {
          onSuccess: () => {
            toast.success("Account created successfully!");
            router.push("/user/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Signup failed.");
          },
        },
      );
    } catch (error) {
      toast.error("An unexpected error occurred." + error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 py-12 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <Image src="/Logo.png" alt="Logo" width={48} height={48} />
            <span className="text-2xl font-bold tracking-tight text-primary">
              Automate Ideas
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Join us to automate your business workflows.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <FormField
              control={control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="name@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number with Country Code */}
            <div className="space-y-2">
              <FormLabel>Contact Number</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={control}
                  name="cCode"
                  render={({ field }) => (
                    <FormItem>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-20 px-2">
                            {selectedCountry.flag} +{field.value}
                            <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {countries.map((c) => (
                            <DropdownMenuItem
                              key={c.code}
                              onClick={() => setValue("cCode", c.code)}
                            >
                              {c.flag} +{c.code} ({c.name})
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
                        className={
                          allRequirementsMet && password
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                        }
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Indicator */}
            {(passwordFocus || password) && !allRequirementsMet && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3 animate-in fade-in duration-300">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  Security Check
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <PasswordRequirement
                    met={passwordStrength.hasMinLength}
                    text="8+ chars"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasUpperCase}
                    text="Uppercase"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasLowerCase}
                    text="Lowercase"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasNumber}
                    text="Number"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasSpecialChar}
                    text="Special"
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </Form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full" type="button">
          <Image
            src="/google.svg"
            alt="Google"
            width={20}
            height={20}
            className="mr-2"
          />
          Google
        </Button>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
