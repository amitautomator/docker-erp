"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { Eye, EyeOff, Check, X } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, SubmitHandler, Controller } from "react-hook-form";

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
  //
  const router = useRouter();

  //

  //

  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const password = useWatch({ control, name: "password" }) || "";

  const passwordStrength = {
    hasMinLength: passwordChecks.minLength.safeParse(password || "").success,
    hasMaxLength: passwordChecks.maxLength.safeParse(password || "").success,
    hasUpperCase: passwordChecks.hasUpperCase.safeParse(password || "").success,
    hasLowerCase: passwordChecks.hasLowerCase.safeParse(password || "").success,
    hasNumber: passwordChecks.hasNumber.safeParse(password || "").success,
    hasSpecialChar: passwordChecks.hasSpecialChar.safeParse(password || "")
      .success,
  };

  const allRequirementsMet =
    passwordStrength.hasMinLength &&
    passwordStrength.hasMaxLength &&
    passwordStrength.hasUpperCase &&
    passwordStrength.hasLowerCase &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecialChar;

  const onSubmit: SubmitHandler<LoginFormData> = async (formData) => {
    try {
      console.log("Form Data Submitted:", formData);
      const { data, error } = await authClient.signIn.email(
        {
          email: formData.email,
          password: formData.password,
          rememberMe: true,
          callbackURL: `${window.location.origin}/dashboard`,
        },
        {
          onRequest: (ctx) => {
            console.log("Signing up... loading", ctx);
            console.log("Form Data:", formData);
          },
          onSuccess: () => {
            console.log("Signup successful!");
            router.push("/dashboard");
          },
          onError: (ctx) => {
            console.log("Signup error callback:", ctx);
            if (ctx.error.status === 403) {
              toast.error(
                `Your account is not verified. Please check your email (${formData.email}) for the verification link.  If you didn't receive the email, please check your spam folder or request a new verification email.`
              );
            }

            console.error("Signup error:", ctx.error);
          },
        }
      );
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-300">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-primary/20">
              <Image
                src="/Logo.png"
                alt="Automate Ideas Logo"
                width={56}
                height={56}
                priority
                className="object-contain p-2"
              />
            </div>
            <span className="bg-linear-to-br from-primary via-primary to-primary/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Automate Ideas
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Automate your business workflows with our modern ERP solution
          </p>
        </div>

        <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">
          Welcome back
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="transition-all duration-200 focus-visible:ring-primary"
              autoFocus
              {...register("email")}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={` pr-10 transition-all duration-200 focus-visible ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : allRequirementsMet && password
                    ? "border-green-500 focus-visible:ring-green-500"
                    : "border-input focus-visible:ring-primary"
                }`}
                {...register("password")}
                onBlur={() => setPasswordFocus(false)}
                onFocus={() => setPasswordFocus(true)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {/* Remember me checkbox */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="remember-me"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-input focus-visible:ring-primary text-primary-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-border"
                    // {...register("rememberMe")}
                  />
                )}
              />

              <Label
                htmlFor="remember-me"
                className="text-sm font-medium text-foreground"
              >
                Remember me
              </Label>
            </div>
          </div>

          {(passwordFocus || password) && (
            <div className="mt-2.5 space-y-2 rounded-lg border border-border bg-muted/30 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground">
                  Password requirements:
                </p>
                {allRequirementsMet && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Strong ✓
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <PasswordRequirement
                  met={passwordStrength.hasMinLength}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={passwordStrength.hasUpperCase}
                  text="One uppercase letter (A-Z)"
                />
                <PasswordRequirement
                  met={passwordStrength.hasLowerCase}
                  text="One lowercase letter (a-z)"
                />
                <PasswordRequirement
                  met={passwordStrength.hasNumber}
                  text="One number (0-9)"
                />
                <PasswordRequirement
                  met={passwordStrength.hasSpecialChar}
                  text="One special character (@$!%*?&)"
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200 "
            >
              Forgot password?
            </Link>
            <Link href="/resend-verification">
              <span className="text-sm font-medium text-primary hover:underline hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200 ">
                Resend verification email
              </span>
            </Link>
          </div>

          <Button
            type="submit"
            className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg"
          >
            Sign in
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login Options */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:border-primary/50"
          >
            <Image src={"/google.svg"} alt="google" width={25} height={25} />
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            Don&apos;t have an account?
          </span>{" "}
          <Link
            href="/signup"
            className="font-semibold text-primary hover:underline hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
