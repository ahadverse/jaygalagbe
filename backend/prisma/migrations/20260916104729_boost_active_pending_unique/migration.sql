CREATE UNIQUE INDEX "boosts_adId_active_pending_key" ON "boosts" ("adId") WHERE "status" IN ('PENDING', 'ACTIVE');
