import { AuthenticatedRequest } from "@/middlewares";
import activityService from "@/services/activities-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getActivities(req: AuthenticatedRequest, res: Response) {
  try {
    const activities = activityService.getActivities();

    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
