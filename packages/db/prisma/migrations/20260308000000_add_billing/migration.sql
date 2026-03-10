-- AlterTable: Add Stripe billing fields to organizations
ALTER TABLE "organizations" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "organizations" ADD COLUMN "aiCreditsBalance" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex for stripeCustomerId
CREATE UNIQUE INDEX "organizations_stripeCustomerId_key" ON "organizations"("stripeCustomerId");
CREATE INDEX "organizations_stripeCustomerId_idx" ON "organizations"("stripeCustomerId");

-- CreateEnum: SubscriptionStatus
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'PAUSED');

-- CreateEnum: BillingInterval
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum: CreditEventType
CREATE TYPE "CreditEventType" AS ENUM ('MONTHLY_GRANT', 'TRIAL_GRANT', 'PURCHASE', 'USAGE', 'REFUND');

-- CreateTable: subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "interval" "BillingInterval",
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: credit_ledger
CREATE TABLE "credit_ledger" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "CreditEventType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for subscriptions
CREATE UNIQUE INDEX "subscriptions_organizationId_key" ON "subscriptions"("organizationId");
CREATE UNIQUE INDEX "subscriptions_stripeCustomerId_key" ON "subscriptions"("stripeCustomerId");
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex for credit_ledger
CREATE INDEX "credit_ledger_organizationId_createdAt_idx" ON "credit_ledger"("organizationId", "createdAt" DESC);

-- AddForeignKey: subscriptions → organizations
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: credit_ledger → organizations
ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
