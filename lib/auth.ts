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
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.bikfayalist.com' : undefined
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
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.lastLogin = Date.now()
      }
      
      // Add security checks for JWT
      if (token.lastLogin && Date.now() - (token.lastLogin as number) > 7 * 24 * 60 * 60 * 1000) {
        // Force re-authentication if token is older than 7 days
        return {}
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
        
        // Add session security metadata
        session.lastLogin = token.lastLogin as number
        session.expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Additional security checks during sign in
      if (!user.email) {
        return false
      }
      
      // Log successful sign in for audit
      console.log('SECURITY_LOG: User signed in', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString(),
        provider: account?.provider || 'credentials'
      })
      
      return true
    },
  },
})