import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalTransactions, pendingTransactions, approvedTransactions, rejectedTransactions, totalWeight, recentTransactions] = await Promise.all([
      prisma.transaction.count({ where: { userId: user.id } }),
      prisma.transaction.count({ where: { userId: user.id, status: { in: ['PENDING', 'WAITING_VERIFICATION'] } } }),
      prisma.transaction.count({ where: { userId: user.id, status: 'APPROVED' } }),
      prisma.transaction.count({ where: { userId: user.id, status: 'REJECTED' } }),
      prisma.transaction.aggregate({
        where: { userId: user.id, status: 'APPROVED' },
        _sum: { weight: true },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          trashType: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalTransactions,
        pendingTransactions,
        approvedTransactions,
        rejectedTransactions,
        totalWeight: totalWeight._sum.weight || 0,
      },
      recentTransactions,
    });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}