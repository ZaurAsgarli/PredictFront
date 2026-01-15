/**
 * Admin Logout API Route
 * 
 * Clears httpOnly cookie and logs out admin
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear the admin_token cookie
    res.setHeader(
      'Set-Cookie',
      'admin_token=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'
    );

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Admin Logout API] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
