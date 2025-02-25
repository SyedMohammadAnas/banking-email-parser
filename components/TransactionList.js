import { useState } from 'react';

export default function TransactionsList({ transactions }) {
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'received'

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.transaction_type === filter);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Transaction History
          </h3>
          <div className="flex mt-2 sm:mt-0 space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'received'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Received
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'sent'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sent
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From/To
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.transaction_date)}
                    {transaction.transaction_time && (
                      <div className="text-xs text-gray-400">{transaction.transaction_time}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.transaction_type === 'received'
                      ? <span className="flex items-center"><span className="text-green-500 mr-1">From:</span> {transaction.sender || 'Unknown'}</span>
                      : <span className="flex items-center"><span className="text-red-500 mr-1">To:</span> {transaction.recipient || 'Unknown'}</span>
                    }
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                    transaction.transaction_type === 'received' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'received' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
