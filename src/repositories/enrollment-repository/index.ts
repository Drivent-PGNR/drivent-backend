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

async function findById(id: number) {
  return prisma.enrollment.findFirst({
    where: { id }
  });
}

async function upsert(
  createdEnrollment: CreateEnrollmentParams,
  createdAddress: CreateAddressParams, 
) {
  return await prisma.enrollment.create({
    data: {
      ...createdEnrollment,
      Address: {
        create: {
          ...createdAddress
        }
      }
    }
  });
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
