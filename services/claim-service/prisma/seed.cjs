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
  { userEmail: 'admin@uninorte.edu.co', objectName: 'MacBook Pro M1' },
  { userEmail: 'carre@uninorte.edu.co', objectName: 'iPad Air 2023' },
  { userEmail: 'sebas@uninorte.edu.co', objectName: 'Termo Contigo Azul' },
  { userEmail: 'admin@uninorte.edu.co', objectName: 'Cargador USB-C Samsung' },
  { userEmail: 'carre@uninorte.edu.co', objectName: 'Mochila Jansport Gris' },
  { userEmail: 'sebas@uninorte.edu.co', objectName: 'Audífonos Sony WH-1000XM4' },
  { userEmail: 'admin@uninorte.edu.co', objectName: 'Lentes de Sol Ray-Ban' },
  { userEmail: 'carre@uninorte.edu.co', objectName: 'Calculadora Científica Casio' },
  { userEmail: 'sebas@uninorte.edu.co', objectName: 'Carné Estudiantil' },
  { userEmail: 'admin@uninorte.edu.co', objectName: 'Chaqueta Deportiva Nike' },
];

async function main() {
  console.log('🌱 Sincronizando datos para seed de reclamaciones...');

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
      data: { userId: user.id, objectId: object.id, status: 'PENDING' },
    });
    created++;
  }

  console.log(`✅ ${created} reclamaciones creadas.`);
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e.message); })
  .finally(async () => { await prisma.$disconnect(); });
