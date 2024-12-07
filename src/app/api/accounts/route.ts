import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from '@/utils/authOptions';


export async function GET() {
  const session = await getServerSession(NextAuthOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      provider: true,
      email: true,
      isSubAccount: true,
    },
    orderBy: [
      { isSubAccount: 'asc' }, // Main accounts first
      { email: 'asc' }, // Then alphabetically by email
    ],
  })

  return NextResponse.json(accounts)
}