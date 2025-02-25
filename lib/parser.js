// This is a generic parser that you'll need to customize based on your bank's email format
export function parseTransactionEmail(email) {
    const headers = email.payload.headers;
    const subject = headers.find(header => header.name === 'Subject')?.value || '';
    const from = headers.find(header => header.name === 'From')?.value || '';
    const date = headers.find(header => header.name === 'Date')?.value || '';

    // Get the email body
    let body = '';
    if (email.payload.parts && email.payload.parts.length) {
      // Multi-part email
      for (const part of email.payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          body = decodeEmailBody(part.body);
          break;
        }
      }
    } else if (email.payload.body.data) {
      // Single part email
      body = decodeEmailBody(email.payload.body);
    }

    // Parse the transaction details from the email body
    // Note: You'll need to customize these regex patterns based on your bank's email format
    const transaction = {
      date: extractDate(date, body),
      time: extractTime(body),
      amount: extractAmount(body),
      transactionType: determineTransactionType(subject, body),
      sender: extractSender(body),
      recipient: extractRecipient(body),
      description: extractDescription(body),
      reference: email.id
    };

    return transaction;
  }

  function decodeEmailBody(body) {
    if (!body || !body.data) return '';
    return Buffer.from(body.data, 'base64').toString('utf-8');
  }

  // Helper functions to extract specific data
  // These need to be customized based on your bank's email format
  function extractDate(headerDate, body) {
    // First try to extract from email body
    const dateMatch = body.match(/Date:\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
    if (dateMatch) return dateMatch[1];

    // Fallback to email header date
    if (headerDate) {
      const date = new Date(headerDate);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    return null;
  }

  function extractTime(body) {
    const timeMatch = body.match(/Time:\s*(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i) ||
                      body.match(/at\s*(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i);
    return timeMatch ? timeMatch[1] : null;
  }

  function extractAmount(body) {
    const amountMatch = body.match(/(?:INR|Rs\.?|₹)\s*([\d,]+\.\d{2})/i) ||
                        body.match(/Amount:\s*(?:INR|Rs\.?|₹)?\s*([\d,]+\.\d{2})/i);
    return amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
  }

  function determineTransactionType(subject, body) {
    const lowerBody = body.toLowerCase();
    const lowerSubject = subject.toLowerCase();

    // Check for deposit/credit keywords
    if (
      lowerBody.includes('credited') ||
      lowerBody.includes('deposited') ||
      lowerBody.includes('received') ||
      lowerSubject.includes('credit')
    ) {
      return 'received';
    }

    // Check for withdrawal/debit keywords
    if (
      lowerBody.includes('debited') ||
      lowerBody.includes('withdrawn') ||
      lowerBody.includes('sent') ||
      lowerBody.includes('payment') ||
      lowerBody.includes('upi txn') ||
      lowerSubject.includes('debit')
    ) {
      return 'sent';
    }

    return 'unknown';
  }

  function extractSender(body) {
    const senderMatch = body.match(/from\s*:?\s*([A-Za-z\s]+)/i) ||
                        body.match(/(?:sender|by)\s*:?\s*([A-Za-z\s]+)/i);
    return senderMatch ? senderMatch[1].trim() : null;
  }

  function extractRecipient(body) {
    const recipientMatch = body.match(/to\s*:?\s*([A-Za-z\s]+)/i) ||
                           body.match(/(?:recipient|for)\s*:?\s*([A-Za-z\s]+)/i);
    return recipientMatch ? recipientMatch[1].trim() : null;
  }

  function extractDescription(body) {
    const descriptionMatch = body.match(/(?:description|remarks|comment)s?:?\s*([A-Za-z0-9\s]+)/i) ||
                             body.match(/info:?\s*([A-Za-z0-9\s]+)/i);
    return descriptionMatch ? descriptionMatch[1].trim() : null;
  }
