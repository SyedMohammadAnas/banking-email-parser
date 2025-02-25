import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to store a transaction in Supabase
export async function storeTransaction(transactionData) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData]);

  if (error) {
    console.error('Error inserting transaction:', error);
    throw error;
  }

  return data;
}

// Function to fetch transactions
export async function fetchTransactions(userId, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return data;
}
