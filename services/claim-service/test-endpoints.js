async function runTests() {
  console.log('🧪 Iniciando pruebas de E2E a la API...');
  const claimsApiBaseUrl = process.env.CLAIMS_API_BASE_URL;
  if (!claimsApiBaseUrl) {
    throw new Error(
      'CLAIMS_API_BASE_URL no esta configurada. Ejemplo: CLAIMS_API_BASE_URL=http://<host>:<port>',
    );
  }

  const API_URL = `${claimsApiBaseUrl.replace(/\/+$/, '')}/claims`;

  // Obtener IDs de la base de datos (requerimos leerlos de prisma o asumir cómo obtenerlos)
  // Para este test, la base de datos está recién seedeada. Vamos a buscar los IDs vía Prisma (solo para el script de prueba)
  const { PrismaClient } = require('@prisma/client');
  const { Pool } = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  const user = await prisma.user.findFirst();
  const electronic = await prisma.object.findFirst({ where: { category: 'ELECTRONIC' } });
  const common = await prisma.object.findFirst({ where: { category: 'COMMON' } });

  console.log('\n--- PRUEBA 1: Regla Crítica (Objeto sin Fotografía) ---');
  const res1 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      objectId: common.id,
      objectCategory: 'COMMON',
      evidences: [
        { type: 'REFERENCE_PHOTO', url: 'http://foto.com' },
        { type: 'DETAILED_DESCRIPTION', description: 'Es azul' }
      ]
    })
  });
  const data1 = await res1.json();
  console.log('Estado HTTP:', res1.status);
  console.log('Respuesta:', data1.message || data1);

  console.log('\n--- PRUEBA 2: Abstract Factory (Electrónico sin Factura/Serie) ---');
  const res2 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      objectId: electronic.id,
      objectCategory: 'ELECTRONIC',
      evidences: [
        { type: 'REFERENCE_PHOTO', url: 'http://foto.com' } // Evidencia incorrecta para electrónico
      ]
    })
  });
  const data2 = await res2.json();
  console.log('Estado HTTP:', res2.status);
  console.log('Respuesta:', data2.message || data2);

  console.log('\n--- PRUEBA 3: Creación Exitosa (Electrónico con Serie) ---');
  const res3 = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      objectId: electronic.id,
      objectCategory: 'ELECTRONIC',
      evidences: [
        { type: 'SERIAL_NUMBER', description: 'SN-123456789' } // Evidencia correcta
      ]
    })
  });
  const data3 = await res3.json();
  console.log('Estado HTTP:', res3.status);
  console.log('Respuesta Reclamación Creada:', data3.id ? '✅ Creado con ID: ' + data3.id : data3);

  console.log('\n--- PRUEBA 4: Intentar Editar Reclamación Aprobada (Validación de Ciclo de Vida) ---');
  // 1. Simular la aprobación directa en BD
  await prisma.claim.update({ where: { id: data3.id }, data: { status: 'APPROVED' } });
  
  // 2. Intentar editarla por API
  const res4 = await fetch(`${API_URL}/${data3.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'REJECTED' })
  });
  const data4 = await res4.json();
  console.log('Estado HTTP:', res4.status);
  console.log('Respuesta:', data4.message || data4);

  await prisma.$disconnect();
  console.log('\n🧪 Pruebas finalizadas.');
}

runTests();
