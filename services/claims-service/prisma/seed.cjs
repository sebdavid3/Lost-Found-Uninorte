const { PrismaClient, ObjectCategory, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();


async function ensureObject(data) {
  const existing = await prisma.object.findFirst({
    where: {
      name: data.name,
      category: data.category,
      location: data.location,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.object.create({ data: { ...data, status: data.status || 'AVAILABLE' } });
}

async function ensureUser(data) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: data,
  });
}

async function main() {
  console.log('🌱 Iniciando seeder de objetos...');

  // ── Usuarios ──
  const adminUser = await ensureUser({
    email: 'admin@uninorte.edu.co',
    name: 'Administrador de Objetos',
    role: 'ADMIN',
  });
  console.log('✅ Admin listo:', adminUser.id);

  const student1 = await ensureUser({
    email: 'carre@uninorte.edu.co',
    name: 'Andrés Carrero',
    role: 'STUDENT',
  });
  console.log('✅ Estudiante 1 listo:', student1.id);

  const student2 = await ensureUser({
    email: 'sebas@uninorte.edu.co',
    name: 'Sebastian Ibañez',
    role: 'STUDENT',
  });
  console.log('✅ Estudiante 2 listo:', student2.id);

  // ── Objetos ──
  const electronicObject = await ensureObject({
    name: 'MacBook Pro M1',
    description: 'Laptop Apple MacBook Pro con chip M1, color gris espacial. Tiene stickers en la tapa trasera.',
    category: ObjectCategory.ELECTRONIC,
    location: 'Biblioteca 2do Piso',
    photo: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto electrónico listo:', electronicObject.id);

  const commonObject = await ensureObject({
    name: 'Termo Contigo Azul',
    description: 'Termo de acero inoxidable marca Contigo, color azul marino, capacidad 500ml.',
    category: ObjectCategory.COMMON,
    location: 'Cafetería Bloque K',
    photo: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto común listo:', commonObject.id);

  const clothingObject = await ensureObject({
    name: 'Chaqueta Deportiva Nike',
    description: 'Chaqueta deportiva Nike color negro con logo blanco, talla M. Encontrada en el respaldo de una silla.',
    category: ObjectCategory.CLOTHING,
    location: 'Coliseo Deportivo',
    photo: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto ropa listo:', clothingObject.id);

  const stationeryObject = await ensureObject({
    name: 'Calculadora Científica Casio',
    description: 'Calculadora científica Casio FX-991, color negro. Tiene el nombre "Luis R." escrito con marcador en la parte trasera.',
    category: ObjectCategory.STATIONERY,
    location: 'Salón 7G - Bloque G',
    photo: 'https://images.unsplash.com/photo-1564473185935-5da3a76a6e21?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto papelería listo:', stationeryObject.id);

  const documentObject = await ensureObject({
    name: 'Carné Estudiantil',
    description: 'Carné estudiantil de la Universidad del Norte, semestre 2025-2. Tiene foto del estudiante.',
    category: ObjectCategory.DOCUMENT,
    location: 'Entrada Principal - Portería',
    photo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto documento listo:', documentObject.id);

  const accessoryObject = await ensureObject({
    name: 'Audífonos AirPods Pro',
    description: 'Estuche de audífonos AirPods Pro de Apple, color blanco. Encontrado sin los audífonos adentro.',
    category: ObjectCategory.ACCESSORY,
    location: 'Laboratorio de Sistemas - Bloque J',
    photo: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto accesorio listo:', accessoryObject.id);

  const otherObject = await ensureObject({
    name: 'Llaves con Llavero Uninorte',
    description: 'Juego de 3 llaves con un llavero institucional de Uninorte. Una llave parece ser de candado.',
    category: ObjectCategory.OTHER,
    location: 'Recepción Bloque A',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto otro listo:', otherObject.id);

  const electronic2 = await ensureObject({
    name: 'Cargador USB-C Samsung',
    description: 'Cargador de pared Samsung con cable USB-C, carga rápida 25W. Color blanco.',
    category: ObjectCategory.ELECTRONIC,
    location: 'Sala de Estudio - Bloque B',
    photo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80',
  });
  console.log('✅ Objeto electrónico 2 listo:', electronic2.id);

  console.log('🌱 Seeder completado con éxito. Total: 8 objetos, 3 usuarios.');
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
  });
