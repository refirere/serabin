import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [totalUsers, totalTransactions, pendingVerifications, approvedTransactions, rejectedTransactions, totalRevenue, trashTypesCount, regionsCount, recentTransactions] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'WAITING_VERIFICATION' } }),
      prisma.transaction.count({ where: { status: 'APPROVED' } }),
      prisma.transaction.count({ where: { status: 'REJECTED' } }),
      prisma.transaction.aggregate({
        where: { status: 'APPROVED' },
        _sum: { totalPrice: true },
      }),
      prisma.trashType.count(),
      prisma.region.count(),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          trashType: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTransactions,
        pendingVerifications,
        approvedTransactions,
        rejectedTransactions,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        trashTypesCount,
        regionsCount,
      },
      recentTransactions,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}