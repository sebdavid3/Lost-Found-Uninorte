const { PrismaClient, ObjectCategory, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const SHELVES = [
  'Estante 1 - Caja 3', 'Estante 1 - Caja 7', 'Estante 2 - Caja 1',
  'Estante 2 - Caja 4', 'Estante 2 - Caja 9', 'Estante 3 - Caja 2',
  'Estante 3 - Caja 6', 'Estante 3 - Bandeja A', 'Estante 4 - Caja 5',
  'Estante 4 - Bandeja B', 'Armario A - Gaveta 1', 'Armario A - Gaveta 2',
  'Armario B - Gaveta 3', 'Armario B - Gaveta 4', 'Vitrina 1 - Repisa Superior',
  'Vitrina 1 - Repisa Inferior', 'Vitrina 2 - Repisa Media', 'Caja Fuerte - Compartimento 1',
  'Depósito - Contenedor Plástico', 'Archivador - Cajón 3',
];

const BLOCKS = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];

const PHOTOS = {
  ELECTRONIC: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', // laptop
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    'https://images.unsplash.com/photo-1523275335684-378165a8f674?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe81d2?w=800&q=80',
  ],
  COMMON: [
    'https://images.unsplash.com/photo-1574082585141-a2d7d3b5e75e?w=800&q=80',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&q=80',
    'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&q=80',
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
    'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&q=80',
  ],
  CLOTHING: [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80',
    'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=800&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607ecce0f?w=800&q=80',
  ],
  STATIONERY: [
    'https://images.unsplash.com/photo-1564473185935-5da3a76a6e21?w=800&q=80',
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&q=80',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80',
    'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80',
    'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&q=80',
    'https://images.unsplash.com/photo-1614883580889-c44cd903ff60?w=800&q=80',
  ],
  DOCUMENT: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80',
    'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=800&q=80',
    'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    'https://images.unsplash.com/photo-1574492543172-b37ab0de758c?w=800&q=80',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
  ],
  ACCESSORY: [
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
    'https://images.unsplash.com/photo-1505751171710-1f8899e5bc32?w=800&q=80',
    'https://images.unsplash.com/photo-1594223274512-4804e81d2fe0?w=800&q=80',
    'https://images.unsplash.com/photo-1611599542714-5f0ed95dda39?w=800&q=80',
    'https://images.unsplash.com/photo-1617886320525-4a5ba5c40080?w=800&q=80',
    'https://images.unsplash.com/photo-1621601412455-761faf22e784?w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
  ],
  OTHER: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
    'https://images.unsplash.com/photo-1505632952511-fea0e1863a74?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=800&q=80',
    'https://images.unsplash.com/photo-1505632952511-fea0e1863a74?w=800&q=80',
  ],
};

