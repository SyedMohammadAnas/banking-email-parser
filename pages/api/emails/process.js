module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      import { fetchBankEmails } from '../../../lib/gmail';
      import { parseTransactionEmail } from '../../../lib/parser';
      import { supabase } from '../../../lib/supabase';
      import { getSession } from 'next-auth/react';

      export default async function handler(req, res) {
        if (req.method !== 'POST') {
          return res.status(405).json({ message: 'Method not allowed' });
        }

        try {
          const session = await getSession({ req });
          if (!session) {
            return res.status(401).json({ message: 'Unauthorized' });
          }

          const { accessToken } = req.body;
          if (!accessToken) {
            return res.status(400).json({ message: 'Access token is required' });
          }

          // Get the user's email address from the session
          const userEmail = session.user.email;

          // Fetch emails from Gmail
          // You'll need to customize this with your bank's email domain
          const emails = await fetchBankEmails(accessToken, 'yourbank.com');

          // Process each email to extract transaction details
          const processedEmails = [];
          const transactions = [];

          for (const email of emails) {
            try {
              // Skip emails we've already processed
              const { data: existingTransaction } = await supabase
                .from('transactions')
                .select('id')
                .eq('reference', email.id)
                .single();

              if (existingTransaction) {
                continue;
              }

              // Parse the email to extract transaction details
              const transaction = parseTransactionEmail(email);

              // Skip if we couldn't extract critical information
              if (!transaction.amount || !transaction.transactionType) {
                continue;
              }

              // Prepare transaction data for Supabase
              const transactionData = {
                user_id: userEmail,
                transaction_date: transaction.date || new Date().toISOString().split('T')[0],
                transaction_time: transaction.time || null,
                amount: transaction.amount,
                transaction_type: transaction.transactionType,
                sender: transaction.sender || null,
                recipient: transaction.recipient || null,
                description: transaction.description || null,
                reference: email.id
              };

              // Insert transaction into Supabase
              const { data, error } = await supabase
                .from('transactions')
                .insert([transactionData]);

              if (error) {
                console.error('Error inserting transaction:', error);
                continue;
              }

              processedEmails.push(email.id);
              transactions.push(data[0]);
            } catch (error) {
              console.error('Error processing email:', error);
              // Continue with the next email
            }
          }

          return res.status(200).json({
            success: true,
            processed: processedEmails.length,
            total: emails.length
          });
        } catch (error) {
          console.error('Error processing emails:', error);
          return res.status(500).json({ message: 'Error processing emails' });
        }
      }
