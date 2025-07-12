/*
  Warnings:

  - Changed the type of `filter` on the `AdminAction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AdminAction" DROP COLUMN "filter",
ADD COLUMN     "filter" JSONB NOT NULL;
