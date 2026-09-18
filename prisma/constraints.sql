-- ============================================================================
--  Invariants Prisma's schema language cannot express.
--  Apply as a follow-up migration AFTER `prisma migrate dev --name init`:
--    npx prisma migrate dev --create-only --name hard_constraints
--    (paste this into the generated migration.sql, then `prisma migrate dev`)
-- ============================================================================

-- 1. OVERSELL BECOMES PHYSICALLY IMPOSSIBLE.
--    Application logic can have bugs; this cannot. Any code path that would
--    drive stock negative aborts its transaction instead.
ALTER TABLE "product_variant"
  ADD CONSTRAINT "product_variant_qty_nonneg" CHECK ("quantityOnHand" >= 0);

ALTER TABLE "product_variant"
  ADD CONSTRAINT "product_variant_price_nonneg" CHECK ("priceInPaise" >= 0);

ALTER TABLE "stock_reservation"
  ADD CONSTRAINT "stock_reservation_qty_pos" CHECK ("quantity" > 0);

ALTER TABLE "cart_item"
  ADD CONSTRAINT "cart_item_qty_pos" CHECK ("quantity" > 0);

ALTER TABLE "order_item"
  ADD CONSTRAINT "order_item_qty_pos" CHECK ("quantity" > 0);

-- Order money must add up. Catches a miscalculated cart before it becomes a
-- wrong tax invoice.
ALTER TABLE "order"
  ADD CONSTRAINT "order_total_consistent" CHECK (
    "totalInPaise" =
      "subtotalInPaise" - "discountInPaise" + "shippingInPaise"
      + "codFeeInPaise" + "taxInPaise"
  );

ALTER TABLE "order"
  ADD CONSTRAINT "order_tax_split_consistent" CHECK (
    "taxInPaise" = "cgstInPaise" + "sgstInPaise" + "igstInPaise"
  );

-- GST is either CGST+SGST (intra-state) or IGST (inter-state), never both.
ALTER TABLE "order"
  ADD CONSTRAINT "order_gst_mutually_exclusive" CHECK (
    ("igstInPaise" = 0) OR ("cgstInPaise" = 0 AND "sgstInPaise" = 0)
  );

-- 2. Exactly one primary image per product. Prisma has no partial unique index.
CREATE UNIQUE INDEX "product_image_one_primary"
  ON "product_image" ("productId")
  WHERE "isPrimary";

-- 3. Partial index for the hot "how much of this variant is held right now?"
--    query. Stays tiny because CONSUMED/RELEASED rows are excluded forever.
CREATE INDEX "stock_reservation_active_idx"
  ON "stock_reservation" ("variantId")
  WHERE "status" = 'ACTIVE';

-- 4. One live cart per signed-in user.
CREATE UNIQUE INDEX "cart_one_active_per_user"
  ON "cart" ("userId")
  WHERE "userId" IS NOT NULL AND "convertedAt" IS NULL;

-- 5. Human-readable order numbers: PS-2026-0001.
--    A sequence, not a COUNT(*), so concurrent checkouts cannot collide.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Tax invoice numbers must be a separate, gapless-per-financial-year series
-- under GST rules — do NOT reuse order_number_seq.
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;
