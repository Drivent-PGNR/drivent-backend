import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { connectTicketToActivity, getActivities, getActivitiesByDay } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .get("/:eventDay", getActivitiesByDay)
  .post("/:activityId/enroll", connectTicketToActivity);

export { activitiesRouter };
