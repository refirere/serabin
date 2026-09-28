import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trashTypes = await prisma.trashType.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(trashTypes);
  } catch (error) {
    console.error('Fetch trash types error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, slot, pricePerKg, description } = await request.json();

    if (!name || slot === undefined || pricePerKg === undefined) {
      return NextResponse.json({ error: 'Nama, slot, dan harga per kg wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.trashType.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'Jenis sampah ini sudah ada' }, { status: 400 });
    }

    const trashType = await prisma.trashType.create({
      data: {
        name,
        slot: parseInt(slot) || 0,
        pricePerKg: parseFloat(pricePerKg) || 0,
        description,
      },
    });

    return NextResponse.json(trashType, { status: 201 });
  } catch (error) {
    console.error('Create trash type error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}