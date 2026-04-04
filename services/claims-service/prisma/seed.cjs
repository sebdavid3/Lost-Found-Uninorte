const { PrismaClient, ObjectCategory, Prisma } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
    throw new Error(
      'DATABASE_URL no esta configurada. Define DATABASE_URL antes de ejecutar el seeder.',
    );
  }

  return databaseUrl;
}

const pool = new Pool({ connectionString: getDatabaseUrl() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function ensureObject(data) {
  const existing = await prisma.object.findFirst({
    where: {
      description: data.description,
      category: data.category,
      location: data.location,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.object.create({ data });
}

async function main() {
  console.log('🌱 Iniciando seeder de objetos...');

  const user = await prisma.user.upsert({
    where: { email: 'estudiante@uninorte.edu.co' },
    update: {},
    create: {
      email: 'estudiante@uninorte.edu.co',
      name: 'Estudiante de Prueba',
      role: 'STUDENT',
    },
  });

  console.log('✅ Usuario listo:', user.id);

  const electronicObject = await ensureObject({
    description: 'MacBook Pro M1',
    category: ObjectCategory.ELECTRONIC,
    location: 'Biblioteca 2do Piso',
    photo: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
  });

  console.log('✅ Objeto electrónico listo:', electronicObject.id);

  const commonObject = await ensureObject({
    description: 'Termo Contigo Azul',
    category: ObjectCategory.COMMON,
    location: 'Cafetería Bloque K',
    photo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
  });

  console.log('✅ Objeto común listo:', commonObject.id);
  console.log('🌱 Seeder completado.');
}

main()
  .catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      console.error(
        'La base de datos aun no tiene las tablas. Ejecuta `npx prisma migrate deploy` antes del seeder.',
      );
    }

    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
