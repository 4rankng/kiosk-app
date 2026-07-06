-- Composite indexes for query performance
-- Added: status+issued_at and customer+issued_at on invoices;
--        status+created_at on orders; order+sort_order on order_items;
--        order+paid_at on payments.

CREATE INDEX IF NOT EXISTS "invoices_status_issued_at_idx" ON "invoices" USING btree ("status", "issued_at");
CREATE INDEX IF NOT EXISTS "invoices_customer_issued_idx" ON "invoices" USING btree ("customer_id", "issued_at");
CREATE INDEX IF NOT EXISTS "orders_status_created_idx" ON "orders" USING btree ("status", "created_at");
CREATE INDEX IF NOT EXISTS "order_items_order_sort_idx" ON "order_items" USING btree ("order_id", "sort_order");
CREATE INDEX IF NOT EXISTS "payments_order_paid_idx" ON "payments" USING btree ("order_id", "paid_at");
