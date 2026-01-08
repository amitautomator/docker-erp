// Code Review Comments:
// 1. Missing error type definition - 'error: any' should be properly typed
// 2. Unnecessary string literal comments (//{" "}) in the JSX
// 3. Missing loading state UI feedback beyond button text
// 4. No email validation beyond HTML5 'type="email"'
// 5. No rate limiting on form submission
// 6. Missing aria-labels for better accessibility
// 7. Missing error boundary wrapper
// 8. Consider adding a loading spinner component
// 9. Consider adding metadata for SEO
// 10. Consider adding unit tests

"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });
      toast.success(
        "Verification email sent successfully! Please check your inbox and spam folder."
      );
      setEmail("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: { message?: string } | any) {
      console.error("Resend verification error:", error);
      if (error?.message?.includes("ALREADY_VERIFIED")) {
        toast.error("This email is already verified. You can log in now.");
      } else if (error?.message?.includes("USER_NOT_FOUND")) {
        toast.error("No account found with this email address.");
      } else {
        toast.error("Failed to send verification email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Mail />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-foreground">
            Resend Verification Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a new verification
            link
          </p>
        </div>

        <form onSubmit={handleResendVerification} className="space-y-5">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="transition-all duration-200 focus-visible:ring-primary"
              autoFocus
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Verification Email"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Remember your password?</span>{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
