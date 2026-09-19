-- Customers and advertisers are one role now: every account can browse, save,
-- post ads, boost them and chat. The flag that split them is no longer read.
ALTER TABLE "users" DROP COLUMN "isAdvertiser";
