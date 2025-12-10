import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { User } from "../src/user/user.entity";
import { Activity } from "../src/activity/activity.entity";
import { AttendanceRecord } from "../src/attendance/attendance.entity";

describe("Activities CRUD e2e", () => {
  let app: INestApplication;
  let httpServer: any;
  let userRepo: Repository<User>;
  let activityRepo: Repository<Activity>;
  let attendanceRepo: Repository<AttendanceRecord>;

  let adminToken: string;
  let adminUser: User;
  let activityId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer();

    userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    activityRepo = app.get<Repository<Activity>>(getRepositoryToken(Activity));
    attendanceRepo = app.get<Repository<AttendanceRecord>>(
      getRepositoryToken(AttendanceRecord)
    );

    await attendanceRepo
      .createQueryBuilder()
      .delete()
      .from(AttendanceRecord)
      .execute();
    await activityRepo.createQueryBuilder().delete().from(Activity).execute();
    await userRepo.createQueryBuilder().delete().from(User).execute();

    adminUser = await userRepo.save(
      userRepo.create({
        name: "Admin User",
        identifier: "admin",
        role: "admin",
      })
    );

    const loginRes = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "admin" });
    adminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /activities should create an activity", async () => {
    const res = await request(httpServer)
      .post("/activities")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Morning PT",
        description: "Unit physical training",
        location: "Parade Square",
        date: "2025-01-01",
        startAt: "2025-01-01T07:30:00.000Z",
        endAt: "2025-01-01T09:00:00.000Z",
        createdByUserId: adminUser.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    activityId = res.body.id;
  });

  it("GET /activities/:id should return that activity", async () => {
    const res = await request(httpServer)
      .get(`/activities/${activityId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(activityId);
    expect(res.body.title).toBe("Morning PT");
  });

  it("PATCH /activities/:id should update fields", async () => {
    const res = await request(httpServer)
      .patch(`/activities/${activityId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Morning PT (Updated)", location: "Gym" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Morning PT (Updated)");
    expect(res.body.location).toBe("Gym");
  });

  it("DELETE /activities/:id should fail if activity has attendance", async () => {
    // Seed 1 attendance to link it
    await attendanceRepo.save(
      attendanceRepo.create({
        activityId,
        userId: adminUser.id,
        status: "present",
        remarks: "Test attendance",
      })
    );

    const res = await request(httpServer)
      .delete(`/activities/${activityId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect([400, 409]).toContain(res.status);
  });
});
