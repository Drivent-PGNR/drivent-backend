import { prisma } from "@/config";
import { } from "@prisma/client";

async function findActivities() {
  return prisma.activity.findMany();
}

const activityRepository = {
  findActivities
};

export default activityRepository;
