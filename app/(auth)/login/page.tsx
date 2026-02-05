"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  passwordChecks,
  loginSchema,
  LoginFormData,
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

export default function LoginPage() {
  const router = useRouter();
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const password = useWatch({ control, name: "password" }) || "";

  const passwordStrength = {
    hasMinLength: passwordChecks.minLength.safeParse(password).success,
    hasUpperCase: passwordChecks.hasUpperCase.safeParse(password).success,
    hasLowerCase: passwordChecks.hasLowerCase.safeParse(password).success,
    hasNumber: passwordChecks.hasNumber.safeParse(password).success,
    hasSpecialChar: passwordChecks.hasSpecialChar.safeParse(password).success,
  };

  const allRequirementsMet = Object.values(passwordStrength).every(Boolean);

  const onSubmit = async (formData: LoginFormData) => {
    await authClient.signIn.email(
      {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
        callbackURL: `${window.location.origin}/user/dashboard`,
      },
      {
        onSuccess: () => {
          toast.success("Login successful!");
          router.push("/user/dashboard");
        },
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            toast.error("Account not verified. Check your email.");
          } else {
            toast.error(ctx.error.message || "Login failed.");
          }
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-primary/10 p-2">
              <Image
                src="/Logo.png"
                alt="Logo"
                width={48}
                height={48}
                priority
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">
              Automate Ideas
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back! Please enter your details.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
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

            {/* Password Field */}
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
                          allRequirementsMet
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

            {/* Remember Me & Links */}
            <div className="flex items-center justify-between">
              <FormField
                control={control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>

            {/* Password Requirements Tooltip */}
            {(passwordFocus || password) && !allRequirementsMet && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3 animate-in fade-in duration-300">
                <p className="text-[11px] font-bold uppercase text-muted-foreground">
                  Requirements
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  <PasswordRequirement
                    met={passwordStrength.hasMinLength}
                    text="8+ characters"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasUpperCase}
                    text="Uppercase letter"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasNumber}
                    text="Number"
                  />
                  <PasswordRequirement
                    met={passwordStrength.hasSpecialChar}
                    text="Special character"
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
