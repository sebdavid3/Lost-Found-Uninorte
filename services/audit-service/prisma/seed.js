const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function canonicalizeForHash(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(canonicalizeForHash);
  }

  if (value && typeof value === 'object') {
    const record = value;
    const sortedKeys = Object.keys(record).sort();
    const result = {};
    for (const key of sortedKeys) {
      result[key] = canonicalizeForHash(record[key]);
    }
    return result;
  }

  return value;
}

function calculateHash(entry) {
  const content = JSON.stringify({
    id: entry.id,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    actorId: entry.actorId,
    actorRole: entry.actorRole,
    ipAddress: entry.ipAddress,
    timestamp: entry.timestamp.toISOString(),
    payload: canonicalizeForHash(entry.payload),
    result: entry.result,
    details: entry.details,
    previousHash: entry.previousHash,
  });
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  console.log('🌱 Iniciando seeder de auditoría...');
  
  await prisma.auditLog.deleteMany({});
  
  // 1. Genesis Log
  const timestamp1 = new Date("2026-05-28T12:00:00.000Z");
  const entry1 = {
    id: "00000000-0000-0000-0000-000000000001",
    action: 'SYSTEM_INIT',
    entityType: 'SYSTEM',
    entityId: '00000000-0000-0000-0000-000000000000',
    actorId: 'system',
    actorRole: 'SYSTEM',
    ipAddress: '127.0.0.1',
    previousHash: null,
    payload: {},
    result: 'SUCCESS',
    details: 'Sistema de objetos perdidos inicializado.',
    timestamp: timestamp1,
  };
  entry1.hash = calculateHash(entry1);
  
  await prisma.auditLog.create({ data: entry1 });
  console.log('✅ Genesis log creado con hash:', entry1.hash);

  // 2. Second Log
  const timestamp2 = new Date("2026-05-28T12:05:00.000Z");
  const entry2 = {
    id: "00000000-0000-0000-0000-000000000002",
    action: 'CLAIM_CREATED',
    entityType: 'CLAIM',
    entityId: '522f6108-08e6-4ae4-8b0b-37ee6c902c79',
    actorId: 'f767a95d-d969-497c-b9fb-d1756f1b5381',
    actorRole: 'STUDENT',
    ipAddress: '192.168.1.15',
    previousHash: entry1.hash,
    payload: { claimId: '522f6108-08e6-4ae4-8b0b-37ee6c902c79' },
    result: 'SUCCESS',
    details: 'Reclamación creada por Andrés Carrero para MacBook Pro M1.',
    timestamp: timestamp2,
  };
  entry2.hash = calculateHash(entry2);

  await prisma.auditLog.create({ data: entry2 });
  console.log('✅ Segundo log creado con hash:', entry2.hash);

  // 3. Third Log
  const timestamp3 = new Date("2026-05-28T12:10:00.000Z");
  const entry3 = {
    id: "00000000-0000-0000-0000-000000000003",
    action: 'CLAIM_VERIFIED',
    entityType: 'CLAIM',
    entityId: '522f6108-08e6-4ae4-8b0b-37ee6c902c79',
    actorId: '8c85a367-5dda-4715-8fde-84ae16ebd02f',
    actorRole: 'ADMIN',
    ipAddress: '192.168.1.20',
    previousHash: entry2.hash,
    payload: { claimId: '522f6108-08e6-4ae4-8b0b-37ee6c902c79', verified: true },
    result: 'SUCCESS',
    details: 'Reclamación aprobada por el administrador.',
    timestamp: timestamp3,
  };
  entry3.hash = calculateHash(entry3);

  await prisma.auditLog.create({ data: entry3 });
  console.log('✅ Tercer log creado con hash:', entry3.hash);

  console.log('🌱 Seeding de auditoría completado con éxito!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
