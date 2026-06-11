-- Initial schema for Kiosk wholesale management system
-- Generated to match src/db/schema/* — keep in sync.

-- ============================================================================
-- Enums
-- ============================================================================
CREATE TYPE "user_role" AS ENUM('admin', 'staff');
CREATE TYPE "order_status" AS ENUM('draft', 'confirmed', 'completed', 'cancelled');
CREATE TYPE "invoice_status" AS ENUM('pending', 'completed', 'cancelled');
CREATE TYPE "payment_method" AS ENUM('cash', 'bank_transfer', 'card', 'other');

-- ============================================================================
-- Users
-- ============================================================================
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "avatar_url" text,
  "password_hash" text,
  "google_sub" text UNIQUE,
  "role" "user_role" NOT NULL DEFAULT 'staff',
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Business entities (Hộ kinh doanh templates)
-- ============================================================================
CREATE TABLE "business_entities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "tax_code" text,
  "address" text,
  "phone" text,
  "email" text,
  "header_lines" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);

-- ============================================================================
-- Categories (self-referencing tree)
-- ============================================================================
CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "parent_id" uuid,
  "created_at" text NOT NULL
);
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_fk"
  FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL;

-- ============================================================================
-- Units
-- ============================================================================
CREATE TABLE "units" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL UNIQUE,
  "abbreviation" text,
  "created_at" text NOT NULL
);

-- ============================================================================
-- Companies (customer groups)
-- ============================================================================
CREATE TABLE "companies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "tax_code" text,
  "price_list_id" uuid,
  "address" text,
  "phone" text,
  "email" text,
  "notes" text,
  "is_active" text NOT NULL DEFAULT 'true',
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
CREATE INDEX "companies_name_idx" ON "companies" ("name");

-- ============================================================================
-- Products
-- ============================================================================
CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "category_id" uuid,
  "unit_id" uuid,
  "purchase_price" numeric(15, 2) NOT NULL DEFAULT '0',
  "default_sale_price" numeric(15, 2) NOT NULL DEFAULT '0',
  "stock_quantity" integer NOT NULL DEFAULT 0,
  "is_active" text NOT NULL DEFAULT 'true',
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
ALTER TABLE "products" ADD CONSTRAINT "products_category_fk"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;
ALTER TABLE "products" ADD CONSTRAINT "products_unit_fk"
  FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL;
CREATE UNIQUE INDEX "products_code_idx" ON "products" ("code");
CREATE INDEX "products_name_idx" ON "products" ("name");
CREATE INDEX "products_category_idx" ON "products" ("category_id");
-- trigram index for fast ILIKE search
CREATE INDEX "products_name_trgm_idx" ON "products" USING gin ("name" gin_trgm_ops);

-- ============================================================================
-- Customers (branches)
-- ============================================================================
CREATE TABLE "customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL,
  "name" text NOT NULL,
  "company_id" uuid NOT NULL,
  "phone" text,
  "email" text,
  "tax_id" text,
  "address" text,
  "notes" text,
  "is_active" text NOT NULL DEFAULT 'true',
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_fk"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT;
CREATE INDEX "customers_code_idx" ON "customers" ("code");
CREATE INDEX "customers_name_idx" ON "customers" ("name");
CREATE INDEX "customers_company_idx" ON "customers" ("company_id");

-- ============================================================================
-- Price lists + items
-- ============================================================================
CREATE TABLE "price_lists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "company_id" uuid,
  "description" text,
  "is_default" text NOT NULL DEFAULT 'false',
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_company_fk"
  FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;
CREATE INDEX "price_lists_company_idx" ON "price_lists" ("company_id");

CREATE TABLE "price_list_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "price_list_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "custom_price" numeric(15, 2) NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_pl_fk"
  FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE;
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_product_fk"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;
CREATE UNIQUE INDEX "price_list_items_pl_product_unique"
  ON "price_list_items" ("price_list_id", "product_id");
CREATE INDEX "price_list_items_product_idx" ON "price_list_items" ("product_id");

-- ============================================================================
-- Orders + items + payments
-- ============================================================================
CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "customer_id" uuid NOT NULL,
  "business_entity_id" uuid NOT NULL,
  "status" "order_status" NOT NULL DEFAULT 'confirmed',
  "subtotal" numeric(15, 2) NOT NULL,
  "discount" numeric(15, 2) NOT NULL DEFAULT '0',
  "total" numeric(15, 2) NOT NULL,
  "paid_amount" numeric(15, 2) NOT NULL DEFAULT '0',
  "notes" text,
  "created_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_fk"
  FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT;
ALTER TABLE "orders" ADD CONSTRAINT "orders_business_entity_fk"
  FOREIGN KEY ("business_entity_id") REFERENCES "business_entities"("id") ON DELETE RESTRICT;
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_fk"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;
CREATE INDEX "orders_customer_idx" ON "orders" ("customer_id");
CREATE INDEX "orders_created_at_idx" ON "orders" ("created_at");
CREATE INDEX "orders_status_idx" ON "orders" ("status");

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "product_name" text NOT NULL,
  "unit" text NOT NULL,
  "quantity" numeric(15, 3) NOT NULL,
  "unit_price" numeric(15, 2) NOT NULL,
  "total_price" numeric(15, 2) NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 0
);
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_fk"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_fk"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;
CREATE INDEX "order_items_order_idx" ON "order_items" ("order_id");
CREATE INDEX "order_items_product_idx" ON "order_items" ("product_id");

CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" uuid NOT NULL,
  "amount" numeric(15, 2) NOT NULL,
  "method" "payment_method" NOT NULL DEFAULT 'cash',
  "paid_at" timestamptz NOT NULL DEFAULT now(),
  "note" text,
  "created_by" uuid
);
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_fk"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_fk"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;
CREATE INDEX "payments_order_idx" ON "payments" ("order_id");

-- ============================================================================
-- Invoices
-- ============================================================================
CREATE TABLE "invoices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "order_id" uuid NOT NULL UNIQUE,
  "customer_id" uuid NOT NULL,
  "business_entity_id" uuid NOT NULL,
  "status" "invoice_status" NOT NULL DEFAULT 'completed',
  "subtotal" numeric(15, 2) NOT NULL,
  "discount" numeric(15, 2) NOT NULL DEFAULT '0',
  "total" numeric(15, 2) NOT NULL,
  "paid_amount" numeric(15, 2) NOT NULL DEFAULT '0',
  "issued_at" timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_fk"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_fk"
  FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_business_entity_fk"
  FOREIGN KEY ("business_entity_id") REFERENCES "business_entities"("id") ON DELETE RESTRICT;
CREATE INDEX "invoices_customer_idx" ON "invoices" ("customer_id");
CREATE INDEX "invoices_issued_at_idx" ON "invoices" ("issued_at");
