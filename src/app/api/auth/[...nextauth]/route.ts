import { NextAuthOptions } from '@/utils/authOptions';
import NextAuth from 'next-auth'

const handler = NextAuth(NextAuthOptions)

export { handler as GET, handler as POST };