import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Fetch regions error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, slot } = await request.json();

    if (!name || slot === undefined) {
      return NextResponse.json({ error: 'Nama dan slot wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.region.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json({ error: 'Wilayah ini sudah ada' }, { status: 400 });
    }

    const region = await prisma.region.create({
      data: {
        name,
        slot: parseInt(slot) || 0,
      },
    });

    return NextResponse.json(region, { status: 201 });
  } catch (error) {
    console.error('Create region error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
