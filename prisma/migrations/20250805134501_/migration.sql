/*
  Warnings:

  - You are about to drop the column `deadline` on the `SubTask` table. All the data in the column will be lost.
  - Added the required column `deadLine` to the `SubTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SubTask" DROP COLUMN "deadline",
ADD COLUMN     "deadLine" TIMESTAMP(3) NOT NULL;
