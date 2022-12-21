import { prisma } from "@/config";
import { } from "@prisma/client";

async function findActivities() {
  return prisma.activity.findMany({ include: { Building: true } });
}

async function connectTicketToActivity(ticketId: number, activityId: number) {
  return prisma.activity.update({
    where: { id: activityId },
    data: {
      Ticket: {
        connect: { id: ticketId }
      }
    }
  });
}

const activityRepository = {
  findActivities,
  connectTicketToActivity
};

export default activityRepository;
