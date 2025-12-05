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
    getRepositoryToken(Activity)
  );
  const attendanceRepo = appContext.get<Repository<AttendanceRecord>>(
    getRepositoryToken(AttendanceRecord)
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
    users.map((u) => u.identifier)
  );

  console.log("🌱 Seeding activities...");

  // Helper to make a Date in SG time (UTC+08:00) for a given date + HH:MM
  const makeDateTime = (date: string, time: string) =>
    new Date(`${date}T${time}:00+08:00`);

  // Mix of morning parades, PT, duty, cohesion, etc.
  const dec1 = "2025-12-01";
  const dec3 = "2025-12-03";
  const dec5 = "2025-12-05";
  const dec7 = "2025-12-07";
  const dec12 = "2025-12-12";
  const dec18 = "2025-12-18";
  const dec19 = "2025-12-19";
  const dec22 = "2025-12-22";
  const dec29 = "2025-12-29";

  const morningParadeDec1 = activityRepo.create({
    title: "Morning Parade",
    description: "Standard unit morning parade and roll-call.",
    date: dec1,
    startAt: makeDateTime(dec1, "07:30"),
    endAt: makeDateTime(dec1, "08:00"),
    location: "Parade Square",
    createdByUserId: admin.id,
  });

  const eveningPTDec3 = activityRepo.create({
    title: "Evening PT Session",
    description: "Strength and conditioning training.",
    date: dec3,
    startAt: makeDateTime(dec3, "18:00"),
    endAt: makeDateTime(dec3, "19:30"),
    location: "Gym / Track",
    createdByUserId: admin.id,
  });

  const ipptPrepDec5 = activityRepo.create({
    title: "IPPT Prep Run",
    description: "2.4km and stations rehearsal.",
    date: dec5,
    startAt: makeDateTime(dec5, "16:00"),
    endAt: makeDateTime(dec5, "17:30"),
    location: "Unit Track",
    createdByUserId: alice.id, // created by member
  });

  const weekendDutyDec7 = activityRepo.create({
    title: "Weekend Duty",
    description: "Weekend camp duty.",
    date: dec7,
    startAt: makeDateTime(dec7, "08:00"),
    endAt: makeDateTime(dec7, "20:00"),
    location: "Guardroom",
    createdByUserId: alice.id, // created by member
  });

  const morningParadeDec12 = activityRepo.create({
    title: "Morning Parade",
    description: "Weekly parade with announcements.",
    date: dec12,
    startAt: makeDateTime(dec12, "07:30"),
    endAt: makeDateTime(dec12, "08:15"),
    location: "Parade Square",
    createdByUserId: admin.id,
  });

  const cohesionDec18 = activityRepo.create({
    title: "Year-End Unit Cohesion",
    description: "Games, food and team bonding session.",
    date: dec18,
    startAt: makeDateTime(dec18, "14:00"),
    endAt: makeDateTime(dec18, "18:00"),
    location: "Multi-purpose Hall",
    createdByUserId: admin.id,
  });

  const adminBriefDec19 = activityRepo.create({
    title: "Admin Briefing",
    description: "Training admin and attendance policy briefing.",
    date: dec19,
    startAt: makeDateTime(dec19, "09:00"),
    endAt: makeDateTime(dec19, "10:30"),
    location: "Conference Room",
    createdByUserId: admin.id,
  });

  const standbyDec22 = activityRepo.create({
    title: "Standby Duty",
    description: "Pre-festive season standby.",
    date: dec22,
    startAt: makeDateTime(dec22, "08:00"),
    endAt: makeDateTime(dec22, "18:00"),
    location: "Ops Room",
    createdByUserId: admin.id,
  });

  const upcomingParadeDec29 = activityRepo.create({
    title: "Final Parade of the Year",
    description: "Last parade of 2025 – attendance still open.",
    date: dec29,
    startAt: makeDateTime(dec29, "07:30"),
    endAt: makeDateTime(dec29, "08:15"),
    location: "Parade Square",
    createdByUserId: admin.id,
  });

  const activities = await activityRepo.save([
    morningParadeDec1,
    eveningPTDec3,
    ipptPrepDec5,
    weekendDutyDec7,
    morningParadeDec12,
    cohesionDec18,
    adminBriefDec19,
    standbyDec22,
    upcomingParadeDec29,
  ]);

  console.log(
    "✅ Activities seeded:",
    activities.map((a) => `${a.date} – ${a.title}`)
  );

  console.log("🌱 Seeding attendance...");

  const [savedAdmin, savedAlice, savedBob] = users;
  const [
    savedMorningParadeDec1,
    savedEveningPTDec3,
    savedIpptPrepDec5,
    savedWeekendDutyDec7,
    savedMorningParadeDec12,
    savedCohesionDec18,
    savedAdminBriefDec19,
    savedStandbyDec22,
  ] = activities;

  const attendanceRecords = await attendanceRepo.save([
    // 1 Dec – Morning Parade
    attendanceRepo.create({
      activityId: savedMorningParadeDec1.id,
      userId: savedAdmin.id,
      status: "present",
      remarks: "Parade IC",
      checkedInAt: savedMorningParadeDec1.startAt,
    }),
    attendanceRepo.create({
      activityId: savedMorningParadeDec1.id,
      userId: savedAlice.id,
      status: "present",
      checkedInAt: savedMorningParadeDec1.startAt,
    }),
    attendanceRepo.create({
      activityId: savedMorningParadeDec1.id,
      userId: savedBob.id,
      status: "late",
      remarks: "5 mins late",
      checkedInAt: morningParadeDec1.startAt,
    }),

    // 3 Dec – Evening PT
    attendanceRepo.create({
      activityId: savedEveningPTDec3.id,
      userId: savedAdmin.id,
      status: "present",
      remarks: "Oversaw PT",
      checkedInAt: savedEveningPTDec3.startAt,
    }),
    attendanceRepo.create({
      activityId: savedEveningPTDec3.id,
      userId: savedAlice.id,
      status: "absent",
      remarks: "On medical leave",
    }),
    attendanceRepo.create({
      activityId: savedEveningPTDec3.id,
      userId: savedBob.id,
      status: "present",
      checkedInAt: savedEveningPTDec3.startAt,
    }),

    // 5 Dec – IPPT Prep (created by Alice)
    attendanceRepo.create({
      activityId: savedIpptPrepDec5.id,
      userId: savedAlice.id,
      status: "present",
      remarks: "Participant",
      checkedInAt: savedIpptPrepDec5.startAt,
    }),
    attendanceRepo.create({
      activityId: savedIpptPrepDec5.id,
      userId: savedBob.id,
      status: "excused",
      remarks: "Excused from running",
    }),
    // Admin did not attend → no record for admin here

    // 7 Dec – Weekend Duty (created by alice)
    attendanceRepo.create({
      activityId: savedWeekendDutyDec7.id,
      userId: savedBob.id,
      status: "present",
      remarks: "Duty IC",
      checkedInAt: savedWeekendDutyDec7.startAt,
    }),
    attendanceRepo.create({
      activityId: savedWeekendDutyDec7.id,
      userId: savedAdmin.id,
      status: "present",
      remarks: "RO duty check",
      checkedInAt: savedWeekendDutyDec7.startAt,
    }),
    // Alice off – no record

    // 12 Dec – Morning Parade
    attendanceRepo.create({
      activityId: savedMorningParadeDec12.id,
      userId: savedAdmin.id,
      status: "present",
      checkedInAt: savedMorningParadeDec12.startAt,
    }),
    attendanceRepo.create({
      activityId: savedMorningParadeDec12.id,
      userId: savedAlice.id,
      status: "present",
      checkedInAt: savedMorningParadeDec12.startAt,
    }),
    attendanceRepo.create({
      activityId: savedMorningParadeDec12.id,
      userId: savedBob.id,
      status: "present",
      checkedInAt: savedMorningParadeDec12.startAt,
    }),

    // 18 Dec – Cohesion (everyone mostly comes)
    attendanceRepo.create({
      activityId: savedCohesionDec18.id,
      userId: savedAdmin.id,
      status: "present",
      checkedInAt: savedCohesionDec18.startAt,
    }),
    attendanceRepo.create({
      activityId: savedCohesionDec18.id,
      userId: savedAlice.id,
      status: "present",
      checkedInAt: savedCohesionDec18.startAt,
    }),
    attendanceRepo.create({
      activityId: savedCohesionDec18.id,
      userId: savedBob.id,
      status: "present",
      checkedInAt: savedCohesionDec18.startAt,
    }),

    // 19 Dec – Admin Brief (Alice & Bob attend, admin present)
    attendanceRepo.create({
      activityId: savedAdminBriefDec19.id,
      userId: savedAdmin.id,
      status: "present",
      checkedInAt: savedAdminBriefDec19.startAt,
    }),
    attendanceRepo.create({
      activityId: savedAdminBriefDec19.id,
      userId: savedAlice.id,
      status: "present",
      checkedInAt: savedAdminBriefDec19.startAt,
    }),
    attendanceRepo.create({
      activityId: savedAdminBriefDec19.id,
      userId: savedBob.id,
      status: "present",
      checkedInAt: savedAdminBriefDec19.startAt,
    }),

    // 22 Dec – Standby Duty (only admin + Bob)
    attendanceRepo.create({
      activityId: savedStandbyDec22.id,
      userId: savedAdmin.id,
      status: "present",
      checkedInAt: savedStandbyDec22.startAt,
    }),
    attendanceRepo.create({
      activityId: savedStandbyDec22.id,
      userId: savedBob.id,
      status: "present",
      checkedInAt: savedStandbyDec22.startAt,
    }),
    // Alice on leave – no record
  ]);

  console.log("✅ Attendance seeded:", attendanceRecords.length, "records");

  await appContext.close();
  console.log("🌟 Seeding complete.");
}

bootstrap().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
