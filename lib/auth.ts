import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { prisma } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Trust the configured NEXTAUTH_URL in production
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Update session every hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // JWT expires in 24 hours
  },
  pages: {
    signIn: "/auth/signin"
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user) {
          return null
        }

        // Verify password using bcrypt (all users now have hashed passwords)
        if (!user.password) {
          console.error('SECURITY WARNING: User has no password hash:', user.email)
          return null
        }

        const isPasswordValid = await compare(credentials.password as string, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback:', { 
        hasUser: !!user, 
        tokenSub: token.sub, 
        userRole: user?.role,
        tokenRole: token.role
      })
      
      if (user) {
        token.role = user.role
        console.log('JWT: Setting role to', user.role)
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback:', {
        hasToken: !!token,
        tokenSub: token?.sub,
        tokenRole: token?.role,
        sessionUserId: session?.user?.id
      })
      
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
        console.log('Session: Set user ID and role', token.sub, token.role)
      }
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('SignIn Callback:', {
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        provider: account?.provider
      })
      return true
    }
  },
  events: {
    async signOut(message) {
      console.log('SignOut Event:', {
        message: message,
        timestamp: new Date().toISOString()
      })
    },
    async session(message) {
      console.log('Session Event:', {
        message: message,
        timestamp: new Date().toISOString()
      })
    }
  },
})