import { notFoundError, forbiddenError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getActivities() {
  return activityRepository.findActivities();
}

async function getActivitiesByDay(day: number) {
  const eventDate = new Date(day);

  return activityRepository.findActivitiesByDay(eventDate);
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

async function getDayActivity() {
  const activities = await activityRepository.findDayActivities();
  const aux: string[]=[];

  activities.forEach((activity) => {
    if(!aux.includes(activity.startsAt.toLocaleDateString())) {
      aux.push(activity.startsAt.toLocaleDateString());
    }
  });
  return aux;
}

const activityService = {
  getActivities,
  getActivitiesByDay,
  connectTicketToActivity,
  getDayActivity
};

export default activityService;

