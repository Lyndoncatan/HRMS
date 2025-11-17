import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'blocked';
export type ProductStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Product {
  id: string;
  product_code: string;
  description: string;
  unit: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  activated_by: string | null;
  activated_at: string | null;
}

export interface UserPermission {
  id: string;
  super_admin_id: string;
  target_user_id: string;
  can_delete: boolean;
  can_block: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}
