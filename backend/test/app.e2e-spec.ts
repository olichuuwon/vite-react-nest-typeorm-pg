import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { User } from "../src/user/user.entity";
import { Activity } from "../src/activity/activity.entity";
import { AttendanceRecord } from "../src/attendance/attendance.entity";

describe("App e2e", () => {
  let app: INestApplication;
  let httpServer: any;

  let userRepo: Repository<User>;
  let activityRepo: Repository<Activity>;
  let attendanceRepo: Repository<AttendanceRecord>;

  let adminUser: User;
  let seededActivity: Activity;
  let seededAttendance: AttendanceRecord;

  let token: string;

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

    // Clear existing data (order matters because of FKs)
    await attendanceRepo
      .createQueryBuilder()
      .delete()
      .from(AttendanceRecord)
      .execute();
    await activityRepo.createQueryBuilder().delete().from(Activity).execute();
    await userRepo.createQueryBuilder().delete().from(User).execute();

    // Seed admin user
    adminUser = await userRepo.save(
      userRepo.create({
        name: "Admin User",
        identifier: "admin",
        role: "admin",
      })
    );

    // Seed one activity
    seededActivity = await activityRepo.save(
      activityRepo.create({
        title: "E2E Test Activity",
        description: "Activity used in e2e tests",
        location: "HQ",
        createdByUserId: adminUser.id,
      })
    );

    // Seed one attendance record (admin attending that activity)
    seededAttendance = await attendanceRepo.save(
      attendanceRepo.create({
        activityId: seededActivity.id,
        userId: adminUser.id,
        status: "present",
        remarks: "Seeded attendance",
      })
    );

    // Login once for the suite
    const loginRes = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "admin" });

    expect([200, 201]).toContain(loginRes.status);
    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  const getWithAuth = (path: string) =>
    request(httpServer).get(path).set(authHeader());

  const postWithAuth = (path: string) =>
    request(httpServer).post(path).set(authHeader());

  const putWithAuth = (path: string) =>
    request(httpServer).put(path).set(authHeader());

  const deleteWithAuth = (path: string) =>
    request(httpServer).delete(path).set(authHeader());

  // Create a temporary activity to avoid colliding with seededAttendance
  async function createTempActivity(): Promise<Activity> {
    const res = await postWithAuth("/activities")
      .send({
        title: "Temp E2E Activity",
        description: "Temp activity for attendance tests",
        location: "HQ",
        createdByUserId: adminUser.id,
      })
      .expect([200, 201]);

    return res.body as Activity;
  }

  it("GET /users without auth should return 401", async () => {
    await request(httpServer).get("/users").expect(401);
  });

  it("POST /auth/login should return JWT for seeded admin", async () => {
    const res = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "admin" });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.identifier).toBe("admin");
  });

  it("GET /users with valid JWT should return array including admin", async () => {
    const res = await getWithAuth("/users").expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: User) => u.identifier === "admin")).toBe(true);
  });

  it("GET /activities with JWT should return seeded activity", async () => {
    const res = await getWithAuth("/activities").expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some((a: Activity) => a.id === seededActivity.id)).toBe(
      true
    );
  });

  it("GET /attendance with JWT should return seeded attendance", async () => {
    const res = await getWithAuth("/attendance").expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some(
        (r: AttendanceRecord) =>
          r.id === seededAttendance.id &&
          r.activityId === seededActivity.id &&
          r.userId === adminUser.id
      )
    ).toBe(true);
  });

  it("GET /attendance/activity/:activityId should return records for that activity", async () => {
    const res = await getWithAuth(
      `/attendance/activity/${seededActivity.id}`
    ).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some(
        (r: AttendanceRecord) =>
          r.activityId === seededActivity.id && r.userId === adminUser.id
      )
    ).toBe(true);
  });

  it("GET /attendance/user/:userId should return records for that user", async () => {
    const res = await getWithAuth(`/attendance/user/${adminUser.id}`).expect(
      200
    );

    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some(
        (r: AttendanceRecord) =>
          r.activityId === seededActivity.id && r.userId === adminUser.id
      )
    ).toBe(true);
  });

  it("POST /attendance should create record linked to user + activity", async () => {
    const tempActivity = await createTempActivity();

    const res = await postWithAuth("/attendance")
      .send({
        userId: adminUser.id,
        activityId: tempActivity.id,
        status: "present",
        remarks: "Created via e2e",
      })
      .expect([200, 201]);

    expect(res.body.userId).toBe(adminUser.id);
    expect(res.body.activityId).toBe(tempActivity.id);
  });

  it("POST /attendance should return 404 for non-existent user", async () => {
    const res = await postWithAuth("/attendance").send({
      userId: "00000000-0000-0000-0000-000000000000",
      activityId: seededActivity.id,
      status: "present",
    });

    expect(res.status).toBe(404);
  });

  it("POST /attendance should return 404 for non-existent activity", async () => {
    const res = await postWithAuth("/attendance").send({
      userId: adminUser.id,
      activityId: "00000000-0000-0000-0000-000000000000",
      status: "present",
    });

    expect(res.status).toBe(404);
  });

  // if you enforce unique(activityId, userId)
  it("POST /attendance should reject duplicate attendance for same user + activity", async () => {
    const tempActivity = await createTempActivity();

    // first create
    await postWithAuth("/attendance")
      .send({
        userId: adminUser.id,
        activityId: tempActivity.id,
        status: "present",
      })
      .expect([200, 201]);

    // second create same pair
    const res = await postWithAuth("/attendance").send({
      userId: adminUser.id,
      activityId: tempActivity.id,
      status: "present",
    });

    expect([400, 409]).toContain(res.status);
  });

  it("PUT /attendance/:id should update status and remarks", async () => {
    const tempActivity = await createTempActivity();

    const createRes = await postWithAuth("/attendance")
      .send({
        userId: adminUser.id,
        activityId: tempActivity.id,
        status: "present",
        remarks: "Initial",
      })
      .expect([200, 201]);

    const id = createRes.body.id;

    const updateRes = await putWithAuth(`/attendance/${id}`).send({
      status: "late",
      remarks: "Arrived late",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("late");
    expect(updateRes.body.remarks).toBe("Arrived late");
  });

  it("DELETE /attendance/:id should remove record", async () => {
    const tempActivity = await createTempActivity();

    const createRes = await postWithAuth("/attendance")
      .send({
        userId: adminUser.id,
        activityId: tempActivity.id,
        status: "present",
      })
      .expect([200, 201]);

    const id = createRes.body.id;

    await deleteWithAuth(`/attendance/${id}`).expect(200);

    const getRes = await getWithAuth(`/attendance/${id}`);
    expect(getRes.status).toBe(404);
  });
});
