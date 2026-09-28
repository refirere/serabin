import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Create Admin User
    const adminEmail = 'admin@serabin.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'Admin Serabin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ Admin user created! (admin@serabin.com / admin123)');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Create Trash Types with price per kg
    const trashTypes = [
      { name: 'Organik', slot: 10, pricePerKg: 2000, description: 'Sampah organik seperti sisa makanan, daun, sayur, dan buah.' },
      { name: 'Anorganik', slot: 5, pricePerKg: 5000, description: 'Sampah anorganik seperti plastik, botol, kaleng, logam, dan kaca.' },
      { name: 'B3', slot: 2, pricePerKg: 15000, description: 'Bahan Berbahaya dan Beracun seperti baterai, bohlam, dan limbah medis.' },
      { name: 'Kertas', slot: 0, pricePerKg: 3000, description: 'Kertas bekas, karton, koran, dan kardus. (Slot Habis)' },
    ];

    for (const type of trashTypes) {
      await prisma.trashType.upsert({
        where: { name: type.name },
        update: { 
          slot: type.slot, 
          pricePerKg: type.pricePerKg,
          description: type.description 
        },
        create: { 
          name: type.name, 
          slot: type.slot, 
          pricePerKg: type.pricePerKg,
          description: type.description 
        },
      });
    }
    console.log('✅ Trash types seeded!');

    // 3. Create Regions
    const regions = [
      { name: 'Jakarta Selatan', slot: 15 },
      { name: 'Jakarta Barat', slot: 8 },
      { name: 'Jakarta Timur', slot: 0 },
      { name: 'Jakarta Utara', slot: 12 },
      { name: 'Jakarta Pusat', slot: 10 },
    ];

    for (const reg of regions) {
      await prisma.region.upsert({
        where: { name: reg.name },
        update: { slot: reg.slot },
        create: { name: reg.name, slot: reg.slot },
      });
    }
    console.log('✅ Regions seeded!');

    // 4. Create Weight settings
    await prisma.weightSetting.upsert({
      where: { id: 1 },
      update: { 
        minWeight: 0.5, 
        maxWeight: 50.0 
      },
      create: { 
        id: 1, 
        minWeight: 0.5, 
        maxWeight: 50.0 
      },
    });
    console.log('✅ Weight settings seeded!');

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });