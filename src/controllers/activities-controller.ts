import { AuthenticatedRequest } from "@/middlewares";
import activityService from "@/services/activities-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getActivities(_req: AuthenticatedRequest, res: Response) {
  try {
    const activities = await activityService.getActivities();

    return res.status(httpStatus.OK).send(activities);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function connectTicketToActivity(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { activityId } = req.params;

  try {
    await activityService.connectTicketToActivity(userId, +activityId);

    return res.sendStatus(httpStatus.CREATED);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "ForbiddenError") {
      res.sendStatus(httpStatus.FORBIDDEN);
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
