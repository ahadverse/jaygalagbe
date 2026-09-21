-- The console can now edit and permanently delete records, so the audit log
-- needs actions for them. Adding enum values only; nothing uses them in this
-- transaction, which is what PostgreSQL requires for ALTER TYPE ... ADD VALUE
-- inside a migration.
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'AD_EDIT';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'AD_DELETE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'REPORT_DELETE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'USER_EDIT';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'USER_DELETE';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'REVIEW_DELETE';
