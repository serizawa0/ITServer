-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_subTaskId_fkey";

-- CreateTable
CREATE TABLE "public"."Commentary" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "subtaskId" TEXT NOT NULL,

    CONSTRAINT "Commentary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_subTaskId_fkey" FOREIGN KEY ("subTaskId") REFERENCES "public"."SubTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commentary" ADD CONSTRAINT "Commentary_subtaskId_fkey" FOREIGN KEY ("subtaskId") REFERENCES "public"."SubTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
