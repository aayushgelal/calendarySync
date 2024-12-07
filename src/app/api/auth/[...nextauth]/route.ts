import { NextAuthOptions } from '@/utils/authOptions';
import NextAuth from 'next-auth'


 
const handler = NextAuth(NextAuthOptions)

export const {GET, POST} = handler;