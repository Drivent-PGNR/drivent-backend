import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

async function main() {
  let event = await prisma.event.findFirst();
  if (!event) {
    event = await prisma.event.create({
      data: {
        title: "Driven.t",
        logoImageUrl: "https://files.driveneducation.com.br/images/logo-rounded.png",
        backgroundImageUrl: "linear-gradient(to right, #FA4098, #FFD77F)",
        startsAt: dayjs().toDate(),
        endsAt: dayjs().add(21, "days").toDate(),
      },
    });
    console.log({ event })
  }

  const ticketTypes = await prisma.ticketType.findMany()
  if (ticketTypes.length !== 3) {
    await prisma.ticketType.deleteMany({})
    await prisma.ticketType.createMany({
      data: [
        { name: 'Online', includesHotel: false, isRemote: true, price: 100 },
        { name: 'Presencial sem Hotel', includesHotel: false, isRemote: false, price: 250 },
        { name: 'Presencial com Hotel', includesHotel: true, isRemote: false, price: 600 },
      ]
    })
  }

  const hotels = await prisma.hotel.findMany()
  if (hotels.length !== 3) {
    await prisma.room.deleteMany({})
    await prisma.hotel.deleteMany({})
    await prisma.hotel.createMany({
      data: [
        { name: 'Driven Resort', image: 'https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg' },
        { name: 'Driven Palace', image: 'https://media.radissonhotels.net/image/metropolitan-hotel-sofia-a-member-of-radisson-individuals/exteriorview/16256-145921-f72742573_3xl.jpg' },
        { name: 'Driven World', image: 'http://www.radiohotel.com.br/assets/img/radio.jpg' }
      ]
    })
    const hotels = await prisma.hotel.findMany()
    for (const hotel of hotels) {
      await prisma.room.createMany({
        data: [
          { name: '101', capacity: 1, hotelId: hotel.id },
          { name: '102', capacity: 2, hotelId: hotel.id },
          { name: '103', capacity: 3, hotelId: hotel.id }
        ]
      })
    }
  }

  const buildings = await prisma.building.findMany()
  if (buildings.length === 0) {
    await prisma.building.createMany({
      data: [
        { name: 'Auditório Principal' },
        { name: 'Auditório Lateral' },
        { name: 'Sala de Workshop' }
      ]
    })
  }

  const activities = await prisma.activity.findMany()
  if (activities.length === 0) {
    const buildings = await prisma.building.findMany()
    await prisma.activity.createMany({
      data: [
        { buildingId: buildings[0].id, capacity: 20, name: "Minecraft: Montando o PC Ideal", startsAt: new Date("22 January 2023 09:00 UTC"), endsAt: new Date("22 January 2023 10:00 UTC") },
        { buildingId: buildings[0].id, capacity: 10, name: "Palestra Clean Code", startsAt: new Date("22 January 2023 10:00 UTC"), endsAt: new Date("22 January 2023 11:00 UTC") },
        { buildingId: buildings[1].id, capacity: 100, name: "Shark Tank: Drivent!", startsAt: new Date("23 January 2023 09:00 UTC"), endsAt: new Date("23 January 2023 10:30 UTC") },
      ]
    })
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
