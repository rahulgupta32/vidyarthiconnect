import { IConnector, NormalizedUniversity, NormalizedCourse, NormalizedScholarship, NormalizedCost } from "./types";
import { ProviderType } from "@prisma/client";

export class PartnerApiConnectorPlaceholder implements IConnector {
  public providerType = ProviderType.RECRUITMENT_PARTNER_PLATFORM;

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: "Partner API integration credentials are not configured (DISABLED). Contact SuperAdmin for setup.",
    };
  }

  public async fetchUniversities(): Promise<NormalizedUniversity[]> {
    return [];
  }

  public async fetchCourses(): Promise<NormalizedCourse[]> {
    return [];
  }

  public async fetchScholarships(): Promise<NormalizedScholarship[]> {
    return [];
  }

  public async fetchCosts(): Promise<NormalizedCost[]> {
    return [];
  }

  public async fetchFees(): Promise<NormalizedCost[]> {
    return [];
  }

  public async fetchApplicationStatus(): Promise<any> {
    return { status: "disabled", message: "Connector is pending official credentials." };
  }

  public async fetchOfferLetters(): Promise<any> {
    return { status: "disabled", message: "Connector is pending official credentials." };
  }
}
