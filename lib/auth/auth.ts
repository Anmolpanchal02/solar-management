import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import authConfig from './auth.config';

export const authOptions: NextAuthOptions = {
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

// Helper function to get session in server components
export const auth = () => getServerSession(authOptions);

// For compatibility
export const handlers = { GET: NextAuth(authOptions), POST: NextAuth(authOptions) };
export const signIn = () => {};
export const signOut = () => {};
