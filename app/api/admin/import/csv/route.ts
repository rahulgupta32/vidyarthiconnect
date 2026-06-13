import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { logAudit } from "@/lib/security/audit";
import { AuditAction, ProviderType, AuthType, ReviewStatus } from "@prisma/client";
import { CSVImportSchema } from "@/lib/validators/forms";

// Downloadable sample CSV Template
const SAMPLE_CSV_CONTENT = `university_name,country,city,campus,course_name,degree_level,tuition_fee,currency,intake,deadline,scholarship_available,scholarship_name,scholarship_amount,scholarship_type,self_finance_available,living_cost_estimate,application_fee,deposit_amount,source_url,last_verified_date
"Harvard Mock University","United States","Cambridge","Main","Bachelor of Computer Science","BACHELOR",48000,"USD","Fall (Sept)","2026-12-01",true,"Harvard Merit Scholarship",15000,"MERIT_BASED",true,18000,100,5000,"https://harvard.edu","2026-06-13"
"University of Melbourne Mock","Australia","Melbourne","Parkville","Master of Data Science","MASTER",35000,"AUD","Semester 1 (Feb)","2026-11-15",false,"",0,"",true,22000,150,3000,"https://unimelb.edu","2026-06-13"`;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const template = searchParams.get("template");

  if (template === "true") {
    return new NextResponse(SAMPLE_CSV_CONTENT, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=university_import_template.csv",
      },
    });
  }

  return NextResponse.json({ message: "Use ?template=true to download the sample CSV template." });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";

  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Only CSV files are allowed" }, { status: 400 });
    }

    const text = await file.text();
    const lines = parseCSV(text);

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or missing headers" }, { status: 400 });
    }

    const headers = lines[0].map(h => h.toLowerCase().trim());
    const dataRows = lines.slice(1);

    // Find or create a default CSV Data Source
    let dataSource = await db.externalDataSource.findFirst({
      where: { providerType: ProviderType.CSV_IMPORT },
    });

    if (!dataSource) {
      dataSource = await db.externalDataSource.create({
        data: {
          name: "CSV Bulk Import Manager",
          providerType: ProviderType.CSV_IMPORT,
          authType: AuthType.NONE,
          connectorStatus: "ACTIVE",
          description: "Internal bulk data uploads via CSV templates",
        },
      });
    }

    let parsedCount = 0;
    let createdCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let index = 0; index < dataRows.length; index++) {
      const row = dataRows[index];
      if (row.length === 0 || (row.length === 1 && !row[0])) continue;

      parsedCount++;
      const rowObj: any = {};
      headers.forEach((header, i) => {
        rowObj[header] = row[i] || "";
      });

      // Handle type conversions for Zod schema validation
      if (rowObj.tuition_fee) rowObj.tuition_fee = Number(rowObj.tuition_fee);
      if (rowObj.scholarship_amount) rowObj.scholarship_amount = Number(rowObj.scholarship_amount);
      if (rowObj.living_cost_estimate) rowObj.living_cost_estimate = Number(rowObj.living_cost_estimate);
      if (rowObj.application_fee) rowObj.application_fee = Number(rowObj.application_fee);
      if (rowObj.deposit_amount) rowObj.deposit_amount = Number(rowObj.deposit_amount);

      if (rowObj.scholarship_available) {
        rowObj.scholarship_available = rowObj.scholarship_available === "true" || rowObj.scholarship_available === true;
      }
      if (rowObj.self_finance_available) {
        rowObj.self_finance_available = rowObj.self_finance_available === "true" || rowObj.self_finance_available === true;
      }

      try {
        const validated = CSVImportSchema.parse(rowObj);

        // Put into review queue as targetModel: "CSV_Row"
        await db.importedDataReview.create({
          data: {
            dataSourceId: dataSource.id,
            targetModel: "CSV_Row",
            rawPayload: JSON.stringify(rowObj),
            normalizedPayload: JSON.stringify(validated),
            reviewStatus: ReviewStatus.PENDING_REVIEW,
          },
        });

        createdCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Row ${index + 2} validation error: ${err.message || String(err)}`);
      }
    }

    await logAudit(
      session.id,
      AuditAction.CSV_IMPORT,
      ip,
      `CSV uploaded: ${parsedCount} rows parsed, ${createdCount} created in review queue, ${failedCount} failed.`
    );

    return NextResponse.json({
      success: true,
      summary: {
        rowsUploaded: dataRows.length,
        rowsParsed: parsedCount,
        rowsCreated: createdCount,
        rowsUpdated: 0,
        rowsFailed: failedCount,
        validationErrors: errors,
      },
    });
  } catch (error: any) {
    console.error("CSV import error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  const rowLines = text.split(/\r?\n/);
  for (const line of rowLines) {
    if (!line.trim()) continue;
    
    const cols: string[] = [];
    let insideQuote = false;
    let current = "";
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cols.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    cols.push(current.trim());
    lines.push(cols);
  }
  return lines;
}
