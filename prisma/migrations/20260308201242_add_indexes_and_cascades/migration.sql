-- DropForeignKey
ALTER TABLE "DeliveryAttempt" DROP CONSTRAINT "DeliveryAttempt_jobId_fkey";

-- DropForeignKey
ALTER TABLE "DeliveryAttempt" DROP CONSTRAINT "DeliveryAttempt_subscriberId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_pipelineId_fkey";

-- CreateIndex
CREATE INDEX "DeliveryAttempt_jobId_idx" ON "DeliveryAttempt"("jobId");

-- CreateIndex
CREATE INDEX "DeliveryAttempt_subscriberId_idx" ON "DeliveryAttempt"("subscriberId");

-- CreateIndex
CREATE INDEX "Job_pipelineId_idx" ON "Job"("pipelineId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Subscriber_pipelineId_idx" ON "Subscriber"("pipelineId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "Pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAttempt" ADD CONSTRAINT "DeliveryAttempt_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAttempt" ADD CONSTRAINT "DeliveryAttempt_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
