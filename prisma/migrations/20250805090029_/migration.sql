/*
  Warnings:

  - You are about to drop the column `autor` on the `Commentary` table. All the data in the column will be lost.
  - Added the required column `author` to the `Commentary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Commentary" DROP COLUMN "autor",
ADD COLUMN     "author" TEXT NOT NULL;
