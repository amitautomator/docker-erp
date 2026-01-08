import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXTAUTH_URL!,
  basePath: "/api/auth",
  plugins: [organizationClient()],
});
