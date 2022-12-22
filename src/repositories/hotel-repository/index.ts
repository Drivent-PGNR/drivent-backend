import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany({
    include: {
      Rooms: {
        select: {
          id: true,
          name: true,
          hotelId: true,
          capacity: true,
          createdAt: true,
          updatedAt: true,
          Booking: true,
        },
      }
    }
  });
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: {
        select: {
          id: true,
          name: true,
          hotelId: true,
          capacity: true,
          createdAt: true,
          updatedAt: true,
          Booking: true,
        }
      },
    }
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
};

export default hotelRepository;
