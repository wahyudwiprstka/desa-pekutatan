/*
  Warnings:

  - Added the required column `ringkasan` to the `Berita` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Berita" ADD COLUMN     "ringkasan" TEXT NOT NULL;
