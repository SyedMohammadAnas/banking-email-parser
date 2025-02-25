import { google } from 'googleapis';

// Function to fetch emails from Gmail
export async function fetchBankEmails(accessToken, bankEmailDomain = "yourbank.com") {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for emails from the bank
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${bankEmailDomain} newer_than:30d` // Get emails from past 30 days
    });

    const messages = response.data.messages || [];

    // Fetch full email content for each message
    const emails = await Promise.all(
      messages.map(async (message) => {
        const emailData = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        return emailData.data;
      })
    );

    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

// Function to decode email body from base64
export function decodeEmailBody(body) {
  if (!body) return '';

  // Handle different email content encodings
  let decodedBody;
  if (body.data) {
    decodedBody = Buffer.from(body.data, 'base64').toString('utf-8');
  } else {
    decodedBody = Buffer.from(body, 'base64').toString('utf-8');
  }

  return decodedBody;
}
