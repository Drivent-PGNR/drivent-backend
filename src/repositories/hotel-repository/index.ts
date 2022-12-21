import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany({
    include: {
      Rooms: {
        select: {
          capacity: true,
          Booking: {
            select: {
              id: true,
            }
          },
        }
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
      Rooms: true,
    }
  });
}

const hotelRepository = {
  findHotels,
  findRoomsByHotelId,
};

export default hotelRepository;
