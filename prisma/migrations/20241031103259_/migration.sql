/*
  Warnings:

  - A unique constraint covering the columns `[userId,providerId,providerAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `providerId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Account_provider_providerAccountId_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "providerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "access_token" TEXT;

-- CreateTable
CREATE TABLE "CalendarAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "name" TEXT,
    "color" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarAccount_calendarId_key" ON "CalendarAccount"("calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarAccount_userId_calendarId_key" ON "CalendarAccount"("userId", "calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_providerId_providerAccountId_key" ON "Account"("userId", "providerId", "providerAccountId");

-- AddForeignKey
ALTER TABLE "CalendarSync" ADD CONSTRAINT "CalendarSync_sourceCalendarId_fkey" FOREIGN KEY ("sourceCalendarId") REFERENCES "CalendarAccount"("calendarId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSync" ADD CONSTRAINT "CalendarSync_targetCalendarId_fkey" FOREIGN KEY ("targetCalendarId") REFERENCES "CalendarAccount"("calendarId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarAccount" ADD CONSTRAINT "CalendarAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
