-- An admin can now settle a stuck payment by hand and re-query the gateway for
-- one, so both need their own audit actions. A manual settlement in particular
-- has to be distinguishable from a gateway-confirmed one for reconciliation.
-- Adding enum values only; nothing uses them in this transaction, which is what
-- PostgreSQL requires for ALTER TYPE ... ADD VALUE inside a migration.
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PAYMENT_MARK_PAID';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'PAYMENT_GATEWAY_RECHECK';
