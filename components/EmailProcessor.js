export default function EmailProcessor({ onProcess, processing }) {
    return (
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Process Bank Emails
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Click the button below to process your bank emails and extract transaction details.
              This will scan your inbox for bank transaction emails and update your transaction history.
            </p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={onProcess}
              disabled={processing}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white
                ${processing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {processing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Emails...
                </>
              ) : (
                'Process Emails'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
