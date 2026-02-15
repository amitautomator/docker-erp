"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // console.log("Password reset requested for:", formData.email);

      setIsSubmitted(true);
    } catch (error: unknown) {
      console.error("Error during password reset request:", error);
      setErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear error for this field when user starts typing
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 transition-colors duration-300">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-primary/20">
                  <Image
                    src="/Logo.png"
                    alt="Automate Ideas Logo"
                    width={56}
                    height={56}
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

            {/* Title */}
            <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">
              Forgot your password?
            </h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              No worries! Enter your email and we&apos;ll send you reset
              instructions.
            </p>

            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={`text-sm font-medium ${
                    errors.email ? "text-destructive" : "text-foreground"
                  }`}
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit(e);
                  }}
                  className={`transition-all duration-200 ${
                    errors.email
                      ? "border-destructive focus-visible:ring-destructive"
                      : "focus-visible:ring-primary"
                  }`}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  autoFocus
                  disabled={isLoading}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="flex items-center gap-1.5 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Success Message */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 animate-in zoom-in duration-300">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="mb-2 text-2xl font-semibold text-foreground">
                Check your email
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">
                We&apos;ve sent password reset instructions to
              </p>
              <p className="mb-6 font-medium text-foreground break-all">
                {formData.email}
              </p>
              <p className="mb-8 text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try
                again.
              </p>

              <div className="flex w-full flex-col gap-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ email: "" });
                  }}
                  variant="outline"
                  className="w-full border-border bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:border-primary/50"
                >
                  Try another email
                </Button>
                <Link href="/login" className="w-full">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
