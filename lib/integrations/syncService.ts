import { db } from "../db/client";
import { MockGlobalUniversityConnector } from "./mockGlobalUniversityConnector";
import { CollegeScorecardConnector } from "./collegeScorecardConnector";
import { OpenCollegeDataConnector } from "./openCollegeDataConnector";
import { PartnerApiConnectorPlaceholder } from "./partnerApiConnectorPlaceholder";
import { IConnector } from "./types";
import { ProviderType, SyncStatus, SyncType, ReviewStatus } from "@prisma/client";

export class SyncService {
  public static getConnector(providerType: ProviderType): IConnector {
    switch (providerType) {
      case ProviderType.MOCK:
        return new MockGlobalUniversityConnector();
      case ProviderType.COLLEGE_SCORECARD:
        return new CollegeScorecardConnector();
      case ProviderType.OPEN_COLLEGE_DATA:
        return new OpenCollegeDataConnector();
      case ProviderType.RECRUITMENT_PARTNER_PLATFORM:
      case ProviderType.UNIVERSITY_DIRECT:
      case ProviderType.CENTRAL_ADMISSION_SYSTEM:
      case ProviderType.COMMON_APP:
      case ProviderType.STUDY_LINK:
      case ProviderType.PUBLIC_DATA_API:
        return new PartnerApiConnectorPlaceholder();
      default:
        throw new Error(`Unsupported provider type: ${providerType}`);
    }
  }

  public static async runSync(dataSourceId: string, syncType: SyncType, triggeredBy: string): Promise<string> {
    const source = await db.externalDataSource.findUnique({
      where: { id: dataSourceId },
    });

    if (!source) {
      throw new Error(`Data source not found with ID: ${dataSourceId}`);
    }

    const job = await db.dataSyncJob.create({
      data: {
        dataSourceId,
        syncType,
        status: SyncStatus.RUNNING,
        triggeredBy,
      },
    });

    // Run async in-process via setTimeout
    setTimeout(async () => {
      let fetchedCount = 0;
      let createdReviewCount = 0;
      let failedCount = 0;

      try {
        const connector = this.getConnector(source.providerType);
        
        // 1. Sync Universities
        if (syncType === SyncType.ALL || syncType === SyncType.UNIVERSITIES) {
          const unis = await connector.fetchUniversities();
          fetchedCount += unis.length;
          for (const uni of unis) {
            try {
              await db.importedDataReview.create({
                data: {
                  dataSourceId,
                  syncJobId: job.id,
                  targetModel: "University",
                  rawPayload: JSON.stringify(uni),
                  normalizedPayload: JSON.stringify({
                    ...uni,
                    dataStatus: "PENDING_REVIEW",
                  }),
                  reviewStatus: ReviewStatus.PENDING_REVIEW,
                },
              });
              createdReviewCount++;
            } catch (err) {
              failedCount++;
            }
          }
        }

        // 2. Sync Courses
        if (syncType === SyncType.ALL || syncType === SyncType.COURSES) {
          const courses = await connector.fetchCourses();
          fetchedCount += courses.length;
          for (const course of courses) {
            try {
              await db.importedDataReview.create({
                data: {
                  dataSourceId,
                  syncJobId: job.id,
                  targetModel: "Course",
                  rawPayload: JSON.stringify(course),
                  normalizedPayload: JSON.stringify({
                    ...course,
                    dataStatus: "PENDING_REVIEW",
                  }),
                  reviewStatus: ReviewStatus.PENDING_REVIEW,
                },
              });
              createdReviewCount++;
            } catch (err) {
              failedCount++;
            }
          }
        }

        // 3. Sync Scholarships
        if (syncType === SyncType.ALL || syncType === SyncType.SCHOLARSHIPS) {
          const scholarships = await connector.fetchScholarships();
          fetchedCount += scholarships.length;
          for (const sch of scholarships) {
            try {
              await db.importedDataReview.create({
                data: {
                  dataSourceId,
                  syncJobId: job.id,
                  targetModel: "Scholarship",
                  rawPayload: JSON.stringify(sch),
                  normalizedPayload: JSON.stringify({
                    ...sch,
                    dataStatus: "PENDING_REVIEW",
                  }),
                  reviewStatus: ReviewStatus.PENDING_REVIEW,
                },
              });
              createdReviewCount++;
            } catch (err) {
              failedCount++;
            }
          }
        }

        // 4. Sync Costs
        if (syncType === SyncType.ALL || syncType === SyncType.FEES) {
          const costs = await connector.fetchCosts();
          fetchedCount += costs.length;
          for (const cost of costs) {
            try {
              await db.importedDataReview.create({
                data: {
                  dataSourceId,
                  syncJobId: job.id,
                  targetModel: "CourseCost",
                  rawPayload: JSON.stringify(cost),
                  normalizedPayload: JSON.stringify({
                    ...cost,
                    dataStatus: "PENDING_REVIEW",
                  }),
                  reviewStatus: ReviewStatus.PENDING_REVIEW,
                },
              });
              createdReviewCount++;
            } catch (err) {
              failedCount++;
            }
          }
        }

        await db.dataSyncJob.update({
          where: { id: job.id },
          data: {
            status: SyncStatus.SUCCESS,
            completedAt: new Date(),
            recordsFetched: fetchedCount,
            recordsCreated: createdReviewCount,
            recordsFailed: failedCount,
          },
        });
      } catch (error: any) {
        console.error(`Sync Job ${job.id} failed:`, error);
        await db.dataSyncJob.update({
          where: { id: job.id },
          data: {
            status: SyncStatus.FAILED,
            completedAt: new Date(),
            errorMessage: error.message || String(error),
            recordsFailed: failedCount || 1,
          },
        });
      }
    }, 0);

    return job.id;
  }
}
