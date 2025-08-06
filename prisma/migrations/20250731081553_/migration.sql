-- DropForeignKey
ALTER TABLE "public"."SubTask" DROP CONSTRAINT "SubTask_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubTask" DROP CONSTRAINT "SubTask_taskId_fkey";

-- AddForeignKey
ALTER TABLE "public"."SubTask" ADD CONSTRAINT "SubTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubTask" ADD CONSTRAINT "SubTask_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."SubTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
