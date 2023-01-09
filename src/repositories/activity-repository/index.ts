import { prisma } from "@/config";

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

async function findActivitiesByDay(currentDay: Date) {
  const nextDay = new Date(currentDay.getTime() + 1000 * 60 * 60 * 24);

  return prisma.activity.findMany({
    where: {
      startsAt: {
        gte: currentDay,
        lt: nextDay,
      }
    },
    include: {
      _count: {
        select: {
          Ticket: true
        }
      },
      Ticket: {
        include: {
          Enrollment: true
        }
      },
      Building: true
    },
    orderBy: {
      startsAt: "asc"
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
    },
    orderBy: {
      startsAt: "asc"
    }
  });
}

async function findUserActivities(ticketId: number) {
  return prisma.activity.findMany({
    where: {
      Ticket: {
        some: {
          id: ticketId,
        }
      }
    }
  });
}

const activityRepository = {
  findActivities,
  findActivityById,
  findActivitiesByDay,
  connectTicketToActivity,
  findDayActivities,
  findUserActivities,
};

export default activityRepository;
