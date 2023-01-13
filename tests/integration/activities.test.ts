import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createTicketTypeWithoutHotel,
  activityToTicket,
  createActivity
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("POST /activities/:activityId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/activities/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/activities/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/activities/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      await createTicketTypeRemote();

      const response = await server.post("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user has no ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.post("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 402 when there is no payment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.post("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 when ticket has hotel, but not booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/activities/1").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 409 when user has other activity at the same time", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const activity = await createActivity();
      await activityToTicket(ticket.id, activity.id);

      const response = await server.post(`/activities/${activity.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.CONFLICT);
    });

    it("should respond with status 404 when the activityId doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/activities/0").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 201", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const activity = await createActivity();

      const response = await server.post(`/activities/${activity.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.CREATED);
    });
  });
});

describe("GET /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 201", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const activity = await createActivity();

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);

      expect(response.body).toEqual([{
        id: activity.id,
        name: activity.name,
        capacity: activity.capacity,
        startsAt: activity.startsAt.toISOString(),
        endsAt: activity.endsAt.toISOString(),
        buildingId: activity.buildingId,
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString(),
        Building: {
          id: activity.buildingId,
          name: activity.Building.name,
          createdAt: activity.Building.createdAt.toISOString(),
          updatedAt: activity.Building.updatedAt.toISOString()
        },
        _count: {
          Ticket: activity._count.Ticket
        }
      }]);
    });
  });
});

describe("GET /activities/dayActivities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 201", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const activity = await createActivity();

      const response = await server.get("/activities/dayActivities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);

      expect(response.body).toEqual([activity.startsAt.toLocaleDateString()]);
    });
  });
});

describe("GET /activities/:eventDay", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/activities/" + Date.now());

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/activities/" + Date.now()).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/activities/" + Date.now()).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 if param is not a valid date format", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      await createActivity();

      const response = await server.get("/activities/:abc").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 201", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const activity = await createActivity();
      const date = activity.startsAt.getTime();

      const response = await server.get("/activities/" + date).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);

      expect(response.body).toEqual([
        {
          id: activity.id,
          name: activity.name,
          capacity: activity.capacity,
          startsAt: activity.startsAt.toISOString(),
          endsAt: activity.endsAt.toISOString(),
          buildingId: activity.buildingId,
          createdAt: activity.createdAt.toISOString(),
          updatedAt: activity.updatedAt.toISOString(),
          _count: {
            Ticket: activity._count.Ticket
          },
          Ticket: activity.Ticket,
          Building: {
            id: activity.Building.id,
            name: activity.Building.name,
            createdAt: activity.Building.createdAt.toISOString(),
            updatedAt: activity.Building.updatedAt.toISOString()
          }
        }
      ]);
    });
  });
});
