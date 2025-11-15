import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmailEnv = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const fallbackDevEmail = "admin@local";
  const targetEmail = adminEmailEnv || fallbackDevEmail;
  const name = adminEmailEnv ? "Admin" : "Admin (Dev)";

  const user = await prisma.user.upsert({
    where: { email: targetEmail },
    update: { role: "ADMIN", name },
    create: { email: targetEmail, name, role: "ADMIN" },
  });

  console.log("Seeded admin user:", user.email);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });