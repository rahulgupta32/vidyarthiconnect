import { IConnector, NormalizedUniversity, NormalizedCourse, NormalizedScholarship, NormalizedCost } from "./types";
import { ProviderType } from "@prisma/client";

export class OpenCollegeDataConnector implements IConnector {
  public providerType = ProviderType.OPEN_COLLEGE_DATA;

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: "Open College Data API key/configuration is pending. Using default placeholder config.",
    };
  }

  public async fetchUniversities(): Promise<NormalizedUniversity[]> {
    console.warn("OpenCollegeDataConnector is in PENDING_CONFIGURATION status. No universities fetched.");
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
}
