-- Voucher and Flash Sale were removed from the product.
ALTER TABLE "payment_orders" DROP CONSTRAINT IF EXISTS "payment_orders_voucher_id_fkey";

ALTER TABLE "payment_orders"
  DROP COLUMN IF EXISTS "voucher_id",
  DROP COLUMN IF EXISTS "voucher_code",
  DROP COLUMN IF EXISTS "original_amount",
  DROP COLUMN IF EXISTS "discount_amount";

DROP TABLE IF EXISTS "flash_sales";
DROP TABLE IF EXISTS "vouchers";
