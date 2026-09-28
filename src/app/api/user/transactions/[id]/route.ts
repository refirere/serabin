import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getSessionUser } from '../../../../../lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { paymentMethod } = await request.json(); // "BCA" atau "SEABANK"

    if (!paymentMethod || (paymentMethod !== 'BCA' && paymentMethod !== 'SEABANK')) {
      return NextResponse.json(
        { error: 'Pilih metode pembayaran yang valid (BCA atau SEABANK)' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    if (transaction.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Transaksi tidak dalam status PENDING' },
        { status: 400 }
      );
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentMethod,
        status: 'WAITING_VERIFICATION',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Submit user payment error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
