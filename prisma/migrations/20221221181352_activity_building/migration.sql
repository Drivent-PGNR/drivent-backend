/*
  Warnings:

  - You are about to drop the column `ticketId` on the `Activity` table. All the data in the column will be lost.
  - Added the required column `buildingId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_ticketId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "ticketId",
ADD COLUMN     "buildingId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Building" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActivityToTicket" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ActivityToTicket_AB_unique" ON "_ActivityToTicket"("A", "B");

-- CreateIndex
CREATE INDEX "_ActivityToTicket_B_index" ON "_ActivityToTicket"("B");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToTicket" ADD CONSTRAINT "_ActivityToTicket_A_fkey" FOREIGN KEY ("A") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToTicket" ADD CONSTRAINT "_ActivityToTicket_B_fkey" FOREIGN KEY ("B") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
