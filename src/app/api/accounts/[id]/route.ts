import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NextAuthOptions } from "@/utils/authOptions";
import { prisma } from "@/lib/prisma";
import { invalidateAccount } from "@/lib/invalidateAccount";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(NextAuthOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the account to verify ownership and get details for invalidation
    const account = await prisma.account.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Don't allow deleting the primary account
    if (!account.isSubAccount) {
      return NextResponse.json(
        { error: "Cannot delete primary account" },
        { status: 400 }
      );
    }

    // First invalidate the account (this will clean up syncs and webhooks)
    await invalidateAccount({
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      userId: session.user.id,
    });

    // Delete all calendar syncs associated with this account
    await prisma.$transaction([
      // Delete syncs where this account is the source
      prisma.calendarSync.deleteMany({
        where: {
          sourceAccountId: id,
        },
      }),
      // Delete syncs where this account is the target
      prisma.calendarSync.deleteMany({
        where: {
          targetAccountId: id,
        },
      }),
      // Finally delete the account
      prisma.account.delete({
        where: {
          id: id,
        },
      }),
    ]);

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
} 