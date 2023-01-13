import { prisma } from "@/config";
import { Enrollment, Address } from "@prisma/client";

async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function findById(enrollmentId: number) {
  return prisma.enrollment.findFirst({
    where: { userId: enrollmentId }
  });
}

async function upsert(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
  enrollmentId: number, 
  createdAddress: CreateAddressParams, 
  updatedAddress: UpdateAddressParams,
) {
  console.log(userId);
  console.log(createdEnrollment);
  console.log(updatedEnrollment);
  console.log(enrollmentId);
  console.log(createdAddress);
  console.log(updatedAddress);

  const userUpdate = prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: createdEnrollment,
    update: updatedEnrollment,
  });
  
  const adressUpdate = prisma.address.upsert({
    where: {
      enrollmentId,
    },
    create: {
      ...createdAddress,
      Enrollment: { connect: { id: enrollmentId } },
    },
    update: updatedAddress,
  });

  return await prisma.$transaction([userUpdate, adressUpdate]);
}

export type CreateEnrollmentParams = Omit<Enrollment, "id" | "createdAt" | "updatedAt">;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, "userId">;
export type CreateAddressParams = Omit<Address, "id" | "createdAt" | "updatedAt" | "enrollmentId">;
export type UpdateAddressParams = CreateAddressParams;

const enrollmentRepository = {
  findWithAddressByUserId,
  upsert,
  findById,
};

export default enrollmentRepository;
