import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import TransactionsList from "../components/TransactionsList";
import EmailProcessor from "../components/EmailProcessor";
import { fetchTransactions } from "../lib/supabase";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingEmails, setProcessingEmails] = useState(false);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    emailsProcessed: 0
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (session) {
      loadTransactions();
    }
  }, [session, status, router]);

  const loadTransactions = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const data = await fetchTransactions(session.user.email);
      setTransactions(data);

      // Calculate statistics
      const received = data
        .filter(t => t.transaction_type === 'received')
        .reduce((sum, t) => sum + t.amount, 0);

      const sent = data
        .filter(t => t.transaction_type === 'sent')
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalReceived: received,
        totalSent: sent,
        emailsProcessed: data.length
      });
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessEmails = async () => {
    setProcessingEmails(true);
    try {
      const response = await fetch('/api/emails/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken
        }),
      });

      if (response.ok) {
        await loadTransactions();
      } else {
        console.error('Error processing emails');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessingEmails(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard | Banking Transaction Tracker</title>
      </Head>

      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-blue-700">
                Banking Transaction Tracker
              </h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-600">
                {session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Received
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  ₹{stats.totalReceived.toFixed(2)}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Spent
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-red-600">
                  ₹{stats.totalSent.toFixed(2)}
                </dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Transactions Processed
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  {stats.emailsProcessed}
                </dd>
              </div>
            </div>
          </div>

          <EmailProcessor
            onProcess={handleProcessEmails}
            processing={processingEmails}
          />

          <TransactionsList transactions={transactions} />
        </div>
      </main>
    </div>
  );
}
