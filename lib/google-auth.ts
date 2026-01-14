// hooks/useGoogleSignIn.ts
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "./auth-client";

export const useGoogleSignIn = (callbackURL?: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackURL || `${window.location.origin}/user/profile`,
      });

      if (error) {
        console.error("Google sign-in error:", error);
        toast.error("Failed to sign in with Google. Please try again.");
        return { success: false, error };
      }

      if (data) {
        console.log("Google sign-in data:", data);
        toast.success("Successfully connected to Google!");
        return { success: true, data };
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("An unexpected error occurred. Please try again.");
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { handleGoogleSignIn, isLoading };
};
