import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: { scope: 'read:user user:email repo' }
      }
    }),
    CredentialsProvider({
      id: "access-code",
      name: "One-Time Access Code",
      credentials: {
        code: { label: "Access Code", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.code) return null;
        
        try {
          // Use the code as a PAT to fetch the user profile
          const res = await fetch("https://api.github.com/user", {
            headers: {
              "Authorization": `Bearer ${credentials.code}`,
              "Accept": "application/vnd.github.v3+json"
            }
          });

          if (!res.ok) return null;

          const user = await res.json();
          return {
            id: user.id.toString(),
            name: user.name || user.login,
            email: user.email,
            image: user.avatar_url,
            accessToken: credentials.code // Map code directly to accessToken
          };
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }: { token: any, account: any, user: any }) {
      if (account) {
        token.accessToken = account.access_token || user?.accessToken;
      }
      return token;
    },
    async session({ session, token }: { session: any, token: any }) {
      session.accessToken = token.accessToken;
      return session;
    }
  },
  session: { strategy: "jwt" }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
