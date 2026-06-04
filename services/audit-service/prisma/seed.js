const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function canonicalizeForHash(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalizeForHash);
  if (value && typeof value === 'object') {
    const sortedKeys = Object.keys(value).sort();
    const result = {};
    for (const key of sortedKeys) result[key] = canonicalizeForHash(value[key]);
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

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function main() {
  console.log('🌱 Iniciando seeder de auditoría masivo...');
  await prisma.auditLog.deleteMany({});

  const adminId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
  const studentIds = [
    's1s1s1s1-s1s1-s1s1-s1s1-s1s1s1s1s1s1',
    's2s2s2s2-s2s2-s2s2-s2s2-s2s2s2s2s2s2',
    's3s3s3s3-s3s3-s3s3-s3s3-s3s3s3s3s3s3',
    's4s4s4s4-s4s4-s4s4-s4s4-s4s4s4s4s4s4',
  ];

  const events = [
    { action: 'SYSTEM_INIT', entityType: 'SYSTEM', entityId: 'system-0', actorId: 'system', actorRole: 'SYSTEM', result: 'SUCCESS', details: 'Sistema de objetos perdidos inicializado.', offset: 0 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-macbook', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'MacBook Pro M1 registrado en inventario.', offset: 5 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-termo', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Termo Contigo Azul registrado.', offset: 6 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-chaqueta', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Chaqueta Deportiva Nike registrada.', offset: 7 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-calculadora', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Calculadora Casio registrada.', offset: 8 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-ipad', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'iPad Air 2023 registrado.', offset: 9 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-001', actorId: studentIds[0], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Andrés Carrero para MacBook Pro.', offset: 15 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-002', actorId: studentIds[1], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Sebastian Ibañez para Chaqueta Nike.', offset: 18 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-003', actorId: studentIds[0], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Andrés Carrero para Termo.', offset: 20 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-004', actorId: studentIds[2], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por María García para iPad Air.', offset: 22 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-005', actorId: studentIds[3], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Juan Pérez para Calculadora Casio.', offset: 24 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-006', actorId: studentIds[1], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Sebastian Ibañez para Cargador USB-C.', offset: 26 },
    { action: 'CLAIM_VERIFIED', entityType: 'CLAIM', entityId: 'claim-002', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Reclamación de Chaqueta Nike aprobada.', offset: 30 },
    { action: 'CLAIM_VERIFIED', entityType: 'CLAIM', entityId: 'claim-003', actorId: adminId, actorRole: 'ADMIN', result: 'FAILURE', details: 'Reclamación de Termo rechazada: evidencias no coinciden con el objeto.', offset: 35 },
    { action: 'CLAIM_VERIFIED', entityType: 'CLAIM', entityId: 'claim-004', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Reclamación de iPad Air aprobada.', offset: 40 },
    { action: 'CLAIM_UPDATED', entityType: 'CLAIM', entityId: 'claim-005', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Estado actualizado a REJECTED por falta de evidencias.', offset: 42 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-audifonos', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Audífonos Sony registrados en inventario.', offset: 45 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-billetera', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Billetera de cuero registrada.', offset: 46 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-reloj', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Reloj Casio dorado registrado.', offset: 47 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-007', actorId: studentIds[2], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por María García para Billetera.', offset: 50 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-008', actorId: studentIds[3], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Juan Pérez para Reloj.', offset: 52 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-009', actorId: studentIds[0], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Andrés Carrero para Audífonos Sony.', offset: 55 },
    { action: 'OBJECT_UPDATED', entityType: 'OBJECT', entityId: 'obj-macbook', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Descripción de MacBook actualizada con más detalles.', offset: 58 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-paraguas', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Paraguas negro registrado.', offset: 60 },
    { action: 'OBJECT_CREATED', entityType: 'OBJECT', entityId: 'obj-mochila', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Mochila Jansport registrada.', offset: 62 },
    { action: 'CLAIM_CREATED', entityType: 'CLAIM', entityId: 'claim-010', actorId: studentIds[1], actorRole: 'STUDENT', result: 'SUCCESS', details: 'Reclamación creada por Sebastian Ibañez para Mochila Jansport.', offset: 65 },
    { action: 'CLAIM_VERIFIED', entityType: 'CLAIM', entityId: 'claim-007', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Reclamación de Billetera aprobada.', offset: 70 },
    { action: 'CLAIM_VERIFIED', entityType: 'CLAIM', entityId: 'claim-008', actorId: adminId, actorRole: 'ADMIN', result: 'FAILURE', details: 'Reclamación de Reloj rechazada: descripción no coincide.', offset: 72 },
    { action: 'OBJECT_DELETED', entityType: 'OBJECT', entityId: 'obj-cable-hdmi', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Cable HDMI retirado del inventario (fue reclamado por el dueño).', offset: 75 },
    { action: 'CLAIM_VERIFIED', entityType: 'CLAIM', entityId: 'claim-010', actorId: adminId, actorRole: 'ADMIN', result: 'SUCCESS', details: 'Reclamación de Mochila aprobada.', offset: 78 },
    { action: 'ACCESS_DENIED', entityType: 'CLAIM', entityId: 'claim-001', actorId: studentIds[3], actorRole: 'STUDENT', result: 'DENIED', details: 'Intento de acceso no autorizado a reclamación ajena.', offset: 80 },
  ];

  const baseTime = new Date("2026-05-28T12:00:00.000Z");
  let previousHash = null;

  for (const event of events) {
    const entry = {
      id: uuid(),
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      actorId: event.actorId,
      actorRole: event.actorRole,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      previousHash,
      payload: { ...event, timestamp: undefined, offset: undefined, previousHash: undefined },
      result: event.result,
      details: event.details,
      timestamp: new Date(baseTime.getTime() + event.offset * 60000),
    };
    entry.hash = calculateHash(entry);
    previousHash = entry.hash;

    await prisma.auditLog.create({ data: entry });
  }

  const total = await prisma.auditLog.count();
  console.log(`✅ ${total} registros de auditoría creados con blockchain hash-linked.`);
  console.log(`   Último hash: ${previousHash.substring(0, 16)}...`);
  console.log('🌱 Seeding de auditoría completado con éxito!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
