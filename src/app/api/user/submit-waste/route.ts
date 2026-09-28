import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trashTypeId, regionId, weight, photoBase64 } = await request.json();

    if (!trashTypeId || !regionId || !weight || !photoBase64) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      return NextResponse.json(
        { error: 'Berat harus berupa angka positif' },
        { status: 400 }
      );
    }

    // 1. Fetch weight settings and validate weight limits
    const weightSetting = await prisma.weightSetting.findUnique({
      where: { id: 1 },
    });

    const minWeight = weightSetting?.minWeight ?? 0.5;
    const maxWeight = weightSetting?.maxWeight ?? 50.0;

    if (numericWeight < minWeight || numericWeight > maxWeight) {
      return NextResponse.json(
        { error: `Berat harus di antara ${minWeight} kg dan ${maxWeight} kg` },
        { status: 400 }
      );
    }

    // 2. Fetch trash type & region, check slots
    const trashType = await prisma.trashType.findUnique({
      where: { id: trashTypeId },
    });

    if (!trashType) {
      return NextResponse.json({ error: 'Jenis sampah tidak valid' }, { status: 400 });
    }

    if (trashType.slot <= 0) {
      return NextResponse.json({ error: 'Slot untuk jenis sampah ini telah habis' }, { status: 400 });
    }

    const region = await prisma.region.findUnique({
      where: { id: regionId },
    });

    if (!region) {
      return NextResponse.json({ error: 'Wilayah tidak valid' }, { status: 400 });
    }

    if (region.slot <= 0) {
      return NextResponse.json({ error: 'Slot untuk wilayah ini telah habis' }, { status: 400 });
    }

    // 3. Calculate total price
    const totalPrice = numericWeight * trashType.pricePerKg;

    // 4. Create transaction & photo, decrement slots in a transactional block
    const newTransaction = await prisma.$transaction(async (tx) => {
      // Decrement trash type slot
      await tx.trashType.update({
        where: { id: trashTypeId },
        data: { slot: { decrement: 1 } },
      });

      // Decrement region slot
      await tx.region.update({
        where: { id: regionId },
        data: { slot: { decrement: 1 } },
      });

      // Create TrashPhoto
      const photo = await tx.trashPhoto.create({
        data: {
          imageUrl: photoBase64,
        },
      });

      // Generate unique transaction number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(1000 + Math.random() * 9000);
      const transactionNumber = `SRB-${dateStr}-${rand}`;

      // Create transaction with totalPrice
      return tx.transaction.create({
        data: {
          transactionNumber,
          userId: user.id,
          trashTypeId,
          regionId,
          weight: numericWeight,
          totalPrice: totalPrice,
          trashPhotoId: photo.id,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
        },
        include: {
          trashType: true,
          region: true,
          trashPhoto: true,
        },
      });
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error: any) {
    console.error('Submit waste error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}