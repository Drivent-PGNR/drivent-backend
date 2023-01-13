import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createActivity() {
  const building = await prisma.building.create({
    data: { name: faker.name.findName() },
  });

  return prisma.activity.create({
    data: {
      buildingId: building.id,
      capacity: 10,
      name: faker.name.findName(),
      startsAt: new Date(),
      endsAt: new Date((new Date()).getHours() + 1),
    },
    include: {
      Building: true,
      _count: {
        select: {
          Ticket: true
        }
      },
      Ticket: true
    }
  });
}

export async function activityToTicket(ticketId: number, activityId: number) {
  return prisma.activity.update({
    where: { id: activityId },
    data: {
      Ticket: {
        connect: { id: ticketId }
      }
    }
  });
}
