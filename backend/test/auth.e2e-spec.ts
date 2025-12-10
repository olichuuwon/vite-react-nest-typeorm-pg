import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { User } from "../src/user/user.entity";
import { Activity } from "../src/activity/activity.entity";
import { AttendanceRecord } from "../src/attendance/attendance.entity";

describe("Auth e2e", () => {
  let app: INestApplication;
  let httpServer: any;

  let userRepo: Repository<User>;
  let activityRepo: Repository<Activity>;
  let attendanceRepo: Repository<AttendanceRecord>;

  let adminUser: User;
  let adminToken: string;

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

    // FK-safe order: attendance → activities → users
    await attendanceRepo
      .createQueryBuilder()
      .delete()
      .from(AttendanceRecord)
      .execute();

    await activityRepo.createQueryBuilder().delete().from(Activity).execute();

    await userRepo.createQueryBuilder().delete().from(User).execute();

    // Seed admin user
    await userRepo.save(
      userRepo.create({
        name: "Admin User",
        identifier: "admin",
        role: "admin",
      })
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /auth/login should reject unknown identifier", async () => {
    const res = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "does-not-exist" });

    expect(res.status).toBe(401);
  });

  it("POST /auth/login should issue JWT for valid user", async () => {
    const res = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "admin" });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user.identifier).toBe("admin");

    adminToken = res.body.accessToken;
    expect(typeof adminToken).toBe("string");
    expect(adminToken.length).toBeGreaterThan(0);
  });

  it("GET /users without Authorization header should return 401", async () => {
    const res = await request(httpServer).get("/users");
    expect(res.status).toBe(401);
  });

  it("GET /users with malformed token should return 401", async () => {
    const res = await request(httpServer)
      .get("/users")
      .set("Authorization", "Bearer not-a-real-token");

    expect(res.status).toBe(401);
  });

  it("GET /users with valid token should return 200", async () => {
    const res = await request(httpServer)
      .get("/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
