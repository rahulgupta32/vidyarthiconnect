import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const name = process.env.SUPERADMIN_NAME;
  const password = process.env.SUPERADMIN_PASSWORD;
  const forceCreate = process.env.FORCE_CREATE_SUPERADMIN === "true";

  if (!email || !name || !password) {
    console.error("Error: SUPERADMIN_EMAIL, SUPERADMIN_NAME, and SUPERADMIN_PASSWORD must be set.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // 1. Check if any SUPERADMIN already exists in the database
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPERADMIN },
    });

    // 2. Check if a user with the specified email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.role === UserRole.SUPERADMIN) {
        console.log(`Success: A SuperAdmin account with email "${email}" already exists. Exiting safely.`);
        process.exit(0);
      }

      if (!forceCreate) {
        console.error(
          `Error: A user with email "${email}" already exists with role "${existingUser.role}". Promotion to SUPERADMIN denied unless FORCE_CREATE_SUPERADMIN=true.`
        );
        process.exit(1);
      }

      console.log(`FORCE_CREATE_SUPERADMIN=true: Updating existing user "${email}" to SUPERADMIN role.`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await prisma.user.update({
        where: { email },
        data: {
          name,
          passwordHash,
          role: UserRole.SUPERADMIN,
        },
      });

      console.log("Success: Existing user successfully updated/promoted to SUPERADMIN.");
      process.exit(0);
    }

    if (existingSuperAdmin && !forceCreate) {
      console.error(
        "Error: A SuperAdmin already exists in the system. Creating another SuperAdmin is blocked unless FORCE_CREATE_SUPERADMIN=true."
      );
      process.exit(1);
    }

    // 3. Create the new SuperAdmin user
    console.log(`Creating new SuperAdmin account: ${email}`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: UserRole.SUPERADMIN,
      },
    });

    console.log("Success: SuperAdmin account created successfully.");
  } catch (error) {
    console.error("Error bootstrapping SuperAdmin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
