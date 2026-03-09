import { PrismaClient, ObjectCategory } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { getDatabaseUrl } from '../src/prisma/database.config';

const pool = new Pool({ connectionString: getDatabaseUrl() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seeder...');

  // 1. Crear un usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'estudiante@uninorte.edu.co' },
    update: {},
    create: {
      email: 'estudiante@uninorte.edu.co',
      name: 'Estudiante de Prueba',
      role: 'STUDENT',
    },
  });
  console.log('✅ Usuario creado:', user.id);

  // 2. Crear Objeto Electrónico (CON FOTO)
  const electronicObject = await prisma.object.create({
    data: {
      description: 'MacBook Pro M1',
      category: ObjectCategory.ELECTRONIC,
      location: 'Biblioteca 2do Piso',
      photo: 'https://example.com/macbook.jpg', 
    },
  });
  console.log('✅ Objeto Electrónico creado:', electronicObject.id);

  // 3. Crear Objeto Común (SIN FOTO, para probar la regla crítica)
  const commonObjectNoPhoto = await prisma.object.create({
    data: {
      description: 'Termo Contigo Azul',
      category: ObjectCategory.COMMON,
      location: 'Cafetería Bloque K',
      photo: '', // Sin foto intencionalmente
    },
  });
  console.log('✅ Objeto Común (Sin foto) creado:', commonObjectNoPhoto.id);

  console.log('🌱 Seeding completado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
