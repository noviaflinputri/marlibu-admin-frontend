
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || 'http://localhost:5001/api';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== 'google' || !account.id_token) {
        return false;
      }

      try {
        const response = await fetch(`${BACKEND_API_URL}/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idToken: account.id_token,
          }),
        });

        return response.ok;
      } catch (error) {
        console.error('Google admin verification failed:', error);
        return false;
      }
    },

    async jwt({ token, account }) {
      if (account?.provider === 'google' && account.id_token) {
        try {
          const response = await fetch(`${BACKEND_API_URL}/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: account.id_token,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            token.backendToken = data.token;
            token.role = data.user?.role;
            token.backendUser = data.user;
          }
        } catch (error) {
          console.error('Failed to get backend token:', error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }

      (session as any).backendToken = token.backendToken;

      return session;
    },
  },
});
