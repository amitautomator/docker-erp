import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
  basePath: "/api/auth",
  plugins: [organizationClient(), lastLoginMethodClient()],
});
