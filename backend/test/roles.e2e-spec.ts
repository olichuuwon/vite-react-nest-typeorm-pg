import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import request from "supertest";

import { AppModule } from "../src/app.module";
import { User } from "../src/user/user.entity";
import { Activity } from "../src/activity/activity.entity";

describe("Role-based access e2e", () => {
  let app: INestApplication;
  let httpServer: any;
  let userRepo: Repository<User>;
  let activityRepo: Repository<Activity>;

  let adminUser: User;
  let memberUser: User;
  let activity: Activity;

  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    httpServer = app.getHttpServer();
    userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    activityRepo = app.get<Repository<Activity>>(getRepositoryToken(Activity));

    await activityRepo.createQueryBuilder().delete().from(Activity).execute();
    await userRepo.createQueryBuilder().delete().from(User).execute();

    adminUser = await userRepo.save(
      userRepo.create({
        name: "Admin User",
        identifier: "admin",
        role: "admin",
      })
    );

    memberUser = await userRepo.save(
      userRepo.create({
        name: "Member User",
        identifier: "member",
        role: "member",
      })
    );

    activity = await activityRepo.save(
      activityRepo.create({
        title: "Role Test Activity",
        location: "HQ",
        createdByUserId: adminUser.id,
      })
    );

    const adminLogin = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "admin" });
    adminToken = adminLogin.body.accessToken;

    const memberLogin = await request(httpServer)
      .post("/auth/login")
      .send({ identifier: "member" });
    memberToken = memberLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it("member should NOT be able to create users", async () => {
    const res = await request(httpServer)
      .post("/users")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        name: "Hacker",
        identifier: "hacker",
        role: "admin",
      });

    expect([401, 403]).toContain(res.status);
  });

  it("member should NOT be able to create activities", async () => {
    const res = await request(httpServer)
      .post("/activities")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        title: "Illegal Activity",
        location: "Somewhere",
        createdByUserId: memberUser.id,
      });

    expect([401, 403]).toContain(res.status);
  });

  it("member should NOT be able to mark attendance for another user", async () => {
    const res = await request(httpServer)
      .post("/attendance")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        userId: adminUser.id, // try to mark admin's attendance
        activityId: activity.id,
        status: "present",
      });

    expect([401, 403]).toContain(res.status);
  });

  it("member SHOULD be able to mark their OWN attendance", async () => {
    const res = await request(httpServer)
      .post("/attendance")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        userId: memberUser.id,
        activityId: activity.id,
        status: "present",
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.userId).toBe(memberUser.id);
  });
});
