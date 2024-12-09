import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const beta = await prisma.beta.create({
    data: {
      email,
    },
  });
  return NextResponse.json({sucess:true},{status:200});
}