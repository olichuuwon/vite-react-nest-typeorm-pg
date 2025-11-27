import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { User } from "../src/user/user.entity";
import { Activity } from "../src/activity/activity.entity";
import { AttendanceRecord } from "../src/attendance/attendance.entity";

describe("Users CRUD e2e", () => {
  let app: INestApplication;
  let httpServer: any;

  let userRepo: Repository<User>;
  let activityRepo: Repository<Activity>;
  let attendanceRepo: Repository<AttendanceRecord>;

  let adminUser: User;
  let adminToken: string;
  let createdUserId: string;

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

    // FK-safe cleanup: attendance → activities → users
    await attendanceRepo
      .createQueryBuilder()
      .delete()
      .from(AttendanceRecord)
      .execute();

    await activityRepo.createQueryBuilder().delete().from(Activity).execute();

    await userRepo.createQueryBuilder().delete().from(User).execute();

    // Seed admin
    adminUser = await userRepo.save(
      userRepo.create({
        name: "Admin User",
        identifier: "admin",
        role: "admin",
      })
    );

    // Log in as admin
    const loginRes = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "admin" })
      .expect([200, 201]);

    adminToken = loginRes.body.accessToken;
    expect(typeof adminToken).toBe("string");
    expect(adminToken.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /users should create a new user (admin only)", async () => {
    const res = await request(httpServer)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Member One",
        identifier: "member1",
        email: "member1@example.com",
        role: "member",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.identifier).toBe("member1");
    createdUserId = res.body.id;
  });

  it("GET /users/:id should fetch the created user", async () => {
    const res = await request(httpServer)
      .get(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(createdUserId);
    expect(res.body.identifier).toBe("member1");
  });

  it("PUT /users/:id should update name and role", async () => {
    const res = await request(httpServer)
      .put(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Member One Updated", role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Member One Updated");
    expect(res.body.role).toBe("admin");
  });

  it("DELETE /users/:id should delete the user", async () => {
    const res = await request(httpServer)
      .delete(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("GET /users/:id after delete should return 404", async () => {
    const res = await request(httpServer)
      .get(`/users/${createdUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("POST /users with duplicate identifier should fail", async () => {
    // First creation
    await request(httpServer)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "User A",
        identifier: "dup-user",
        email: "a@example.com",
        role: "member",
      })
      .expect(201);

    // Second (duplicate) creation
    const res = await request(httpServer)
      .post("/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "User B",
        identifier: "dup-user",
        email: "b@example.com",
        role: "member",
      });

    // Raw 500 from Postgres, can wrap 23505 as ConflictException
    expect([400, 409, 500]).toContain(res.status);
  });
});