const OBJECT_DEFS = [
  // ELECTRONIC
  { name: 'MacBook Pro M1', description: 'Laptop Apple MacBook Pro chip M1, gris espacial, stickers en tapa trasera.', category: 'ELECTRONIC', location: 'Biblioteca 2do Piso' },
  { name: 'Cargador USB-C Samsung', description: 'Cargador rápido 25W con cable USB-C, color blanco.', category: 'ELECTRONIC', location: 'Sala de Estudio - Bloque B' },
  { name: 'iPad Air 2023', description: 'iPad Air 5ta generación, color azul, funda magnética gris, Apple Pencil incluido.', category: 'ELECTRONIC', location: 'Biblioteca 3er Piso' },
  { name: 'Smartwatch Galaxy Watch', description: 'Reloj inteligente Samsung Galaxy Watch, correa negra.', category: 'ELECTRONIC', location: 'Gimnasio' },
  { name: 'Audífonos Sony WH-1000XM4', description: 'Audífonos over-ear con cancelación de ruido, estuche incluido.', category: 'ELECTRONIC', location: 'Lab de Sistemas - Bloque J' },
  { name: 'iPhone 14 Pro', description: 'Teléfono iPhone 14 Pro, color morado, funda transparente.', category: 'ELECTRONIC', location: 'Cafetería Bloque K' },
  { name: 'Cable HDMI 2.1', description: 'Cable HDMI de 3 metros, compatible con 4K 120Hz.', category: 'ELECTRONIC', location: 'Auditorio Central' },
  { name: 'Teclado Mecánico Logitech', description: 'Teclado mecánico inalámbrico MX Keys, retroiluminado.', category: 'ELECTRONIC', location: 'Sala de Profesores - Bloque G' },
  { name: 'Memoria USB Kingston 64GB', description: 'Memoria USB 3.0 Kingston 64GB, carcasa metálica plateada.', category: 'ELECTRONIC', location: 'Lab de Sistemas - Bloque J' },
  // COMMON
  { name: 'Termo Contigo Azul', description: 'Termo acero inoxidable Contigo 500ml, azul marino.', category: 'COMMON', location: 'Cafetería Bloque K' },
  { name: 'Botella de Agua HydroFlask', description: 'Botella térmica HydroFlask 32oz, verde menta, stickers personalizados.', category: 'COMMON', location: 'Gimnasio' },
  { name: 'Paraguas Negro', description: 'Paraguas compacto automático, negro, marca Totto.', category: 'COMMON', location: 'Entrada Principal - Portería' },
  { name: 'Mochila Jansport Gris', description: 'Mochila Jansport Big Student, gris oscuro, cierre frontal dañado.', category: 'COMMON', location: 'Biblioteca 1er Piso' },
  { name: 'Lentes de Sol Ray-Ban', description: 'Gafas de sol Ray-Ban Aviator, cristales verdes, estuche de cuero.', category: 'COMMON', location: 'Zona Verde - Malecón' },
  { name: 'Lonchera Térmica', description: 'Lonchera azul rectangular con compartimentos internos.', category: 'COMMON', location: 'Comedor Estudiantil' },
  { name: 'Estuche de Lápices', description: 'Estuche de tela con cierre, contiene 12 lápices de colores Faber-Castell.', category: 'COMMON', location: 'Salón 7G - Bloque G' },
  { name: 'Botella de Vidrio', description: 'Botella de vidrio reutilizable con funda de silicona rosada.', category: 'COMMON', location: 'Plazoleta Central' },
  // CLOTHING
  { name: 'Chaqueta Deportiva Nike', description: 'Chaqueta deportiva Nike negra, logo blanco, talla M.', category: 'CLOTHING', location: 'Coliseo Deportivo' },
  { name: 'Camiseta Uninorte', description: 'Camiseta institucional Uninorte, talla L, color rojo.', category: 'CLOTHING', location: 'Cancha de Fútbol' },
  { name: 'Tenis Nike Air Max', description: 'Tenis Nike Air Max 270, color blanco/negro, talla 42.', category: 'CLOTHING', location: 'Gimnasio' },
  { name: 'Sudadera Gris Under Armour', description: 'Sudadera con capucha gris, talla M, con bolsillo canguro.', category: 'CLOTHING', location: 'Sala de Estudio - Bloque B' },
  { name: 'Gorra Uninorte', description: 'Gorra azul marino bordada con logo de Uninorte, ajustable.', category: 'CLOTHING', location: 'Biblioteca 2do Piso' },
  { name: 'Bufanda Roja', description: 'Bufanda de lana roja con rayas grises.', category: 'CLOTHING', location: 'Auditorio Central' },
  { name: 'Saco de Compresión', description: 'Saco deportivo de compresión, negro, manga larga.', category: 'CLOTHING', location: 'Coliseo Deportivo' },
  // STATIONERY
  { name: 'Calculadora Científica Casio', description: 'Casio FX-991, negra, "Luis R." escrito con marcador atrás.', category: 'STATIONERY', location: 'Salón 7G - Bloque G' },
  { name: 'Cuaderno Universitario', description: 'Cuaderno argollado 7 materias, pasta dura azul, apuntes de Cálculo.', category: 'STATIONERY', location: 'Biblioteca 3er Piso' },
  { name: 'Set de Colores Prismacolor', description: 'Estuche con 24 lápices de colores Prismacolor Premier.', category: 'STATIONERY', location: 'Salón 5B - Bloque B' },
  { name: 'Post-its de Colores', description: 'Paquete con 6 pads de sticky notes fluorescentes.', category: 'STATIONERY', location: 'Sala de Profesores - Bloque G' },
  { name: 'Lapiceros Pilot G2', description: 'Pack de 5 lapiceros gel Pilot G2, colores negro/azul/rojo.', category: 'STATIONERY', location: 'Dirección de Programa' },
  { name: 'Juego de Reglas', description: 'Escuadra, cartabón y regla de 30cm, plástico transparente.', category: 'STATIONERY', location: 'Salón 3F - Bloque F' },
  { name: 'Marcadores Resaltadores', description: 'Pack de 6 resaltadores Stabilo Boss colores pastel.', category: 'STATIONERY', location: 'Biblioteca 1er Piso' },
  // DOCUMENT
  { name: 'Carné Estudiantil', description: 'Carné Uninorte 2025-2, foto del estudiante.', category: 'DOCUMENT', location: 'Entrada Principal - Portería' },
  { name: 'Libro de Cálculo', description: 'Cálculo: Trascendentes Tempranas, Stewart 8va edición.', category: 'DOCUMENT', location: 'Biblioteca 2do Piso' },
  { name: 'Carpeta de Apuntes', description: 'Carpeta negra tamaño oficio con separadores de materias.', category: 'DOCUMENT', location: 'Salón 7G - Bloque G' },
  { name: 'Billetera de Cuero', description: 'Billetera de cuero café oscuro, contiene documentos personales.', category: 'DOCUMENT', location: 'Cafetería Central' },
  { name: 'Folder de Prácticas', description: 'Folder plástico con prácticas de laboratorio de Física.', category: 'DOCUMENT', location: 'Lab de Química - Bloque H' },
  { name: 'Libro de Programación', description: 'Clean Code de Robert C. Martin, edición en español.', category: 'DOCUMENT', location: 'Lab de Sistemas - Bloque J' },
  { name: 'Agenda Personal 2025', description: 'Agenda 2025, pasta de cuero sintético color rosado.', category: 'DOCUMENT', location: 'Pasillo Bloque D' },
  // ACCESSORY
  { name: 'Estuche AirPods Pro', description: 'Estuche AirPods Pro blanco, sin audífonos adentro.', category: 'ACCESSORY', location: 'Lab de Sistemas - Bloque J' },
  { name: 'Reloj de Pulsera Casio', description: 'Reloj analógico Casio dorado, correa de cuero café.', category: 'ACCESSORY', location: 'Cafetería Bloque A' },
  { name: 'Pulsera de Plata', description: 'Pulsera de plata 925 con dije de cruz.', category: 'ACCESSORY', location: 'Biblioteca 1er Piso' },
  { name: 'Anillo de Graduación', description: 'Anillo de graduación Uninorte, oro blanco, talla 8.', category: 'ACCESSORY', location: 'Edificio de Postgrados' },
  { name: 'Collar con Dije', description: 'Cadena de plata fina con dije de corazón.', category: 'ACCESSORY', location: 'Plazoleta Central' },
  { name: 'Power Bank 20000mAh', description: 'Batería externa Xiaomi 20000mAh, color negro, carga rápida.', category: 'ACCESSORY', location: 'Sala de Estudio - Bloque B' },
  { name: 'Audífonos Cableados JBL', description: 'Audífonos JBL con cable USB-C, micrófono y control incluidos.', category: 'ACCESSORY', location: 'Estacionamiento Norte' },
  // OTHER
  { name: 'Llaves con Llavero Uninorte', description: 'Juego de 3 llaves con llavero institucional Uninorte.', category: 'OTHER', location: 'Recepción Bloque A' },
  { name: 'Paraguas Compacto Azul', description: 'Paraguas compacto azul oscuro, apertura automática.', category: 'OTHER', location: 'Entrada Principal - Portería' },
  { name: 'Mochila Deportiva Adidas', description: 'Mochila pequeña deportiva Adidas, negra con rayas blancas.', category: 'OTHER', location: 'Coliseo Deportivo' },
  { name: 'Gafas de Sol Polarizadas', description: 'Gafas de sol polarizadas, marco negro mate, estuche rígido.', category: 'OTHER', location: 'Cancha de Fútbol' },
  { name: 'Taza de Cerámica', description: 'Taza de cerámica blanca con frase "Sí se puede".', category: 'OTHER', location: 'Sala de Profesores - Bloque G' },
  { name: 'Llavero de Programa', description: 'Llavero metálico del programa de Ingeniería de Sistemas.', category: 'OTHER', location: 'Dirección de Programa' },
  { name: 'Bolsa Reutilizable', description: 'Bolsa de tela reutilizable de la librería Uninorte.', category: 'OTHER', location: 'Comedor Estudiantil' },
];

