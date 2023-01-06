import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { connectTicketToActivity, getActivities, getDayActivities } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .get("/dayActivities", getDayActivities)
  .post("/:activityId/enroll", connectTicketToActivity);

export { activitiesRouter };
