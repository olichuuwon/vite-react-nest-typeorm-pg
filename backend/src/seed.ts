import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user/user.entity";
import { Activity } from "./activity/activity.entity";
import { AttendanceRecord } from "./attendance/attendance.entity";

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const userRepo = appContext.get<Repository<User>>(getRepositoryToken(User));
  const activityRepo = appContext.get<Repository<Activity>>(
    getRepositoryToken(Activity),
  );
  const attendanceRepo = appContext.get<Repository<AttendanceRecord>>(
    getRepositoryToken(AttendanceRecord),
  );

  console.log("🔄 Clearing existing data...");

  // IMPORTANT: order = child → parent, because of FKs
  await attendanceRepo
    .createQueryBuilder()
    .delete()
    .from(AttendanceRecord)
    .execute();

  await activityRepo.createQueryBuilder().delete().from(Activity).execute();

  await userRepo.createQueryBuilder().delete().from(User).execute();

  console.log("🌱 Seeding users...");

  const admin = userRepo.create({
    name: "Admin User",
    identifier: "admin",
    email: "admin@example.com",
    role: "admin",
  });

  const alice = userRepo.create({
    name: "Alice Tan",
    identifier: "alice",
    email: "alice@example.com",
    role: "member",
  });

  const bob = userRepo.create({
    name: "Bob Lim",
    identifier: "bob",
    email: "bob@example.com",
    role: "member",
  });

  const users = await userRepo.save([admin, alice, bob]);

  console.log(
    "✅ Users seeded:",
    users.map((u) => u.identifier),
  );

  console.log("🌱 Seeding activities...");

  const now = new Date();
  const todayMorning = new Date(now);
  todayMorning.setHours(7, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(8, 0, 0, 0);

  const yesterdayStart = new Date(now);
  yesterdayStart.setDate(now.getDate() - 1);
  yesterdayStart.setHours(18, 0, 0, 0);

  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(20, 0, 0, 0);

  const morningParade = activityRepo.create({
    title: "Morning Parade",
    description: "Standard unit morning parade and roll-call.",
    date: todayMorning.toISOString().slice(0, 10),
    startAt: todayMorning,
    endAt: todayEnd,
    location: "Parade Square",
    createdByUserId: admin.id,
  });

  const ptSession = activityRepo.create({
    title: "Evening PT Session",
    description: "Strength and conditioning training.",
    date: yesterdayStart.toISOString().slice(0, 10),
    startAt: yesterdayStart,
    endAt: yesterdayEnd,
    location: "Gym / Track",
    createdByUserId: admin.id,
  });

  const activities = await activityRepo.save([morningParade, ptSession]);

  console.log(
    "✅ Activities seeded:",
    activities.map((a) => a.title),
  );

  console.log("🌱 Seeding attendance...");

  const [savedMorningParade, savedPtSession] = activities;
  const [savedAdmin, savedAlice, savedBob] = users;

  const attendanceRecords = await attendanceRepo.save([
    // Morning parade
    attendanceRepo.create({
      activityId: savedMorningParade.id,
      userId: savedAdmin.id,
      status: "present",
      remarks: "OIC",
      checkedInAt: todayMorning,
    }),
    attendanceRepo.create({
      activityId: savedMorningParade.id,
      userId: savedAlice.id,
      status: "present",
      checkedInAt: todayMorning,
    }),
    attendanceRepo.create({
      activityId: savedMorningParade.id,
      userId: savedBob.id,
      status: "late",
      remarks: "5 mins late",
      checkedInAt: new Date(todayMorning.getTime() + 5 * 60 * 1000),
    }),

    // PT session
    attendanceRepo.create({
      activityId: savedPtSession.id,
      userId: savedAlice.id,
      status: "absent",
      remarks: "On medical leave",
    }),
    attendanceRepo.create({
      activityId: savedPtSession.id,
      userId: savedBob.id,
      status: "present",
    }),
  ]);

  console.log("✅ Attendance seeded:", attendanceRecords.length, "records");

  await appContext.close();
  console.log("🌟 Seeding complete.");
}

bootstrap().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
