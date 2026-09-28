import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getSessionUser } from '../../../../../lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        trashType: true,
        region: true,
        trashPhoto: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    if (transaction.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (transaction.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Transaksi belum selesai' }, { status: 400 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Invoice error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}