-- Migration: Fix column types and add missing indexes/constraints

-- 1. Fix boolean columns (text → boolean)
ALTER TABLE "companies" ALTER COLUMN "is_active" TYPE boolean USING ("is_active"::text::boolean), ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE "customers" ALTER COLUMN "is_active" TYPE boolean USING ("is_active"::text::boolean), ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE "products" ALTER COLUMN "is_active" TYPE boolean USING ("is_active"::text::boolean), ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE "price_lists" ALTER COLUMN "is_default" TYPE boolean USING ("is_default"::text::boolean), ALTER COLUMN "is_default" SET DEFAULT false;

-- 2. Fix timestamp columns (text → timestamptz)
ALTER TABLE "business_entities" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "business_entities" ALTER COLUMN "updated_at" TYPE timestamptz USING ("updated_at"::timestamptz), ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "categories" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "units" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "companies" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "companies" ALTER COLUMN "updated_at" TYPE timestamptz USING ("updated_at"::timestamptz), ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "customers" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "customers" ALTER COLUMN "updated_at" TYPE timestamptz USING ("updated_at"::timestamptz), ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "products" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "products" ALTER COLUMN "updated_at" TYPE timestamptz USING ("updated_at"::timestamptz), ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "price_lists" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "price_lists" ALTER COLUMN "updated_at" TYPE timestamptz USING ("updated_at"::timestamptz), ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE "price_list_items" ALTER COLUMN "created_at" TYPE timestamptz USING ("created_at"::timestamptz), ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE "price_list_items" ALTER COLUMN "updated_at" TYPE timestamptz USING ("updated_at"::timestamptz), ALTER COLUMN "updated_at" SET DEFAULT now();

-- 3. Add missing FK on companies.price_list_id
ALTER TABLE "companies" ADD CONSTRAINT "companies_price_list_fk"
  FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE SET NULL;

-- 4. Add missing FK indexes
CREATE INDEX IF NOT EXISTS "categories_parent_idx" ON "categories" ("parent_id");
CREATE INDEX IF NOT EXISTS "products_unit_idx" ON "products" ("unit_id");
CREATE INDEX IF NOT EXISTS "invoices_business_entity_idx" ON "invoices" ("business_entity_id");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices" ("status");
CREATE INDEX IF NOT EXISTS "orders_business_entity_idx" ON "orders" ("business_entity_id");
CREATE INDEX IF NOT EXISTS "payments_created_by_idx" ON "payments" ("created_by");
CREATE INDEX IF NOT EXISTS "payments_paid_at_idx" ON "payments" ("paid_at");
CREATE INDEX IF NOT EXISTS "companies_price_list_idx" ON "companies" ("price_list_id");
CREATE INDEX IF NOT EXISTS "orders_created_by_idx" ON "orders" ("created_by");

-- 5. Upgrade customer code index to unique
DROP INDEX IF EXISTS "customers_code_idx";
CREATE UNIQUE INDEX "customers_code_idx" ON "customers" ("code");

-- 6. Add CHECK constraints on monetary columns
ALTER TABLE "products" ADD CONSTRAINT "products_purchase_price_check" CHECK ("purchase_price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_sale_price_check" CHECK ("default_sale_price" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_stock_check" CHECK ("stock_quantity" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_subtotal_check" CHECK ("subtotal" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_total_check" CHECK ("total" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_paid_check" CHECK ("paid_amount" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_check" CHECK ("discount" >= 0);
ALTER TABLE "orders" ADD CONSTRAINT "orders_discount_within_subtotal" CHECK ("discount" <= "subtotal");
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_qty_check" CHECK ("quantity" > 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_price_check" CHECK ("unit_price" >= 0);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_total_check" CHECK ("total_price" >= 0);
ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_check" CHECK ("amount" > 0);
ALTER TABLE "price_list_items" ADD CONSTRAINT "pli_price_check" CHECK ("custom_price" >= 0);

-- 7. Partial unique index: only one default price list
CREATE UNIQUE INDEX IF NOT EXISTS "price_lists_single_default" ON "price_lists" ("is_default") WHERE "is_default" = true AND "company_id" IS NULL;
