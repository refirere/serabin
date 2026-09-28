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
    const { name, slot, description } = await request.json();

    if (!name || slot === undefined) {
      return NextResponse.json({ error: 'Nama dan slot wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.trashType.findFirst({
      where: {
        name,
        id: { not: id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Nama jenis sampah sudah digunakan' }, { status: 400 });
    }

    const updated = await prisma.trashType.update({
      where: { id },
      data: {
        name,
        slot: parseInt(slot) || 0,
        description,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update trash type error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const referenced = await prisma.transaction.findFirst({
      where: { trashTypeId: id },
    });

    if (referenced) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus jenis sampah ini karena sudah memiliki transaksi terkait' },
        { status: 400 }
      );
    }

    await prisma.trashType.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Jenis sampah berhasil dihapus' });
  } catch (error) {
    console.error('Delete trash type error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
