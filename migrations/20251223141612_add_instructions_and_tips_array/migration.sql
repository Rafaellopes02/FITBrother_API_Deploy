-- CreateEnum
CREATE TYPE "activity_level_enum" AS ENUM ('0', '1', '2', '3');

-- CreateEnum
CREATE TYPE "exercise_type_enum" AS ENUM ('0', '1', '2', '3', '4');

-- CreateEnum
CREATE TYPE "gender_enum" AS ENUM ('0', '1', '2');

-- CreateEnum
CREATE TYPE "goal_enum" AS ENUM ('0', '1', '2', '3', '4', '5', '6');

-- CreateEnum
CREATE TYPE "medical_condition_enum" AS ENUM ('0', '1', '2', '3', '4', '5');

-- CreateEnum
CREATE TYPE "nutrition_type_enum" AS ENUM ('0', '1', '2', '3');

-- CreateEnum
CREATE TYPE "occupation_type_enum" AS ENUM ('0', '1', '2', '3');

-- CreateEnum
CREATE TYPE "processed_food_enum" AS ENUM ('0', '1', '2');

-- CreateEnum
CREATE TYPE "stress_level_enum" AS ENUM ('0', '1', '2');

-- CreateEnum
CREATE TYPE "training_availability_enum" AS ENUM ('0', '1', '2');

-- CreateEnum
CREATE TYPE "training_experience_enum" AS ENUM ('0', '1', '2', '3');

-- CreateEnum
CREATE TYPE "user_type_enum" AS ENUM ('0', '1', '2', '3');

-- CreateEnum
CREATE TYPE "week_day_enum" AS ENUM ('0', '1', '2', '3', '4', '5', '6');

-- CreateEnum
CREATE TYPE "workout_status_enum" AS ENUM ('0', '1', '2');

-- CreateTable
CREATE TABLE "anamnesis" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "gender_enum" NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "height_cm" DECIMAL(5,2) NOT NULL,
    "occupation" "occupation_type_enum" NOT NULL,
    "occupation_other" TEXT,
    "medical_conditions" "medical_condition_enum"[],
    "medical_condition_other" TEXT,
    "spine_joint_injuries" BOOLEAN NOT NULL DEFAULT false,
    "injury_description" TEXT,
    "regular_medication" BOOLEAN NOT NULL DEFAULT false,
    "medication_description" TEXT,
    "allergies" BOOLEAN NOT NULL DEFAULT false,
    "allergy_description" TEXT,
    "last_medical_exam" DATE,
    "activity_level" "activity_level_enum" NOT NULL,
    "training_experience" "training_experience_enum" NOT NULL,
    "exercise_types" "exercise_type_enum"[],
    "exercise_other" TEXT,
    "goals" "goal_enum"[],
    "goal_other" TEXT,
    "specific_goal" TEXT,
    "training_availability" "training_availability_enum" NOT NULL,
    "nutrition_type" "nutrition_type_enum" NOT NULL,
    "nutrition_other" TEXT,
    "eats_processed_food" "processed_food_enum" NOT NULL,
    "sleep_hours" INTEGER NOT NULL,
    "stress_level" "stress_level_enum" NOT NULL,
    "stress_comments" TEXT,
    "had_personal_trainer" BOOLEAN NOT NULL DEFAULT false,
    "personal_trainer_experience" TEXT,
    "wants_progress_tracking" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anamnesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sets" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "rest_seconds" INTEGER NOT NULL,
    "demonstration_url" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "instructions" TEXT,
    "tips" TEXT[],

    CONSTRAINT "exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" SERIAL NOT NULL,
    "anamnesis_id" INTEGER NOT NULL,
    "week_day" "week_day_enum" NOT NULL,
    "start_hour" TIME(6) NOT NULL,
    "end_hour" TIME(6) NOT NULL,

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "registration_code" TEXT NOT NULL,
    "registration_status" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" BIGINT,
    "date_of_birth" DATE,
    "user_type" "user_type_enum" NOT NULL,
    "parent_user_id" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "emergency_name" VARCHAR(100),
    "emergency_phone" VARCHAR(20),
    "profile_image" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout" (
    "id" SERIAL NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "exercise_signature" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_clients" (
    "workout_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "status" "workout_status_enum" NOT NULL DEFAULT '0',

    CONSTRAINT "workout_clients_pkey" PRIMARY KEY ("workout_id","client_id","date")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "workout_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "custom_sets" INTEGER,
    "custom_repetitions" INTEGER,
    "custom_rest_seconds" INTEGER,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("workout_id","sequence_order")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_name_key" ON "exercise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_registration_code_key" ON "users"("registration_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_hash_key" ON "users"("password_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "workout_exercise_signature_key" ON "workout"("exercise_signature");

-- AddForeignKey
ALTER TABLE "anamnesis" ADD CONSTRAINT "anamnesis_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "anamnesis" ADD CONSTRAINT "anamnesis_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_anamnesis_id_fkey" FOREIGN KEY ("anamnesis_id") REFERENCES "anamnesis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workout" ADD CONSTRAINT "workout_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workout_clients" ADD CONSTRAINT "workout_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workout_clients" ADD CONSTRAINT "workout_clients_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
