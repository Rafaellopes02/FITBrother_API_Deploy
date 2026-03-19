-- CreateTable
CREATE TABLE "problem_reports" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "device" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_reports_pkey" PRIMARY KEY ("id")
);
