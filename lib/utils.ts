import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import axios from "axios";
import { formSchema } from "@/schema/form.Schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetchOrgData = async () => {
  try {
    const response = await axios.get("/api/auth/organization/list", {
      withCredentials: true,
    });

    if (response.data && response.data.length > 0) {
      const fullOrgResponse = await axios.post(
        "/api/getFullOrg",
        { id: response.data[0]?.id },
        { withCredentials: true },
      );
      return transformApiDataToFormValues(fullOrgResponse.data);
    }
  } catch (error) {
    console.error("Error fetching organization data:", error);
    return null;
  }
};

export const fetchMembersData = async (orgID: string) => {
  try {
    console.log(orgID);
    const response = await axios.post("/api/team-members", {
      orgID,
      withCredentials: true,
    });
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Error fetching members data:", error);
    return [];
  }
};

type BusinessProfileValues = z.infer<typeof formSchema>;

interface ApiOrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logo: string;
  team_size: string | number;
  business_phone: string;
  business_email: string;
  business_type: string;
  business_address: string;
  business_website: string;
  business_country: string;
  business_state: string;
  business_city: string;
  business_pincode: string;
  gst: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  metadata: any;
}

export const transformApiDataToFormValues = (
  apiData: ApiOrganizationResponse,
): BusinessProfileValues => {
  return {
    name: apiData.name,
    team_size:
      typeof apiData.team_size === "string"
        ? parseInt(apiData.team_size, 10)
        : apiData.team_size,
    business_address: apiData.business_address,
    business_type: apiData.business_type,
    business_email: apiData.business_email,
    business_website: apiData.business_website || "",
    business_phone: apiData.business_phone,
    business_country: apiData.business_country ?? "",
    business_state: apiData.business_state ?? "",
    business_city: apiData.business_city ?? "",
    business_pincode: apiData.business_pincode ?? "",
    gst: apiData.gst || "",
    logo: apiData.logo,
    businessLogo: undefined,
    id: apiData.id,
  };
};
