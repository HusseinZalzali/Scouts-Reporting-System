import { PrismaClient, Role, ReportStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const GROUPS = [
  "فوج الأرز",
  "فوج النهضة",
  "فوج الفجر",
  "فوج الوفاء",
];

function hash(pw: string) {
  return bcrypt.hashSync(pw, 10);
}

async function main() {
  console.log("🌱 Seeding database...");

  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";

  // --- Admin ---
  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      name: "مدير النظام",
      username: adminUsername,
      passwordHash: hash(adminPassword),
      role: Role.ADMIN,
    },
  });
  console.log(`✓ Admin → username: ${adminUsername} / password: ${adminPassword}`);

  // --- Scout groups + their users ---
  for (let i = 0; i < GROUPS.length; i++) {
    const name = GROUPS[i];
    const group = await prisma.scoutGroup.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    const username = `group${i + 1}`;
    const password = `Group@${i + 1}2345`;
    await prisma.user.upsert({
      where: { username },
      update: { scoutGroupId: group.id },
      create: {
        name,
        username,
        passwordHash: hash(password),
        role: Role.GROUP,
        scoutGroupId: group.id,
      },
    });
    console.log(`✓ Group "${name}" → username: ${username} / password: ${password}`);
  }

  // --- Sample reports for the first group (last 5 days) ---
  const firstGroup = await prisma.scoutGroup.findUnique({ where: { name: GROUPS[0] } });
  const firstGroupUser = await prisma.user.findUnique({ where: { username: "group1" } });

  if (firstGroup && firstGroupUser) {
    for (let d = 1; d <= 5; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const reportDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

      await prisma.dailyReport.upsert({
        where: {
          scoutGroupId_reportDate: { scoutGroupId: firstGroup.id, reportDate },
        },
        update: {},
        create: {
          scoutGroupId: firstGroup.id,
          reportDate,
          location: "مقر الفوج - بيروت",
          status: ReportStatus.SUBMITTED,
          submittedById: firstGroupUser.id,
          attendanceBaraem: 8 + d,
          attendanceAshbal: 12 + d,
          attendanceKashafa: 10 + d,
          attendanceJawala: 5 + d,
          attendanceQada: 3 + d,
          programItems: {
            create: [
              { order: 1, text: "افتتاح وتحية العلم" },
              { order: 2, text: "نشاط كشفي ميداني" },
              { order: 3, text: "ألعاب تربوية" },
              { order: 4, text: "تقييم وختام" },
            ],
          },
        },
      });
    }
    console.log("✓ Sample reports created for first group");
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
