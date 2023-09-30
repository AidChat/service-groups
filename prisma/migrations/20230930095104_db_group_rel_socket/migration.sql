-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "socketId" INTEGER;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_socketId_fkey" FOREIGN KEY ("socketId") REFERENCES "Socket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
