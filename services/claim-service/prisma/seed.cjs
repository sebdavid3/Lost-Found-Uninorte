const { PrismaClient } = require('@prisma/client');
const http = require('http');
const prisma = new PrismaClient();

const USER_API = process.env.USER_SERVICE_URL || 'http://user-service:3002';
const OBJECT_API = process.env.OBJECT_SERVICE_URL || 'http://object-service:3003';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const claimDefs = [
  { 
    userEmail: 'admin@uninorte.edu.co', 
    objectName: 'MacBook Pro M1',
    evidences: [
      { type: 'SERIAL_NUMBER', description: 'Número de serie: C02FG821Q05D.' },
      { type: 'DETAILED_DESCRIPTION', description: 'Tiene un sticker de React en la esquina superior izquierda y un pequeño raspón en la base de aluminio.' }
    ]
  },
  { 
    userEmail: 'carre@uninorte.edu.co', 
    objectName: 'iPad Air 2023',
    evidences: [
      { type: 'SERIAL_NUMBER', description: 'Número de serie: GGH9210AL81X.' },
      { type: 'DETAILED_DESCRIPTION', description: 'Viene en una funda magnética de color verde menta con un Apple Pencil acoplado al lateral.' }
    ]
  },
  { 
    userEmail: 'sebas@uninorte.edu.co', 
    objectName: 'Termo Contigo Azul',
    evidences: [
      { type: 'DETAILED_DESCRIPTION', description: 'Termo azul metálico con el logo de Contigo un poco borrado en la parte inferior por el uso continuo.' }
    ]
  },
  { 
    userEmail: 'admin@uninorte.edu.co', 
    objectName: 'Cargador USB-C Samsung',
    evidences: [
      { type: 'DETAILED_DESCRIPTION', description: 'Cargador de pared de carga rápida, color negro, con cable trenzado de 2 metros.' }
    ]
  },
  { 
    userEmail: 'carre@uninorte.edu.co', 
    objectName: 'Mochila Jansport Gris',
    evidences: [
      { type: 'DETAILED_DESCRIPTION', description: 'Mochila Jansport gris oscuro que tiene un llavero de metal de Darth Vader pegado en el cierre del bolsillo mediano.' }
    ]
  },
  { 
    userEmail: 'sebas@uninorte.edu.co', 
    objectName: 'Audífonos Sony WH-1000XM4',
    evidences: [
      { type: 'SERIAL_NUMBER', description: 'Número de serie: SN-SONY-99281A.' },
      { type: 'DETAILED_DESCRIPTION', description: 'Audífonos over-ear negros en su estuche de viaje rígido original, con un adaptador para avión adentro.' }
    ]
  },
  { 
    userEmail: 'admin@uninorte.edu.co', 
    objectName: 'Lentes de Sol Ray-Ban',
    evidences: [
      { type: 'DETAILED_DESCRIPTION', description: 'Gafas de sol de aviador con marco dorado y lentes verdes oscuros, guardadas en su estuche marrón de cuero.' }
    ]
  },
  { 
    userEmail: 'carre@uninorte.edu.co', 
    objectName: 'Calculadora Científica Casio',
    evidences: [
      { type: 'DETAILED_DESCRIPTION', description: 'Calculadora Casio FX-991 que tiene mi nombre "Luis R." escrito en la tapa trasera con marcador permanente negro.' }
    ]
  },
  { 
    userEmail: 'sebas@uninorte.edu.co', 
    objectName: 'Carné Estudiantil',
    evidences: [
      { type: 'DETAILED_DESCRIPTION', description: 'Carné de estudiante de la Universidad del Norte con nombre Sebastian Ibañez y código estudiantil 200123456.' }
    ]
  },
  { 
    userEmail: 'admin@uninorte.edu.co', 
    objectName: 'Chaqueta Deportiva Nike',
    evidences: [
      { type: 'DETAILED_DESCRIPTION', description: 'Chaqueta impermeable negra marca Nike, talla M, con capota y bolsillos con cremallera en ambos lados.' }
    ]
  }
];

async function main() {
  console.log('🌱 Sincronizando datos para seed de reclamaciones...');
  
  // Limpiar tablas de evidencias y reclamos para evitar conflictos
  await prisma.evidence.deleteMany();
  await prisma.claim.deleteMany();

  let users, objects;
  try {
    [users, objects] = await Promise.all([
      httpGet(`${USER_API}/users`),
      httpGet(`${OBJECT_API}/objects?page=1&limit=200`),
    ]);
  } catch (e) {
    console.log(`⚠️  Error conectando servicios: ${e.message}`);
    return;
  }

  if (!Array.isArray(users)) {
    console.log('⚠️  Formato de usuarios inesperado');
    return;
  }

  const userMap = {};
  for (const u of users) userMap[u.email] = u;

  const objectList = objects.items || objects;
  const objectMap = {};
  for (const o of objectList) objectMap[o.name] = o;

  let created = 0;
  for (const cd of claimDefs) {
    const user = userMap[cd.userEmail];
    const object = objectMap[cd.objectName];

    if (!user || !object) {
      console.log(`  ⚠️  No se encontró ${cd.userEmail} o ${cd.objectName}`);
      continue;
    }

    const existing = await prisma.claim.findFirst({
      where: { userId: user.id, objectId: object.id },
    });
    if (existing) continue;

    await prisma.claim.create({
      data: { 
        userId: user.id, 
        objectId: object.id, 
        status: 'PENDING',
        evidences: {
          create: cd.evidences.map(ev => ({
            type: ev.type,
            description: ev.description
          }))
        }
      },
    });
    created++;
  }

  console.log(`✅ ${created} reclamaciones con evidencias creadas.`);
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e.message); })
  .finally(async () => { await prisma.$disconnect(); });
