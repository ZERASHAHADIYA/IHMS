/*
  Warnings:

  - A unique constraint covering the columns `[uniqueKey]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "uniqueKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_uniqueKey_key" ON "Conversation"("uniqueKey");
