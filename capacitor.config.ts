import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "docker.erp",
  appName: "Automate-Ideas-erp",
  webDir: "build",
  server: {
    androidScheme: "https",
    hostname: "localhost",
    cleartext: true,
    url: "http://localhost:3200",
  },
};

export default config;
