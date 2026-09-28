import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await prisma.weightSetting.findUnique({
      where: { id: 1 },
    });

    if (!setting) {
      return NextResponse.json({ minWeight: 0.5, maxWeight: 50.0 });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Fetch weight setting error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { minWeight, maxWeight } = await request.json();

    if (minWeight === undefined || maxWeight === undefined) {
      return NextResponse.json({ error: 'Berat minimal dan maksimal wajib diisi' }, { status: 400 });
    }

    const min = parseFloat(minWeight);
    const max = parseFloat(maxWeight);

    if (isNaN(min) || isNaN(max)) {
      return NextResponse.json({ error: 'Nilai berat harus berupa angka' }, { status: 400 });
    }

    if (min < 0 || max < 0) {
      return NextResponse.json({ error: 'Nilai berat tidak boleh negatif' }, { status: 400 });
    }

    if (min >= max) {
      return NextResponse.json({ error: 'Berat minimal harus lebih kecil dari berat maksimal' }, { status: 400 });
    }

    const updated = await prisma.weightSetting.upsert({
      where: { id: 1 },
      update: { minWeight: min, maxWeight: max },
      create: { id: 1, minWeight: min, maxWeight: max },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update weight setting error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
