import { NextApiRequest, NextApiResponse } from 'next';
import { deleteCookie } from 'cookies-next'; // Use appropriate cookie library

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Clear session cookie
    deleteCookie('session_token', { req, res });
    return res.status(200).json({ message: 'Logout successful' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
