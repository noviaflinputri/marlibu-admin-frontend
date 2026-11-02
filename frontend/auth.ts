import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // 1. Google Provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account', // Memaksa Google selalu menampilkan layar pilih akun
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // 2. Credentials Provider (Login Manual Email & Password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Konversi email input menjadi huruf kecil semua sebelum dibandingkan
        const inputEmail = (credentials?.email as string)?.toLowerCase();

        if (inputEmail === 'admin@marlibu.com' && credentials?.password === 'admin123') {
          return { id: '1', name: 'Admin Marlibu', email: 'admin@marlibu.com', role: 'admin' };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Jika login lewat Google, default-kan role sebagai 'user' (atau 'admin' sesuai kebutuhan)
        token.role = (user as any).role || 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});