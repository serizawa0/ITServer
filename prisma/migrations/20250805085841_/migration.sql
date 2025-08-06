/*
  Warnings:

  - Added the required column `autor` to the `Commentary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Commentary" ADD COLUMN     "autor" TEXT NOT NULL;
