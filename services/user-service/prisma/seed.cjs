const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'admin@uninorte.edu.co', name: 'Administrador', role: 'ADMIN' },
    { email: 'carre@uninorte.edu.co', name: 'Andrés Carrero', role: 'STUDENT' },
    { email: 'sebas@uninorte.edu.co', name: 'Sebastian Ibañez', role: 'STUDENT' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  console.log('✅ Users seeded successfully.');
}

main()
  .catch(console.error)
  .finally(async () => { await prisma.$disconnect(); });
