-- AlterTable
ALTER TABLE "Curriculum" ADD COLUMN     "totalEstimatedHours" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weeklySchedule" JSONB NOT NULL DEFAULT '[]';
