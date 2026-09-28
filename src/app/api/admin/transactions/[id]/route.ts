import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getSessionUser } from '../../../../../lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await request.json(); // "APPROVE" atau "REJECT"

    if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
      return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    if (transaction.status !== 'WAITING_VERIFICATION') {
      return NextResponse.json(
        { error: 'Transaksi tidak sedang menunggu verifikasi' },
        { status: 400 }
      );
    }

    let updatedTransaction;

    if (action === 'APPROVE') {
      updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          status: 'APPROVED',
          paymentStatus: 'PAID',
        },
      });
    } else {
      // Rejection: increment slots back
      updatedTransaction = await prisma.$transaction(async (tx) => {
        // Balikin slot jenis sampah
        await tx.trashType.update({
          where: { id: transaction.trashTypeId },
          data: { slot: { increment: 1 } },
        });

        // Balikin slot wilayah
        await tx.region.update({
          where: { id: transaction.regionId },
          data: { slot: { increment: 1 } },
        });

        // Update status transaksi
        return tx.transaction.update({
          where: { id },
          data: {
            status: 'REJECTED',
          },
        });
      });
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction status error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