async function ensureObject(data) {
  const existing = await prisma.object.findFirst({
    where: { name: data.name, category: data.category, location: data.location },
  });
  if (existing) return existing;
  return prisma.object.create({ data: { ...data, status: data.status || 'AVAILABLE' } });
}

async function ensureUser(data) {
  return prisma.user.upsert({ where: { email: data.email }, update: {}, create: data });
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  console.log('🌱 Iniciando seeder masivo...');

  const adminUser = await ensureUser({ email: 'admin@uninorte.edu.co', name: 'Administrador de Objetos', role: 'ADMIN' });
  console.log('✅ Admin:', adminUser.id);

  const students = [];
  const studentDefs = [
    { email: 'carre@uninorte.edu.co', name: 'Andrés Carrero' },
    { email: 'sebas@uninorte.edu.co', name: 'Sebastian Ibañez' },
    { email: 'maria@uninorte.edu.co', name: 'María García' },
    { email: 'juan@uninorte.edu.co', name: 'Juan Pérez' },
    { email: 'laura@uninorte.edu.co', name: 'Laura Martínez' },
    { email: 'carlos@uninorte.edu.co', name: 'Carlos Rodríguez' },
  ];

  for (const s of studentDefs) {
    const user = await ensureUser({ email: s.email, name: s.name, role: 'STUDENT' });
    students.push(user);
    console.log(`✅ Estudiante ${s.name}:`, user.id);
  }

  // ── Crear objetos ──
  console.log('\n🌱 Creando objetos con ubicación de almacenamiento...');
  const objects = [];
  for (let i = 0; i < OBJECT_DEFS.length; i++) {
    const def = OBJECT_DEFS[i];
    const photoIndex = i % PHOTOS[def.category].length;
    const storageLocation = SHELVES[i % SHELVES.length];
    const obj = await ensureObject({
      ...def,
      photo: PHOTOS[def.category][photoIndex],
      storageLocation,
      foundAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    });
    objects.push(obj);
    if ((i + 1) % 10 === 0) console.log(`   ${i + 1}/${OBJECT_DEFS.length} objetos...`);
  }
  console.log(`✅ ${objects.length} objetos creados con ubicaciones de almacenamiento.`);

  // ── Crear claims ──
  console.log('\n🌱 Creando claims de prueba con ubicación de pérdida...');
  await prisma.evidence.deleteMany({});
  await prisma.claim.deleteMany({});

  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'PENDING', 'APPROVED', 'REJECTED', 'PENDING', 'PENDING'];
  const rejectionReasons = [
    null, null,
    'La descripción del objeto no coincide con las evidencias aportadas.',
    null, null,
    'El número de serie proporcionado no corresponde al artículo encontrado.',
    null, null,
  ];

  let createdClaims = 0;
  for (let i = 0; i < Math.min(objects.length, 35); i++) {
    const obj = objects[i];
    const student = students[i % students.length];
    const status = statuses[i % statuses.length];
    const rejectionReason = status === 'REJECTED'
      ? (rejectionReasons[i % rejectionReasons.length] || 'Evidencias insuficientes.')
      : null;

    const lostLocation = Math.random() > 0.3 ? `Bloque ${pick(BLOCKS)}` : null;

    let evidenceData;
    if (obj.category === 'ELECTRONIC') {
      evidenceData = [
        { type: 'SERIAL_NUMBER', description: `Número de serie: SN${String(i + 1000).padStart(8, '0')}.` },
        { type: 'DIGITAL_INVOICE', url: `https://invoice-storage.uninorte.edu.co/invoices/inv-${9000 + i}.pdf`, description: 'Factura de compra adjunta.' },
      ];
    } else if (obj.category === 'DOCUMENT') {
      evidenceData = [
        { type: 'DETAILED_DESCRIPTION', description: `Reconozco el ${obj.name.toLowerCase()} por detalles específicos.` },
        { type: 'REFERENCE_PHOTO', url: PHOTOS.DOCUMENT[i % PHOTOS.DOCUMENT.length], description: 'Foto de referencia.' },
      ];
    } else {
      evidenceData = [
        { type: 'DETAILED_DESCRIPTION', description: `El objeto ${obj.name.toLowerCase()} me pertenece. Puedo describir marcas y detalles.` },
        { type: 'LOCATION_DETAIL', description: `Frecuento ${obj.location} y recuerdo haberlo dejado allí.` },
      ];
    }

    try {
      await prisma.claim.create({
        data: {
          status,
          userId: student.id,
          objectId: obj.id,
          rejectionReason,
          lostLocation,
          evidences: { create: evidenceData },
        },
      });
      createdClaims++;
    } catch (e) { /* skip duplicates */ }
  }
  console.log(`✅ ${createdClaims} claims creados.`);

  // ── Claims extra ──
  const extraClaims = Array.from({ length: 10 }, () => ({
    obj: objects[Math.floor(Math.random() * objects.length)],
    student: students[Math.floor(Math.random() * students.length)],
    status: Math.random() > 0.5 ? 'PENDING' : 'APPROVED',
  }));

  let extraCreated = 0;
  for (const { obj, student, status } of extraClaims) {
    try {
      await prisma.claim.create({
        data: {
          status,
          userId: student.id,
          objectId: obj.id,
          lostLocation: Math.random() > 0.4 ? `Bloque ${pick(BLOCKS)}` : null,
          evidences: {
            create: [{ type: 'DETAILED_DESCRIPTION', description: 'Descripción detallada del objeto reclamado.' }],
          },
        },
      });
      extraCreated++;
    } catch (e) { /* skip */ }
  }
  console.log(`✅ ${extraCreated} claims extra creados.`);

  // ── Resumen ──
  const totalClaims = createdClaims + extraCreated;
  const pending = await prisma.claim.count({ where: { status: 'PENDING' } });
  const approved = await prisma.claim.count({ where: { status: 'APPROVED' } });
  const rejected = await prisma.claim.count({ where: { status: 'REJECTED' } });

  console.log(`\n📊 RESUMEN:`);
  console.log(`   👤 Usuarios: ${1 + students.length}`);
  console.log(`   📦 Objetos: ${objects.length} (con ubicación de almacenamiento)`);
  console.log(`   📋 Claims: ${totalClaims} (con ubicación de pérdida opcional)`);
  console.log(`   ⏳ Pendientes: ${pending} | ✅ Aprobados: ${approved} | ❌ Rechazados: ${rejected}`);
  console.log('\n🌱 Seeder completado con éxito.');
}

main()
  .catch((error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      console.error('La base de datos aún no tiene las tablas. Ejecuta `npx prisma migrate deploy`.');
    }
    console.error(error);
    process.exit(1);
  })
  .finally(async () => { await prisma.$disconnect(); });
