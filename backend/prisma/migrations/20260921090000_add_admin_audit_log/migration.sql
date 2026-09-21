-- Admin actions become accountable: an append-only log of who changed what.
CREATE TYPE "AuditAction" AS ENUM (
  'AD_APPROVE',
  'AD_REJECT',
  'AD_REMOVE',
  'REPORT_RESOLVE',
  'USER_SUSPEND',
  'USER_UNSUSPEND',
  'USER_GRANT_ADMIN',
  'USER_REVOKE_ADMIN',
  'BOOST_CANCEL',
  'BOOST_EXTEND',
  'PAYMENT_MARK_FAILED',
  'REVIEW_HIDE',
  'REVIEW_UNHIDE'
);

CREATE TYPE "AuditTargetType" AS ENUM (
  'AD',
  'USER',
  'REPORT',
  'BOOST',
  'PAYMENT',
  'REVIEW'
);

CREATE TABLE "admin_audit_logs" (
  "id"         TEXT NOT NULL,
  "actorId"    TEXT NOT NULL,
  "action"     "AuditAction" NOT NULL,
  "targetType" "AuditTargetType" NOT NULL,
  "targetId"   TEXT NOT NULL,
  "summary"    TEXT NOT NULL,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");
CREATE INDEX "admin_audit_logs_actorId_createdAt_idx" ON "admin_audit_logs"("actorId", "createdAt");
CREATE INDEX "admin_audit_logs_targetType_targetId_idx" ON "admin_audit_logs"("targetType", "targetId");
CREATE INDEX "admin_audit_logs_action_createdAt_idx" ON "admin_audit_logs"("action", "createdAt");

ALTER TABLE "admin_audit_logs"
  ADD CONSTRAINT "admin_audit_logs_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Review moderation is a soft hide: the row survives for dispute handling but
-- drops out of the advertiser's public rating.
ALTER TABLE "reviews" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "reviews_isHidden_idx" ON "reviews"("isHidden");
