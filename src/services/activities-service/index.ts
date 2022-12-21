import { notFoundError, forbiddenError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getActivities() {
  const activities = await activityRepository.findActivities();
  return activities;
}

async function connectTicketToActivity(userId: number, activityId: number) {
  const ticket = await ticketRepository.findTicketByUserId(userId);
  if (!ticket) {
    throw notFoundError();
  }

  const activity = await activityRepository.findActivityById(activityId);
  if (!activity) {
    throw notFoundError();
  }

  if (activity.capacity === activity._count.Ticket) {
    throw forbiddenError();
  }

  return activityRepository.connectTicketToActivity(ticket.id, activityId);
}

const activityService = {
  getActivities,
  connectTicketToActivity
};

export default activityService;
