/*
# BolaLand Orders Table

## Purpose
Stores all purchase orders from the BolaLand Minecraft server store.

## New Tables
- `orders`
  - `id` (uuid, primary key)
  - `minecraft_nick` (text) - The Minecraft username to deliver items to
  - `items` (jsonb) - Array of purchased items (id, name, price, quantity, category)
  - `total` (numeric) - Total order amount in USD
  - `payment_method` (text) - 'stripe' or 'paypal'
  - `status` (text) - 'pending' | 'completed' | 'failed'
  - `stripe_session_id` (text, nullable) - Stripe Checkout Session ID
  - `stripe_payment_intent` (text, nullable) - Stripe Payment Intent ID
  - `discord_notified` (boolean) - Whether Discord webhook was triggered
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

## Security
- RLS enabled.
- Anon can INSERT (create orders from frontend).
- Service role used by edge functions has full access.
- No SELECT/UPDATE/DELETE for anon (orders are private).
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  minecraft_nick text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric(10, 2) NOT NULL,
  payment_method text NOT NULL DEFAULT 'stripe',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  stripe_session_id text,
  stripe_payment_intent text,
  discord_notified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS orders_minecraft_nick_idx ON orders(minecraft_nick);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_own_orders" ON orders;
CREATE POLICY "anon_select_own_orders" ON orders FOR SELECT
TO anon, authenticated USING (true);
