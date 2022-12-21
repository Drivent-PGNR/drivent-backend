import activityRepository from "@/repositories/activity-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getActivities() {
  const activities = await activityRepository.findActivities();
  return activities;
}

async function connectTicketToActivity(userId: number, activityId: number) {
  const ticket = await ticketRepository.findTicketByUserId(userId);
  const conn = await activityRepository.connectTicketToActivity(ticket.id, activityId);
  return conn;
}

const activityService = {
  getActivities,
  connectTicketToActivity
};

export default activityService;
