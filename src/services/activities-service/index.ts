import activityRepository from "@/repositories/activity-repository";

async function getActivities() {
  const activities = await activityRepository.findActivities();
  return activities;
}

const activityService = {
  getActivities
};

export default activityService;
