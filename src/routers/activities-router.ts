/* import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { connectTicketToActivity, getActivities } from "@/controllers";

const activitiesRouter = Router();

activitiesRouter
  .all("/*", authenticateToken)
  .get("/", getActivities)
  .post("/:activityId/enroll", connectTicketToActivity);

export { activitiesRouter };
 */
