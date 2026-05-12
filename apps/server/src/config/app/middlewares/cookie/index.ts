export interface CookieConfig {
  refreshToken: {
    name: string;
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    domain: string;
  };
  session: {
    name: string;
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

async function cookieConfig(): Promise<CookieConfig> {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    // Refresh token cookie
    refreshToken: {
      name: 'SellKaro_refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // JS access nahi
      secure: isProduction, // HTTPS only in prod
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/auth',
      domain: process.env.COOKIE_DOMAIN || '',
    },

    // Session cookie (optional)
    session: {
      name: 'SellKaro_session',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
    },
  };
}

export default cookieConfig;
