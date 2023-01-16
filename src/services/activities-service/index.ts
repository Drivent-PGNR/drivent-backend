import { notFoundError, forbiddenError, conflictError, paymentRequiredError } from "@/errors";
import activityRepository from "@/repositories/activity-repository";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getActivities() {
  if (await existCache("activities")) {
    const activities = await activityRepository.findActivitiesCache("activities");
    return JSON.parse(activities);
  }

  const activities = await activityRepository.findActivities();
  await activityRepository.insertActivitiesCache("activities", activities);

  return activities;
}

async function getActivitiesByDay(day: string) {
  const eventDate = new Date(+day);

  if (await existCache(day)) {
    const activities = await activityRepository.findActivitiesCache(day);
    return JSON.parse(activities);
  }

  const activities = await activityRepository.findActivitiesByDay(eventDate);
  await activityRepository.insertActivitiesCache(day, activities);

  return activities;
}

async function checkEnrollmentTicketAndBooking(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket) {
    throw notFoundError();
  }
  
  if (ticket.TicketType.isRemote) {
    throw forbiddenError();
  }

  if (ticket.status === "RESERVED") {
    throw paymentRequiredError();
  }

  if (ticket.TicketType.includesHotel) {
    const booking = await bookingRepository.findByUserId(userId);
    
    if (!booking) {
      throw notFoundError();
    }
  }

  return ticket;
}

async function connectTicketToActivity(userId: number, activityId: number) {
  const ticket = await checkEnrollmentTicketAndBooking(userId);

  const activity = await activityRepository.findActivityById(activityId);
  if (!activity) {
    throw notFoundError();
  }

  if (activity.capacity === activity._count.Ticket) {
    throw forbiddenError();
  }

  const userActivities = await activityRepository.findUserActivities(ticket.id);
  const activityDay = activity.startsAt.getDate();
  const activityMonth = activity.startsAt.getMonth() + 1;
  const activityYear = activity.startsAt.getFullYear();

  const timeConflict = userActivities.some(element => {
    const day = element.startsAt.getDate();
    const month = element.startsAt.getMonth() + 1;
    const year = element.startsAt.getFullYear();
    const start = element.startsAt.getHours() * 60 + element.startsAt.getMinutes();
    const end = element.endsAt.getHours() * 60 + element.endsAt.getMinutes();
    const activityStart = activity.startsAt.getHours() * 60 + activity.startsAt.getMinutes();
    const activityEnd = activity.endsAt.getHours() * 60 + activity.endsAt.getMinutes();
    if (day === activityDay && month === activityMonth && year === activityYear) {
      if ((start <= activityStart && activityStart < end) || (start < activityEnd && activityEnd < end) || (start > activityStart && end < activityEnd)) {
        return true;
      }
    }
  });

  if (timeConflict) {
    throw conflictError("Time conflict");
  }

  const date = Date.parse(`${activityMonth}/${activityDay}/${activityYear}`).toString();

  await activityRepository.deleteCache(date);
  await activityRepository.deleteCache("activities");

  return activityRepository.connectTicketToActivity(ticket.id, activityId);
}

async function getDayActivity() {
  if (await existCache("days_activity")) {
    return activityRepository.findActivitiesCache("days_activity");
  }

  const activities = await activityRepository.findDayActivities();
  const aux: string[]=[];
  activities.forEach((activity) => {
    if(!aux.includes(activity.startsAt.toLocaleDateString())) {
      aux.push(activity.startsAt.toLocaleDateString());
    }
  });

  await activityRepository.insertActivitiesCache("days_activity", aux);
  return aux;
}

async function existCache(name: string) {
  if (await activityRepository.existActivitiesCache(name)) {
    return true;
  }
}

const activityService = {
  getActivities,
  getActivitiesByDay,
  connectTicketToActivity,
  getDayActivity
};

export default activityService;
