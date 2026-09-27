-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('OPEN_WORKSPACE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'DELIVERED', 'COMPLETED', 'DISMISSED');

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "sender_device_id" TEXT NOT NULL,
    "receiver_device_id" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_receiver_device_id_status_idx" ON "messages"("receiver_device_id", "status");

-- CreateIndex
CREATE INDEX "messages_sender_device_id_idx" ON "messages"("sender_device_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_device_id_fkey" FOREIGN KEY ("sender_device_id") REFERENCES "devices"("device_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_device_id_fkey" FOREIGN KEY ("receiver_device_id") REFERENCES "devices"("device_id") ON DELETE CASCADE ON UPDATE CASCADE;

