import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type OrderStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  minecraft_nick: string;
  items: OrderItem[];
  total: number;
  payment_method: string;
  status: OrderStatus;
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  discord_notified: boolean;
  created_at: string;
  updated_at: string;
}
