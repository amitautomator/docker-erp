"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  passwordChecks,
  SignupFormData,
  signupSchema,
} from "@/schema/auth.schema";

import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

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

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      email: "",
      password: "",
      cCode: "91",
      phone: "",
    },
    shouldUseNativeValidation: true,
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showCountrySelect, setShowCountrySelect] = useState(false);

  const password = useWatch({ control, name: "password" }) || "";
  const cCode = useWatch({ control, name: "cCode" }) || "+91";

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

  const onSubmit: SubmitHandler<SignupFormData> = async (formData) => {
    try {
      const { data, error } = await authClient.signUp.email(
        {
          name: formData.firstName,
          email: formData.email,
          password: formData.password,
          image: "",
          // phone: `${cCode}${formData.phone}`,
        },
        {
          onRequest: (ctx) => {
            console.log("Signing up... loading", ctx);
            console.log("Form Data:", formData);
          },
          onSuccess: () => {
            console.log("Signup successful!");
            router.push("/user/dashboard");
          },
          onError: (ctx) => {
            toast.error(
              ctx.error.message || "Signup failed. Please try again."
            );
          },
        }
      );
      if (error) {
        router.push("/signup");
        toast.error(error.message || "Signup failed. Please try again.");
        return;
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const countries = [
    { code: "91", name: "IN", flag: "🇮🇳" },
    { code: "1", name: "US", flag: "🇺🇸" },
    { code: "44", name: "UK", flag: "🇬🇧" },
    { code: "61", name: "AU", flag: "🇦🇺" },
    { code: "81", name: "JP", flag: "🇯🇵" },
    { code: "86", name: "CN", flag: "🇨🇳" },
  ];

  const selectedCountry =
    countries.find((c) => c.code === cCode) || countries[0];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8 transition-colors duration-300">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-3">
            <Image src="/Logo.png" alt="Logo" width={50} height={50} />
            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Automate Ideas
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Automate your business workflows with our modern ERP solution
          </p>
        </div>

        <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">
          Create your account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* First Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className={`text-sm font-medium block ${
                errors.firstName ? "text-destructive" : "text-foreground"
              }`}
            >
              Full Name
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="John Doe"
              {...register("firstName")}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                errors.firstName
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-input focus-visible:ring-primary"
              }`}
              disabled={isSubmitting}
            />
            {errors.firstName && (
              <p className="flex items-center gap-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className={`text-sm font-medium block ${
                errors.email ? "text-destructive" : "text-foreground"
              }`}
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
              {...register("email")}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                errors.email
                  ? "border-destructive focus-visible:ring-destructive"
                  : "border-input focus-visible:ring-primary"
              }`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="flex items-center gap-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className={`text-sm font-medium block ${
                errors.phone ? "text-destructive" : "text-foreground"
              }`}
            >
              Contact Number
            </label>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountrySelect(!showCountrySelect)}
                  className="flex h-10 w-[110px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 text-primary"
                  disabled={isSubmitting}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
                {showCountrySelect && (
                  <div className="absolute z-50 mt-1 w-[140px] rounded-md border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    {countries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setValue("cCode", country.code);
                          setShowCountrySelect(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-foreground"
                      >
                        <span>{country.flag}</span>
                        <span>
                          {country.code} {country.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                id="phone"
                placeholder="9876543210"
                {...register("phone")}
                className={`flex h-10 flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                  errors.phone
                    ? "border-destructive focus-visible:ring-destructive"
                    : "border-input focus-visible:ring-primary"
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <p className="flex items-center gap-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className={`text-sm font-medium block ${
                errors.password ? "text-destructive" : "text-foreground"
              }`}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a strong password"
                {...register("password")}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
                  errors.password
                    ? "border-destructive focus-visible:ring-destructive"
                    : allRequirementsMet && password
                    ? "border-green-500 focus-visible:ring-green-500"
                    : "border-input focus-visible:ring-primary"
                }`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-0.5"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
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

            {errors.password && !passwordFocus && (
              <p className="flex items-center gap-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-2 w-full active:scale-[0.98] shadow-md hover:shadow-lg"
            disabled={isSubmitting}
          >
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

        {/* Social Login */}
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:border-primary/50"
            disabled={isSubmitting}
          >
            <Image src={"/google.svg"} alt="google" width={25} height={25} />
          </Button>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?
          </span>{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
