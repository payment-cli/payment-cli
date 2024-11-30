-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "baseUnit" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentIntent_externalId_idx" ON "PaymentIntent"("externalId");

-- CreateIndex
CREATE INDEX "PaymentIntent_serviceName_idx" ON "PaymentIntent"("serviceName");
