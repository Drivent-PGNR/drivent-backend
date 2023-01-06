import { prisma } from "@/config";
import { } from "@prisma/client";

async function findActivities() {
  return prisma.activity.findMany({
    include: {
      _count: {
        select: {
          Ticket: true
        }
      },
      Building: true
    }
  });
}

async function findActivityById(id: number) {
  return prisma.activity.findFirst({
    where: { id },
    include: {
      _count: {
        select: {
          Ticket: true
        }
      },
      Building: true
    }
  });
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

async function findDayActivities() {
  return prisma.activity.findMany({
    select: {    
      startsAt: true,
    }
     
  });
}

const activityRepository = {
  findActivities,
  findActivityById,
  connectTicketToActivity,
  findDayActivities
};

export default activityRepository;
