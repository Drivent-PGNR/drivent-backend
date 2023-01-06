import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { connectTicketToActivity, getActivities, getActivitiesByDay, getDayActivities } from "@/controllers/activities-controller";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .get("/dayActivities", getDayActivities)
  .get("/:eventDay", getActivitiesByDay)
  .post("/:activityId", connectTicketToActivity);

export { activitiesRouter };
 
